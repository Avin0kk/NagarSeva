package com.NagarSeva.backend.controller;

import com.NagarSeva.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/test")
public class Test {

    private final EmailService emailService;

    @GetMapping("/public")
    public String publicApi() {
        return "Anyone can access";
    }

    @GetMapping("/private")
    public String privateApi() {
        return "Authenticated User";
    }

    @GetMapping("/email")
    public ResponseEntity<String> emailTest() {
        emailService.sendSimpleEmail(
                "unofficialwin02@gmail.com",  // change to your actual Gmail
                "Test Subject",
                "This is a test email from NagarSeva"
        );
        return ResponseEntity.ok("Email sent");
    }
}
