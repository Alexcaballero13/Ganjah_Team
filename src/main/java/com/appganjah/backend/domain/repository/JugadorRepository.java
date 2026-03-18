package com.appganjah.backend.domain.repository;

import com.appganjah.backend.domain.model.Jugador;
import java.util.List;
import java.util.Optional;

public interface JugadorRepository {
    Jugador save(Jugador jugador);
    Optional<Jugador> findById(Long id);
    List<Jugador> findAll();
    void deleteById(Long id);
}
