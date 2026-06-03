package com.grievanceos.grievance_backend.service;

import com.grievanceos.grievance_backend.dto.request.CreateComplaintRequest;
import com.grievanceos.grievance_backend.dto.request.UpdateComplaintStatusRequest;
import com.grievanceos.grievance_backend.dto.response.ComplaintResponse;
import com.grievanceos.grievance_backend.dto.response.MapComplaintResponse;
import com.grievanceos.grievance_backend.enums.ComplaintStatus;
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
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final WardRepository wardRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final RedisTemplate<String, String> redisTemplate;

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
        return complaintRepository.findByStatus(ComplaintStatus.OPEN)
                .stream()
                .filter(c -> c.getLocation() != null)
                .map(c -> MapComplaintResponse.builder()
                        .id(c.getId())
                        .title(c.getTitle())
                        .category(c.getCategory())
                        .status(c.getStatus())
                        .latitude(c.getLocation().getY())
                        .longitude(c.getLocation().getX())
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
}