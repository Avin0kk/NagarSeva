package com.NagarSeva.backend.service;


import com.NagarSeva.backend.model.Complaint;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendComplaintConfirmation(Complaint complaint, String citizenEmail, String wardName, String officalName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("goelavin543@gmail.com");
            message.setTo(citizenEmail);
            message.setSubject("Complaint Confirmation - NagarSeva");
            message.setText(buildComplaintEmail(complaint, wardName, officalName));

            log.info("Sending email to: {}", citizenEmail);
            log.info("From: {}", "goelavin543@gmail.com");

            mailSender.send(message);
            log.info("Confirmation email sent to {}", citizenEmail);
        } catch (Exception e) {
            log.error("Failed to send mail to {}",citizenEmail, e);
            e.printStackTrace();
        }
    }

    private String buildComplaintEmail(Complaint complaint, String wardName, String officialName) {
        return String.format(
                "Dear Citizen, \n\n" +
                        "Your complaint has been successfully filed. \n\n" +
                        "Complaint Details: \n" +
                        "- ID: %s\n" +
                        "- Title: %s\n" +
                        "- Category: %s\n" +
                        "- Status: %s\n" +
                        "- Priority: %s\n" +
                        "- Ward: %s\n" +
                        "- Assigned Official: %s\n" +
                        "- SLA Deadline: %s\n\n" +
                        "You will receive updates via email. Track your complaint at: http://localhost:3000/dashboard\n\n" +
                        "Thank you for reporting civic issues.\n\n" +
                        "NagarSeva Team",
                complaint.getId(),
                complaint.getTitle(),
                complaint.getCategory(),
                complaint.getStatus(),
                complaint.getPriority(),
                wardName != null ? wardName : "Pending",
                officialName != null ? officialName : "Not Assigned",
                complaint.getSlaDeadline()
        );
    }

    public void sendSimpleEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("goelavin543@gmail.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);

            log.info("Sending test email to: {}", to);
            mailSender.send(message);
            log.info("✓ Test email sent successfully");
        } catch (Exception e) {
            log.error("✗ Failed to send test email: {}", e.getMessage());
            e.printStackTrace();
        }
    }
}
