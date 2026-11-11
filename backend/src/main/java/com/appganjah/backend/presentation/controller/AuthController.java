package com.appganjah.backend.presentation.controller;

import com.appganjah.backend.application.service.AuthSessionService;
import com.appganjah.backend.application.service.LoginRateLimitService;
import com.appganjah.backend.infrastructure.config.LoginRateLimitFilter;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthSessionService sessions;
    private final LoginRateLimitService loginRateLimits;

    @GetMapping("/me")
    public Map<String, String> currentUser(Authentication authentication, HttpServletRequest request) {
        Object fingerprint = request.getAttribute(LoginRateLimitFilter.FINGERPRINT_ATTRIBUTE);
        if (fingerprint instanceof String) loginRateLimits.clear((String) fingerprint);
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

    @PostMapping("/sessions")
    public ResponseEntity<Void> createSession(Authentication authentication, @Valid @RequestBody SessionRequest request) {
        sessions.create(request.getSessionId(), authentication.getName(), request.getExpiresAt());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<Void> verifySession(Authentication authentication, @PathVariable String sessionId) {
        return sessions.isActive(sessionId, authentication.getName())
                ? ResponseEntity.noContent().build()
                : ResponseEntity.status(401).build();
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<Void> revokeSession(Authentication authentication, @PathVariable String sessionId) {
        return sessions.revoke(sessionId, authentication.getName())
                ? ResponseEntity.noContent().build()
                : ResponseEntity.status(401).build();
    }

    @Data
    public static class SessionRequest {
        @NotBlank
        @Pattern(regexp = "^[a-f0-9-]{36}$")
        private String sessionId;

        private long expiresAt;
    }
}
