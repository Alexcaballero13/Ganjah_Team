package com.appganjah.backend.application.service;

import com.appganjah.backend.domain.model.Jugador;
import com.appganjah.backend.domain.repository.JugadorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class JugadorService {

    private final JugadorRepository jugadorRepository;

    public Jugador crearJugador(Jugador jugador) {
        return jugadorRepository.save(jugador);
    }

    public Optional<Jugador> obtenerJugadorPorId(Long id) {
        return jugadorRepository.findById(id);
    }

    public List<Jugador> obtenerTodosLosJugadores() {
        return jugadorRepository.findAll();
    }

    public Jugador actualizarJugador(Long id, Jugador jugador) {
        jugador.setId(id);
        return jugadorRepository.save(jugador);
    }

    public void eliminarJugador(Long id) {
        jugadorRepository.deleteById(id);
    }
}
