package com.appganjah.backend.infrastructure.persistence.repository;

import com.appganjah.backend.infrastructure.persistence.entity.MatchDayEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JpaMatchDayRepository extends JpaRepository<MatchDayEntity, Long> {
    @Override
    @EntityGraph(attributePaths = "jugadores")
    List<MatchDayEntity> findAll();

    @Override
    @EntityGraph(attributePaths = "jugadores")
    Optional<MatchDayEntity> findById(Long id);
}
