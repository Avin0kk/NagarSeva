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
import com.grievanceos.grievance_backend.repository.WardRepository;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisAccessor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;

import java.time.Duration;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final WardRepository wardRepository;
    private final RedisTemplate<String, String> redisTemplate;

    public ComplaintResponse createComplaint(CreateComplaintRequest request, UUID citizenId) {
        Point location = null;
        if(request.getLongitude() != null && request.getLatitude() != null) {
            GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);
            location = geometryFactory.createPoint(
                    new Coordinate(request.getLongitude(),request.getLatitude())
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
                .wardId(ward!=null ? ward.getId():null)
                .status(ComplaintStatus.OPEN)
                .priority(request.getPriority())
                .slaDeadline(ward!=null ?
                        ZonedDateTime.now().plusHours(ward.getSlaHours()) :
                        ZonedDateTime.now().plusHours(48))
                .build();

        long slaHours = ward!=null ? ward.getSlaHours() : 48;

        Complaint savedComplaint = complaintRepository.save(complaint);

        redisTemplate.opsForValue().set(
                "sla:" + savedComplaint.getId(),
                "",
                Duration.ofHours(slaHours)
        );

        return ComplaintResponse.builder()
                .id(savedComplaint.getId())
                .title(savedComplaint.getTitle())
                .status(savedComplaint.getStatus())
                .priority(savedComplaint.getPriority())
                .createdAt(savedComplaint.getCreatedAt())
                .wardId(ward != null ? ward.getId() : null)
                .build();
    }

    public List<ComplaintResponse> getComplaint(UUID citizenId) {
        List<Complaint> complaints = complaintRepository.findByCitizenId(citizenId);

        return complaints.stream()
                .map(c -> ComplaintResponse.builder()
                        .id(c.getId())
                        .title(c.getTitle())
                        .status(c.getStatus())
                        .priority(c.getPriority())
                        .createdAt(c.getCreatedAt())
                        .build()
                )
                .toList();
    }

    public ComplaintResponse getComplaintById(UUID complaintId, UUID citizenId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        if(!complaint.getCitizenId().equals(citizenId)) {
            throw new RuntimeException("Access denied");
        }

        return ComplaintResponse.builder()
                .id(complaint.getId())
                .title(complaint.getTitle())
                .status(complaint.getStatus())
                .priority(complaint.getPriority())
                .createdAt(complaint.getCreatedAt())
                .build();
    }

    public ComplaintResponse updateStatus(UUID complaintId, @NotNull UpdateComplaintStatusRequest request) {

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        ComplaintStatus oldStatus = complaint.getStatus();

        complaint.setStatus(request.getStatus());
        if(request.getStatus() == ComplaintStatus.RESOLVED) {
            complaint.setResolvedAt(ZonedDateTime.now());
            redisTemplate.delete("sla:" + complaintId);
        }

        Complaint savedComplaint = complaintRepository.save(complaint);

        StatusHistory history = StatusHistory.builder()
                .complaintId(complaint.getId())
                .changedBy(request.getChangedBy())
                .fromStatus(oldStatus)
                .toStatus(request.getStatus())
                .note(request.getNote())
                .build();

        return ComplaintResponse.builder()
                .id(savedComplaint.getId())
                .title(savedComplaint.getTitle())
                .status(savedComplaint.getStatus())
                .priority(savedComplaint.getPriority())
                .createdAt(savedComplaint.getCreatedAt())
                .build();
    }

    public List<MapComplaintResponse> getMapComplaint() {
        List<Complaint> complaints = complaintRepository.findByStatus(ComplaintStatus.OPEN);

        return complaints.stream()
                .filter(c -> c.getLocation()!=null)
                .map(c-> MapComplaintResponse.builder()
                        .id(c.getId())
                        .title(c.getTitle())
                        .category(c.getCategory())
                        .status(c.getStatus())
                        .latitude(c.getLocation().getY())
                        .longitude(c.getLocation().getX())
                        .build())
                .toList();
    }
}
