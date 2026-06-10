package com.NagarSeva.backend.service;


import com.NagarSeva.backend.dto.response.NotificationMessage;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendComplaintUpdate(String complaintId, String message) {
        messagingTemplate.convertAndSend(
                "/topic/complaints",
                new NotificationMessage(
                        "Complaint Updated",
                        message,
                        complaintId
                )
        );
    }
}
