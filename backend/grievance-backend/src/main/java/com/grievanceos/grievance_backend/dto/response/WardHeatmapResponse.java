package com.grievanceos.grievance_backend.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WardHeatmapResponse {

    private UUID wardId;
    private String wardName;
    private Long unresolvedCount;
    private Long openCount;
    private Long inProgressCount;
    private Long escalatedCount;
    private Double latitude;
    private Double longitude;
    private Double intensity;
}
