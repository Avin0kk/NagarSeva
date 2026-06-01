package com.grievanceos.grievance_backend.model;

import com.grievanceos.grievance_backend.enums.ComplaintStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "status_history")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "complaint_id", nullable = false)
    private UUID complaintId;

    @Column(name = "changed_by", nullable = false)
    private UUID changedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status")
    private ComplaintStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false)
    private ComplaintStatus toStatus;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "changed_at")
    private ZonedDateTime changedAt;

    @PrePersist
    public void prePersist() {
        this.changedAt = ZonedDateTime.now();
    }
}