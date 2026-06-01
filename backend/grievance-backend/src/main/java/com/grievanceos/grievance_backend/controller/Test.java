package com.grievanceos.grievance_backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
public class Test {

    @GetMapping("/public")
    public String publicApi() {
        return "Anyone can access";
    }

    @GetMapping("/private")
    public String privateApi() {
        return "Authenticated User";
    }
}
