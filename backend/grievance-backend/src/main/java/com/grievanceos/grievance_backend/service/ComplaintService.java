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
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final WardRepository wardRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final NotificationService notificationService;

    private final EmailService emailService;

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371; // Earth's radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c * 1000; // to meters
    }

    // single helper used everywhere
    private ComplaintResponse mapToResponse(Complaint c) {
        String wardName = null;
        String assignedOfficialName = null;

        // Get ward name if ward is assigned
        if (c.getWardId() != null) {
            wardName = wardRepository.findById(c.getWardId())
                    .map(Ward::getName)
                    .orElse(null);
        }

        // Get official name - either directly assigned OR from ward escalation
        if (c.getAssignedTo() != null) {
            assignedOfficialName = userRepository.findById(c.getAssignedTo())
                    .map(User::getFullName)
                    .orElse(null);
        } else if (c.getWardId() != null) {
            Ward ward = wardRepository.findById(c.getWardId()).orElse(null);
            if (ward != null && ward.getEscalationUserId() != null) {
                assignedOfficialName = userRepository.findById(ward.getEscalationUserId())
                        .map(User::getFullName)
                        .orElse(null);
            }
        }

        return ComplaintResponse.builder()
                .id(c.getId())
                .title(c.getTitle())
                .category(c.getCategory())
                .priority(c.getPriority())
                .status(c.getStatus())
                .latitude(c.getLocation() != null ? c.getLocation().getY() : null)
                .longitude(c.getLocation() != null ? c.getLocation().getX() : null)
                .wardId(c.getWardId())
                .wardName(wardName)
                .assignedOfficialName(assignedOfficialName)
                .slaDeadline(c.getSlaDeadline())
                .addressText(c.getAddressText())
                .createdAt(c.getCreatedAt())
                .build();
    }

    public ComplaintResponse createComplaint(CreateComplaintRequest request, UUID citizenId) {
        Point location = null;
        if (request.getLongitude() != null && request.getLatitude() != null) {
            log.info("Filing complaint at: {}, {}", request.getLatitude(), request.getLongitude());
            GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);
            location = geometryFactory.createPoint(
                    new Coordinate(request.getLongitude(), request.getLatitude())
            );
        }

        Ward ward = null;
        UUID assignedOfficialId = null;

        if(request.getLongitude() != null && request.getLatitude() != null) {
            List<User> onlineOfficials = userRepository.findOnlineOfficials(ZonedDateTime.now().minusMinutes(30));
            log.info("Found {} online officials", onlineOfficials.size());

            User nearestOfficial = null;
            double minDistance = Double.MAX_VALUE;

            for(User official: onlineOfficials) {
                if(official.getLastLocation() != null) {
                    double distance = calculateDistance(request.getLatitude(),
                            request.getLongitude(),
                            official.getLastLocation().getY(),
                            official.getLastLocation().getX());

                    log.info("Official {}: distance = {} meters", official.getFullName(), distance);

                    if(distance < 50000 && distance < minDistance) {  // 50km radius
                        minDistance = distance;
                        nearestOfficial = official;
                        log.info("New nearest official: {}", official.getFullName());
                    }
                }
            }

            if(nearestOfficial != null) {
                assignedOfficialId = nearestOfficial.getId();
                log.info("✓ Assigned to official: {}", nearestOfficial.getFullName());
            }
            else {
                log.info("✗ No nearby official, assigning to ward");
                ward = wardRepository.findWardContainingPoint(request.getLatitude(), request.getLongitude()).orElse(null);
            }
        }

        Complaint complaint = Complaint.builder()
                .citizenId(citizenId)
                .title(request.getTitle())
                .category(request.getComplaintCategory())
                .description(request.getDescription())
                .location(location)
                .assignedTo(assignedOfficialId)
                .addressText(request.getAddressText())
                .wardId(ward != null ? ward.getId() : null)
                .status(ComplaintStatus.OPEN)
                .priority(request.getPriority())
                .slaDeadline(ZonedDateTime.now().plusHours(48))  // Always 48h SLA
                .build();

        Complaint savedComplaint = complaintRepository.save(complaint);

        // Send email
        User citizen = userRepository.findById(citizenId).orElse(null);
        if(citizen != null) {
            String wardName = ward != null ? ward.getName() : "Assigned to nearest official";
            String officialName = assignedOfficialId != null
                    ? userRepository.findById(assignedOfficialId).map(User::getFullName).orElse(null)
                    : (ward != null && ward.getEscalationUserId() != null ? userRepository.findById(ward.getEscalationUserId())
                    .map(User::getFullName)
                    .orElse(null)
                    : null);
            emailService.sendComplaintConfirmation(savedComplaint, citizen.getEmail(), wardName, officialName);
        }

        // Set Redis SLA
        redisTemplate.opsForValue().set(
                "sla:" + savedComplaint.getId(),
                "",
                Duration.ofHours(48)
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
        Set<UUID> complaintIds = new HashSet<>();
        List<Complaint> complaints = new ArrayList<>();

        // First, get directly assigned complaints
        List<Complaint> directlyAssigned = complaintRepository.findByAssignedTo(officialId);
        for (Complaint c : directlyAssigned) {
            if (complaintIds.add(c.getId())) {
                complaints.add(c);
            }
        }

        // Then get ward-based complaints
        if (wardId != null) {
            List<Complaint> wardComplaints = complaintRepository.findByWardId(wardId);
            for (Complaint c : wardComplaints) {
                if (complaintIds.add(c.getId())) {
                    complaints.add(c);
                }
            }
        }


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

    public List<ComplaintResponse> getRecentResolved() {
        return complaintRepository.findRecentlyResolved(ZonedDateTime.now().minusHours(24))
                .stream()
                .limit(3)
                .map(this::mapToResponse)
                .toList();
    }
}