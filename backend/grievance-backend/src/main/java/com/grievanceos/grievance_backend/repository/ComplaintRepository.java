package com.grievanceos.grievance_backend.repository;

import com.grievanceos.grievance_backend.model.Complaint;
import com.grievanceos.grievance_backend.enums.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, UUID> {

    List<Complaint> findByCitizenId(UUID citizenId);

    List<Complaint> findByWardIdAndStatus(UUID wardId, ComplaintStatus status);

    List<Complaint> findByAssignedTo(UUID officialId);

    List<Complaint> findByStatus(ComplaintStatus status);

    // All open complaints within X metres of a point — powers the map view
    @Query(value = """
        SELECT * FROM complaints
        WHERE status = 'OPEN'
        AND ST_DWithin(
            location,
            ST_SetSRID(ST_Point(:lng, :lat), 4326)::geography,
            :radiusMetres
        )
        """, nativeQuery = true)
    List<Complaint> findOpenComplaintsNearPoint(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusMetres") double radiusMetres
    );

    // Complaints nearing SLA breach — for the official's urgent queue
    @Query(value = """
        SELECT * FROM complaints
        WHERE status NOT IN ('RESOLVED','CLOSED')
        AND ward_id = :wardId
        AND sla_deadline < now() + INTERVAL '6 hours'
        ORDER BY sla_deadline ASC
        """, nativeQuery = true)
    List<Complaint> findNearingSlaBreachByWard(@Param("wardId") UUID wardId);

    // Heatmap data — complaint count per ward
    @Query(value = """
        SELECT ward_id, COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'OPEN') as open_count
        FROM complaints
        GROUP BY ward_id
        """, nativeQuery = true)
    List<Object[]> getComplaintCountByWard();
}