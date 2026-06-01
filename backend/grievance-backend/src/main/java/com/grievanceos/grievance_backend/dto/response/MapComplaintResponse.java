package com.grievanceos.grievance_backend.dto.response;


import com.grievanceos.grievance_backend.enums.ComplaintCategory;
import com.grievanceos.grievance_backend.enums.ComplaintStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
public class MapComplaintResponse {

    private UUID id;
    private String title;
    private ComplaintCategory category;
    private ComplaintStatus status;

    private double latitude;
    private double longitude;
}
