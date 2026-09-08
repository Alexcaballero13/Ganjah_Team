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
        return new Jugador(saved.getId(), saved.getNombre(), saved.getPosicion(), saved.getNivelAtaque(), saved.getNivelDefensa());
    }

    @Override
    public Optional<Jugador> findById(Long id) {
        return jpaRepository.findById(id)
                .map(e -> new Jugador(e.getId(), e.getNombre(), e.getPosicion(), e.getNivelAtaque(), e.getNivelDefensa()));
    }

    @Override
    public List<Jugador> findAll() {
        return jpaRepository.findAll().stream()
                .map(e -> new Jugador(e.getId(), e.getNombre(), e.getPosicion(), e.getNivelAtaque(), e.getNivelDefensa()))
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }
}
