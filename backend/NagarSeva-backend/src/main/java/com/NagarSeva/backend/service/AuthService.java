package com.NagarSeva.backend.service;

import com.NagarSeva.backend.dto.request.LoginRequest;
import com.NagarSeva.backend.dto.request.RegisterRequest;
import com.NagarSeva.backend.dto.response.AuthResponse;
import com.NagarSeva.backend.enums.Role;
import com.NagarSeva.backend.repository.UserRepository;
import com.NagarSeva.backend.security.JwtUtil;
import lombok.Builder;
import com.NagarSeva.backend.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse register(RegisterRequest request) {
        if(userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                        .fullName(request.getFullName())
                        .email(request.getEmail())
                        .passwordHash(
                                passwordEncoder.encode(request.getPassword())
                        )
                        .role(Role.valueOf(request.getRole()))
                        .build();

        userRepository.save(user);

        String accessToken = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());
        return new AuthResponse(accessToken, refreshToken);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(() -> new RuntimeException("Invalid email"));

        boolean isPasswordCorrect = passwordEncoder.matches(request.getPassword(), user.getPasswordHash());
        if(!isPasswordCorrect) throw new RuntimeException("Invalid password");

        String accessToken = jwtUtil.generateToken(user.getEmail(),user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());

        return new AuthResponse(accessToken,refreshToken);
    }
}
