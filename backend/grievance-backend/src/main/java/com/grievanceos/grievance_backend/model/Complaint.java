package com.grievanceos.grievance_backend.model;

import com.grievanceos.grievance_backend.enums.*;
import jakarta.persistence.*;
import lombok.*;
import org.locationtech.jts.geom.Point;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "complaints")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "citizen_id", nullable = false)
    private UUID citizenId;

    @Column(name = "ward_id")
    private UUID wardId;

    @Column(name = "assigned_to")
    private UUID assignedTo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComplaintCategory category;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "geography(Point,4326)")
    private Point location;

    @Column(name = "address_text", columnDefinition = "TEXT")
    private String addressText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComplaintStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    @Column(name = "sla_deadline")
    private ZonedDateTime slaDeadline;

    @Column(name = "resolved_at")
    private ZonedDateTime resolvedAt;

    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = ZonedDateTime.now();
        this.status = ComplaintStatus.OPEN;
        if (this.priority == null) this.priority = Priority.MEDIUM;
    }
}
