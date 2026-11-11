package com.appganjah.backend.presentation.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/me")
    public Map<String, String> currentUser(Authentication authentication) {
        String role = authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority().replaceFirst("^ROLE_", ""))
                .filter(authority -> authority.equals("ADMIN") || authority.equals("VIEWER"))
                .findFirst()
                .orElse("VIEWER");

        Map<String, String> response = new LinkedHashMap<>();
        response.put("username", authentication.getName());
        response.put("role", role);
        return response;
    }
}
