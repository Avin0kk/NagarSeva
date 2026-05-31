package com.grievanceos.grievance_backend.repository;

import com.grievanceos.grievance_backend.model.Ward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WardRepository extends JpaRepository<Ward, UUID> {

    // The key PostGIS query — finds which ward a GPS point falls inside
    @Query(value = """
        SELECT * FROM wards
        WHERE ST_Covers(
            boundary,
            ST_SetSRID(ST_Point(:lng, :lat), 4326) :: geography
        ) LIMIT 1
        """, nativeQuery = true)
    Optional<Ward> findWardContainingPoint(
            @Param("lat") double lat,
            @Param("lng") double lng
    );
}