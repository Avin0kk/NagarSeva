package com.NagarSeva.backend.dto.request;


import com.NagarSeva.backend.enums.ComplaintStatus;
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
