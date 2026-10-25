package com.appganjah.backend.infrastructure.persistence.adapter;

import com.appganjah.backend.domain.model.JugadorDePartido;
import com.appganjah.backend.domain.model.MatchDay;
import com.appganjah.backend.domain.repository.MatchDayRepository;
import com.appganjah.backend.infrastructure.persistence.entity.JugadorDePartidoEmbeddable;
import com.appganjah.backend.infrastructure.persistence.entity.MatchDayEntity;
import com.appganjah.backend.infrastructure.persistence.repository.JpaMatchDayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class MatchDayRepositoryAdapter implements MatchDayRepository {

    private final JpaMatchDayRepository jpaRepository;

    @Override
    public MatchDay save(MatchDay matchDay) {
        MatchDayEntity entity = new MatchDayEntity(
                matchDay.getId(),
                matchDay.getFechaPartido(),
                aEmbeddables(matchDay.getJugadores()),
                matchDay.getGolesLocal(),
                matchDay.getGolesVisitante());
        MatchDayEntity saved = jpaRepository.save(entity);
        return aDominio(saved);
    }

    @Override
    public List<MatchDay> findAll() {
        return jpaRepository.findAll().stream()
                .map(this::aDominio)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<MatchDay> findById(Long id) {
        return jpaRepository.findById(id).map(this::aDominio);
    }

    private MatchDay aDominio(MatchDayEntity entity) {
        return MatchDay.builder()
                .id(entity.getId())
                .fechaPartido(entity.getFechaPartido())
                .jugadores(aDominio(entity.getJugadores()))
                .golesLocal(entity.getGolesLocal())
                .golesVisitante(entity.getGolesVisitante())
                .build();
    }

    private List<JugadorDePartidoEmbeddable> aEmbeddables(List<JugadorDePartido> jugadores) {
        if (jugadores == null) {
            return java.util.Collections.emptyList();
        }
        return jugadores.stream()
                .map(j -> new JugadorDePartidoEmbeddable(j.getNombre(), j.getEquipo()))
                .collect(Collectors.toList());
    }

    private List<JugadorDePartido> aDominio(List<JugadorDePartidoEmbeddable> jugadores) {
        return jugadores.stream()
                .map(j -> new JugadorDePartido(j.getNombre(), j.getEquipo()))
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }
}
