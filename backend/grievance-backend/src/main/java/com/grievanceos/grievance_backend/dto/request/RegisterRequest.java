package com.grievanceos.grievance_backend.dto.request;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    private String fullName;

    @Email
    @NotBlank
    private String email;

    private String password;
    private String role;
    private String phone;
}
