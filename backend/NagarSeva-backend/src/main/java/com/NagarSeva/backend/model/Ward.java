package com.NagarSeva.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.locationtech.jts.geom.Polygon;
import java.util.UUID;

@Entity
@Table(name = "wards")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Ward {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "geography(POLYGON,4326)")
    private Polygon boundary;

    @Column(name = "sla_hours")
    private Integer slaHours = 48;

    @Column(name = "escalation_user_id")
    private UUID escalationUserId;
}