package com.appganjah.backend.infrastructure.persistence.repository;

import com.appganjah.backend.infrastructure.persistence.entity.MatchDayEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaMatchDayRepository extends JpaRepository<MatchDayEntity, Long> {
}
