package com.appganjah.backend.infrastructure.persistence.repository;

import com.appganjah.backend.infrastructure.persistence.entity.AuthSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaAuthSessionRepository extends JpaRepository<AuthSessionEntity, String> {
}
