package com.appganjah.backend.infrastructure.persistence.repository;

import com.appganjah.backend.infrastructure.persistence.entity.LoginAttemptEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaLoginAttemptRepository extends JpaRepository<LoginAttemptEntity, String> {
}
