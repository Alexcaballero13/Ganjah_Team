package com.appganjah.backend.infrastructure.persistence.adapter;

import com.appganjah.backend.domain.model.Jugador;
import com.appganjah.backend.domain.repository.JugadorRepository;
import com.appganjah.backend.infrastructure.persistence.entity.JugadorEntity;
import com.appganjah.backend.infrastructure.persistence.repository.JpaJugadorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JugadorRepositoryAdapter implements JugadorRepository {

    private final JpaJugadorRepository jpaRepository;

    @Override
    public Jugador save(Jugador jugador) {
        JugadorEntity entity = new JugadorEntity(jugador.getId(), jugador.getNombre(), jugador.getPosicion(), jugador.getNivelAtaque(), jugador.getNivelDefensa());
        JugadorEntity saved = jpaRepository.save(entity);
        return aDominio(saved);
    }

    @Override
    public Optional<Jugador> findById(Long id) {
        return jpaRepository.findById(id).map(this::aDominio);
    }

    @Override
    public List<Jugador> findAll() {
        return jpaRepository.findAll().stream()
                .map(this::aDominio)
                .collect(Collectors.toList());
    }

    // nivelEfectivo no se mapea aquí a propósito: se calcula aparte (RatingService)
    // a partir del historial de partidos, no vive en la tabla de jugadores.
    private Jugador aDominio(JugadorEntity e) {
        return Jugador.builder()
                .id(e.getId())
                .nombre(e.getNombre())
                .posicion(e.getPosicion())
                .nivelAtaque(e.getNivelAtaque())
                .nivelDefensa(e.getNivelDefensa())
                .build();
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }
}
