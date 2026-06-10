package com.NagarSeva.backend.dto.response;


import com.NagarSeva.backend.enums.ComplaintCategory;
import com.NagarSeva.backend.enums.ComplaintStatus;
import com.NagarSeva.backend.enums.Priority;
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
    private String addressText;
    private Priority priority;
}
