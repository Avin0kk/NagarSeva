package com.grievanceos.grievance_backend.dto.request;


import com.grievanceos.grievance_backend.enums.ComplaintStatus;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class UpdateComplaintStatusRequest {

    private ComplaintStatus status;
    private UUID changedBy;
    private String note;
}
