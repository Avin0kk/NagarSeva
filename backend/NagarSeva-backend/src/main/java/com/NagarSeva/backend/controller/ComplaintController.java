package com.NagarSeva.backend.controller;


import com.NagarSeva.backend.dto.request.CreateComplaintRequest;
import com.NagarSeva.backend.dto.request.UpdateComplaintStatusRequest;
import com.NagarSeva.backend.dto.response.ComplaintResponse;
import com.NagarSeva.backend.dto.response.MapComplaintResponse;
import com.NagarSeva.backend.dto.response.WardHeatmapResponse;
import com.NagarSeva.backend.model.Complaint;
import com.NagarSeva.backend.model.User;
import com.NagarSeva.backend.model.Ward;
import com.NagarSeva.backend.repository.ComplaintRepository;
import com.NagarSeva.backend.repository.UserRepository;
import com.NagarSeva.backend.service.ComplaintService;
import com.NagarSeva.backend.service.EmailService;
import com.NagarSeva.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final UserService userService;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User Not found"));
        return user;
    }

    @PostMapping("/create-complaint")
    public ResponseEntity<ComplaintResponse> createComplaint(@Valid @RequestBody CreateComplaintRequest request) {
        User user = getCurrentUser();
        UUID citizenId = user.getId();

        return ResponseEntity.ok(
                complaintService.createComplaint(
                        request,
                        citizenId
                )
        );
    }

    @GetMapping("/my-complaints")
    public ResponseEntity<List<ComplaintResponse>> getComplaint(UUID citizenId) {
        User user = getCurrentUser();
        return ResponseEntity.ok(complaintService.getComplaint(user.getId()));
    }

    @GetMapping("/my-complaints/{id}")
    public ResponseEntity<ComplaintResponse> getComplaintById(@PathVariable UUID id) {
        User user = getCurrentUser();
        return ResponseEntity.ok(complaintService.getComplaintById(id, user.getId()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ComplaintResponse> updateStatus(@PathVariable UUID id,
                                                          @RequestBody UpdateComplaintStatusRequest request) {

        return ResponseEntity.ok(complaintService.updateStatus(id, request));
    }

    @GetMapping("/map")
    public ResponseEntity<List<MapComplaintResponse>> mapComplaint() {
        return ResponseEntity.ok(complaintService.getMapComplaint());
    }

    @GetMapping("/official/queue")
    @PreAuthorize("hasRole('OFFICIAL')")
    public ResponseEntity<List<ComplaintResponse>> getOfficialQueue() {
        User official = getCurrentUser();
        return ResponseEntity.ok(complaintService.getOfficialQueue(official.getId(), official.getWardId()));
    }

    @GetMapping("/admin/all-complaints")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ComplaintResponse>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(complaintService.getAdminStats());
    }

    @GetMapping("/admin/officials")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllOfficials() {
        return ResponseEntity.ok(complaintService.getOfficialsList());
    }

    @GetMapping("/map/recent-resolved")
    public ResponseEntity<List<ComplaintResponse>> getRecentResolved() {
        return ResponseEntity.ok(complaintService.getRecentResolved());
    }

    @PostMapping("officials/update-location")
    @PreAuthorize("hasRole('OFFICIAL')")
    public ResponseEntity<String> updateOfficialLocation(@RequestParam Double latitude,
                                                         @RequestParam Double longitude) {
        User official = getCurrentUser();
        userService.updateOfficialLocation(official.getId(), latitude, longitude);
        return ResponseEntity.ok("Location Updated");
    }

    @GetMapping("admin/heatmap")
    public ResponseEntity<List<WardHeatmapResponse>> getHeatmap() {
        return ResponseEntity.ok(complaintService.getHeatmap());
    }
}
