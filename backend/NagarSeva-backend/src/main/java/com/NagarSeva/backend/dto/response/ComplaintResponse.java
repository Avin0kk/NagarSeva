package com.NagarSeva.backend.dto.response;

import com.NagarSeva.backend.enums.ComplaintCategory;
import com.NagarSeva.backend.enums.ComplaintStatus;
import com.NagarSeva.backend.enums.Priority;
import com.NagarSeva.backend.model.Ward;
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
    private ComplaintCategory category;

    private Double latitude;
    private Double longitude;
    private ZonedDateTime slaDeadline;
    private String addressText;

    private String assignedOfficialName;
    private String wardName;
}
