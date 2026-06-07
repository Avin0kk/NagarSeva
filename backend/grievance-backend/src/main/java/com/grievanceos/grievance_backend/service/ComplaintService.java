package com.grievanceos.grievance_backend.service;

import com.grievanceos.grievance_backend.dto.request.CreateComplaintRequest;
import com.grievanceos.grievance_backend.dto.request.UpdateComplaintStatusRequest;
import com.grievanceos.grievance_backend.dto.response.ComplaintResponse;
import com.grievanceos.grievance_backend.dto.response.MapComplaintResponse;
import com.grievanceos.grievance_backend.enums.ComplaintStatus;
import com.grievanceos.grievance_backend.enums.Role;
import com.grievanceos.grievance_backend.model.Complaint;
import com.grievanceos.grievance_backend.model.StatusHistory;
import com.grievanceos.grievance_backend.model.User;
import com.grievanceos.grievance_backend.model.Ward;
import com.grievanceos.grievance_backend.repository.ComplaintRepository;
import com.grievanceos.grievance_backend.repository.StatusHistoryRepository;
import com.grievanceos.grievance_backend.repository.UserRepository;
import com.grievanceos.grievance_backend.repository.WardRepository;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.ZonedDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final WardRepository wardRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final NotificationService notificationService;

    private final EmailService emailService;

    // single helper used everywhere
    private ComplaintResponse mapToResponse(Complaint c) {
        String wardName = null;
        String officialName = null;

        if (c.getWardId() != null) {
            Ward ward = wardRepository.findById(c.getWardId()).orElse(null);
            if (ward != null) {
                wardName = ward.getName();
                if (ward.getEscalationUserId() != null) {
                    User official = userRepository.findById(ward.getEscalationUserId()).orElse(null);
                    if (official != null) {
                        officialName = official.getFullName();
                    }
                }
            }
        }

        return ComplaintResponse.builder()
                .id(c.getId())
                .title(c.getTitle())
                .status(c.getStatus())
                .priority(c.getPriority())
                .category(c.getCategory())
                .createdAt(c.getCreatedAt())
                .slaDeadline(c.getSlaDeadline())
                .wardId(c.getWardId())
                .wardName(wardName)
                .assignedOfficialName(officialName)
                .addressText(c.getAddressText())
                .latitude(c.getLocation() != null ? c.getLocation().getY() : null)
                .longitude(c.getLocation() != null ? c.getLocation().getX() : null)
                .build();
    }

    public ComplaintResponse createComplaint(CreateComplaintRequest request, UUID citizenId) {
        Point location = null;
        if (request.getLongitude() != null && request.getLatitude() != null) {
            GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);
            location = geometryFactory.createPoint(
                    new Coordinate(request.getLongitude(), request.getLatitude())
            );
        }

        Ward ward = wardRepository.findWardContainingPoint(request.getLatitude(), request.getLongitude())
                .orElse(null);

        Complaint complaint = Complaint.builder()
                .citizenId(citizenId)
                .title(request.getTitle())
                .category(request.getComplaintCategory())
                .description(request.getDescription())
                .location(location)
                .addressText(request.getAddressText())
                .wardId(ward != null ? ward.getId() : null)
                .status(ComplaintStatus.OPEN)
                .priority(request.getPriority())
                .slaDeadline(ward != null ?
                        ZonedDateTime.now().plusHours(ward.getSlaHours()) :
                        ZonedDateTime.now().plusHours(48))
                .build();

        Complaint savedComplaint = complaintRepository.save(complaint);

        User citizen = userRepository.findById(citizenId).orElse(null);
        if(citizen != null) {
            String wardName = ward != null ? ward.getName() : null;
            String officialName = ward != null && ward.getEscalationUserId() != null ? userRepository.findById(ward.getEscalationUserId())
                    .map(User::getFullName)
                    .orElse(null)
                    : null;
            emailService.sendComplaintConfirmation(savedComplaint, citizen.getEmail(), wardName, officialName);
        }

        long slaHours = ward != null ? ward.getSlaHours() : 48;
        redisTemplate.opsForValue().set(
                "sla:" + savedComplaint.getId(),
                "",
                Duration.ofHours(slaHours)
        );

        return mapToResponse(savedComplaint);
    }

    public List<ComplaintResponse> getComplaint(UUID citizenId) {
        return complaintRepository.findByCitizenId(citizenId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ComplaintResponse getComplaintById(UUID complaintId, UUID citizenId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        if (!complaint.getCitizenId().equals(citizenId)) {
            throw new RuntimeException("Access denied");
        }

        return mapToResponse(complaint);
    }

    public ComplaintResponse updateStatus(UUID complaintId, @NotNull UpdateComplaintStatusRequest request) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        ComplaintStatus oldStatus = complaint.getStatus();
        complaint.setStatus(request.getStatus());

        if (request.getStatus() == ComplaintStatus.RESOLVED) {
            complaint.setResolvedAt(ZonedDateTime.now());
            redisTemplate.delete("sla:" + complaintId);
        }

        Complaint savedComplaint = complaintRepository.save(complaint);

        notificationService.sendComplaintUpdate(savedComplaint.getId().toString(),
                "Complaint status changed from " + oldStatus + " to " + savedComplaint.getStatus() + " for the complaint: " + savedComplaint.getTitle());

        if (request.getChangedBy() != null) {
            StatusHistory history = StatusHistory.builder()
                    .complaintId(complaint.getId())
                    .changedBy(request.getChangedBy())
                    .fromStatus(oldStatus)
                    .toStatus(request.getStatus())
                    .note(request.getNote())
                    .build();
            statusHistoryRepository.save(history);
        }

        return mapToResponse(savedComplaint);
    }

    public List<MapComplaintResponse> getMapComplaint() {

        List<Complaint> open = complaintRepository.findByStatus(ComplaintStatus.OPEN);
        List<Complaint> resolved = complaintRepository.findRecentlyResolved(ZonedDateTime.now().minusHours(24));

        List<Complaint> all = new java.util.ArrayList<>();
        all.addAll(open);
        all.addAll(resolved);
        return all.stream()
                .filter(c -> c.getLocation() != null)
                .map(c -> MapComplaintResponse.builder()
                        .id(c.getId())
                        .title(c.getTitle())
                        .category(c.getCategory())
                        .status(c.getStatus())
                        .latitude(c.getLocation().getY())
                        .longitude(c.getLocation().getX())
                        .addressText(c.getAddressText())
                        .priority(c.getPriority())
                        .build())
                .toList();
    }

    public List<ComplaintResponse> getOfficialQueue(UUID officialId, UUID wardId) {
        List<Complaint> complaints = wardId != null
                ? complaintRepository.findByWardId(wardId)
                : complaintRepository.findByAssignedTo(officialId);

        complaints.sort(Comparator.comparing(
                Complaint::getSlaDeadline,
                Comparator.nullsLast(Comparator.naturalOrder())
        ));

        return complaints.stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ComplaintResponse> getAllComplaints() {
       return complaintRepository.findAll()
               .stream()
               .map(this::mapToResponse)
               .toList();
    }

    public Map<String, Object> getAdminStats() {
        List<Complaint> all = complaintRepository.findAll();

        long total = all.size();
        long open = all.stream().filter(c -> c.getStatus() == ComplaintStatus.OPEN).count();
        long inProgress = all.stream().filter(c -> c.getStatus() == ComplaintStatus.IN_PROGRESS).count();
        long escalated = all.stream().filter(c -> c.getStatus() == ComplaintStatus.ESCALATED).count();
        long resolved = all.stream().filter(c -> c.getStatus() == ComplaintStatus.RESOLVED).count();

        return Map.of(
                "total", total,
                "open", open,
                "inProgress", inProgress,
                "escalated", escalated,
                "resolved", resolved
        );
    }

    public List<Map<String, Object>> getOfficialsList() {
        List<User> officials = userRepository.findByRole(Role.OFFICIAL);

        return officials.stream().map(official -> {

            long complaintCount =
                    complaintRepository.countByWardId(official.getWardId());

            Ward ward = official.getWardId() != null
                    ? wardRepository.findById(official.getWardId()).orElse(null)
                    : null;

            Map<String, Object> map = new HashMap<>();

            map.put("id", official.getId());
            map.put("name", official.getFullName());
            map.put("email", official.getEmail());
            map.put("phone", official.getPhone());
            map.put("ward", ward != null ? ward.getName() : "Unassigned");
            map.put("complaints", complaintCount);

            return map;

        }).toList();
    }
}