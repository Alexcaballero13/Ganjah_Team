package com.appganjah.backend.infrastructure.persistence.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "auth_sessions")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthSessionEntity {
    @Id
    @Column(name = "session_id", nullable = false, length = 64)
    private String sessionId;

    @Column(nullable = false, length = 80)
    private String username;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;
}
