package com.appganjah.backend.infrastructure.persistence.adapter;

import com.appganjah.backend.domain.model.MatchDay;
import com.appganjah.backend.domain.repository.MatchDayRepository;
import com.appganjah.backend.infrastructure.persistence.entity.MatchDayEntity;
import com.appganjah.backend.infrastructure.persistence.repository.JpaMatchDayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class MatchDayRepositoryAdapter implements MatchDayRepository {

    private final JpaMatchDayRepository jpaRepository;

    @Override
    public MatchDay save(MatchDay matchDay) {
        MatchDayEntity entity = new MatchDayEntity(matchDay.getId(), matchDay.getFechaPartido(), matchDay.getJugadores());
        MatchDayEntity saved = jpaRepository.save(entity);
        return new MatchDay(saved.getId(), saved.getFechaPartido(), saved.getJugadores());
    }

    @Override
    public List<MatchDay> findAll() {
        return jpaRepository.findAll().stream()
                .map(e -> new MatchDay(e.getId(), e.getFechaPartido(), e.getJugadores()))
                .collect(Collectors.toList());
    }
}
