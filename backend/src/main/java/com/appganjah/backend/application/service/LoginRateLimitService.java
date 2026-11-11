package com.appganjah.backend.application.service;

import com.appganjah.backend.infrastructure.persistence.entity.LoginAttemptEntity;
import com.appganjah.backend.infrastructure.persistence.repository.JpaLoginAttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class LoginRateLimitService {
    private static final int MAX_FAILURES = 5;
    private static final Duration WINDOW = Duration.ofMinutes(15);
    private static final Duration LOCK = Duration.ofMinutes(15);
    private final JpaLoginAttemptRepository attempts;

    public String fingerprint(String username, String clientAddress) {
        String source = username.trim().toLowerCase() + "|" + clientAddress;
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(source.getBytes(StandardCharsets.UTF_8));
            StringBuilder result = new StringBuilder(digest.length * 2);
            for (byte value : digest) {
                result.append(String.format("%02x", value));
            }
            return result.toString();
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 no está disponible.", exception);
        }
    }

    @Transactional(readOnly = true)
    public long retryAfterSeconds(String fingerprint) {
        return attempts.findById(fingerprint)
                .map(LoginAttemptEntity::getLockedUntil)
                .filter(until -> until.isAfter(Instant.now()))
                .map(until -> Math.max(1, Duration.between(Instant.now(), until).getSeconds()))
                .orElse(0L);
    }

    @Transactional
    public void registerFailure(String fingerprint) {
        Instant now = Instant.now();
        LoginAttemptEntity attempt = attempts.findById(fingerprint)
                .orElseGet(() -> new LoginAttemptEntity(fingerprint, now, 0, null));
        if (attempt.getWindowStartedAt().plus(WINDOW).isBefore(now)) {
            attempt.setWindowStartedAt(now);
            attempt.setFailureCount(0);
            attempt.setLockedUntil(null);
        }
        attempt.setFailureCount(attempt.getFailureCount() + 1);
        if (attempt.getFailureCount() >= MAX_FAILURES) {
            attempt.setLockedUntil(now.plus(LOCK));
        }
        attempts.save(attempt);
    }

    @Transactional
    public void clear(String fingerprint) {
        attempts.findById(fingerprint).ifPresent(attempts::delete);
    }
}
