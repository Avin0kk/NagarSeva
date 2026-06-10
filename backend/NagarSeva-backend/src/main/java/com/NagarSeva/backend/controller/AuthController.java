package com.NagarSeva.backend.controller;


import com.NagarSeva.backend.dto.request.LoginRequest;
import com.NagarSeva.backend.dto.request.RegisterRequest;
import com.NagarSeva.backend.dto.response.AuthResponse;
import com.NagarSeva.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/auth")
@RestController
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @GetMapping("/health-checkup")
    public String healthCheckUp() {
        return "Health Ok";
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
