package com.grievanceos.grievance_backend.dto.response;

import com.grievanceos.grievance_backend.enums.ComplaintStatus;
import com.grievanceos.grievance_backend.enums.Priority;
import com.grievanceos.grievance_backend.model.Ward;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.ZonedDateTime;
import java.util.UUID;

@Getter
@Builder
@AllArgsConstructor
public class ComplaintResponse {

    private UUID id;
    private String title;
    private ComplaintStatus status;
    private Priority priority;
    private ZonedDateTime createdAt;
    private UUID wardId;


}
