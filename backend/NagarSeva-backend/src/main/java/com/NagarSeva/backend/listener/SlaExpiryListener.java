package com.NagarSeva.backend.listener;

import com.NagarSeva.backend.enums.ComplaintStatus;
import com.NagarSeva.backend.model.Complaint;
import com.NagarSeva.backend.model.Ward;
import com.NagarSeva.backend.repository.ComplaintRepository;
import com.NagarSeva.backend.repository.WardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class SlaExpiryListener implements MessageListener {

    private final ComplaintRepository complaintRepository;
    private final WardRepository wardRepository;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String key = new String(message.getBody());

        // only handle sla: keys — ignore everything else
        if (!key.startsWith("sla:")) return;

        String complaintIdStr = key.substring(4); // remove "sla:" prefix
        log.info("SLA expired for complaint: {}", complaintIdStr);

        try {
            UUID complaintId = UUID.fromString(complaintIdStr);

            Complaint complaint = complaintRepository.findById(complaintId)
                    .orElse(null);

            if (complaint == null) {
                log.warn("Complaint not found for SLA expiry: {}", complaintId);
                return;
            }

            // only escalate if still open or in progress
            if (complaint.getStatus() == ComplaintStatus.RESOLVED ||
                    complaint.getStatus() == ComplaintStatus.CLOSED ||
                    complaint.getStatus() == ComplaintStatus.ESCALATED) {
                log.info("Complaint {} already resolved/escalated, skipping", complaintId);
                return;
            }

            // escalate
            complaint.setStatus(ComplaintStatus.ESCALATED);
            complaintRepository.save(complaint);

            log.info("Complaint {} escalated due to SLA breach", complaintId);

            // optionally reassign to escalation official
            if (complaint.getWardId() != null) {
                wardRepository.findById(complaint.getWardId()).ifPresent(ward -> {
                    if (ward.getEscalationUserId() != null) {
                        complaint.setAssignedTo(ward.getEscalationUserId());
                        complaintRepository.save(complaint);
                        log.info("Complaint {} reassigned to escalation official", complaintId);
                    }
                });
            }

        } catch (Exception e) {
            log.error("Error processing SLA expiry for key: {}", key, e);
        }
    }
}