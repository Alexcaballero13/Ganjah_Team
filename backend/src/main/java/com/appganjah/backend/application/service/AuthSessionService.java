package com.appganjah.backend.application.service;

import com.appganjah.backend.infrastructure.persistence.entity.AuthSessionEntity;
import com.appganjah.backend.infrastructure.persistence.repository.JpaAuthSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthSessionService {
    private final JpaAuthSessionRepository sessions;

    @Transactional
    public void create(String sessionId, String username, long expiresAtEpochMs) {
        Instant expiresAt = Instant.ofEpochMilli(expiresAtEpochMs);
        if (!expiresAt.isAfter(Instant.now())) {
            throw new IllegalArgumentException("La sesión ya está vencida.");
        }
        sessions.save(new AuthSessionEntity(sessionId, username, expiresAt));
    }

    @Transactional(readOnly = true)
    public boolean isActive(String sessionId, String username) {
        return sessions.findById(sessionId)
                .filter(session -> session.getUsername().equals(username))
                .filter(session -> session.getExpiresAt().isAfter(Instant.now()))
                .isPresent();
    }

    @Transactional
    public boolean revoke(String sessionId, String username) {
        return sessions.findById(sessionId)
                .filter(session -> session.getUsername().equals(username))
                .map(session -> {
                    sessions.delete(session);
                    return true;
                })
                .orElse(false);
    }
}
