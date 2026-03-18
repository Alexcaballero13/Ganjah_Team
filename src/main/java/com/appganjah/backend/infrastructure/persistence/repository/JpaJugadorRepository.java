package com.appganjah.backend.infrastructure.persistence.repository;

import com.appganjah.backend.infrastructure.persistence.entity.JugadorEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaJugadorRepository extends JpaRepository<JugadorEntity, Long> {
}
