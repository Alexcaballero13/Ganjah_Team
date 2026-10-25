package com.appganjah.backend.application.service;

import com.appganjah.backend.domain.model.Jugador;
import com.appganjah.backend.domain.repository.JugadorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class JugadorService {

    private final JugadorRepository jugadorRepository;
    private final RatingService ratingService;

    public Jugador crearJugador(Jugador jugador) {
        return jugadorRepository.save(jugador);
    }

    public Optional<Jugador> obtenerJugadorPorId(Long id) {
        return jugadorRepository.findById(id);
    }

    // nivelEfectivo y las estadísticas de partidos se completan solo acá (no en
    // crear/actualizar/obtenerPorId): es el listado que alimenta la pantalla de
    // sorteo, la gestión de jugadores y el reporte de rendimiento.
    public List<Jugador> obtenerTodosLosJugadores() {
        List<Jugador> jugadores = jugadorRepository.findAll();
        Map<String, RatingService.EstadisticasJugador> estadisticas = ratingService.calcularEstadisticas(jugadores);
        jugadores.forEach(jugador -> {
            RatingService.EstadisticasJugador e = estadisticas.get(jugador.getNombre());
            jugador.setNivelEfectivo(e.getNivelEfectivo());
            jugador.setPartidosJugados(e.getPartidosJugados());
            jugador.setVictorias(e.getVictorias());
            jugador.setEmpates(e.getEmpates());
            jugador.setDerrotas(e.getDerrotas());
        });
        return jugadores;
    }

    public Jugador actualizarJugador(Long id, Jugador jugador) {
        jugador.setId(id);
        return jugadorRepository.save(jugador);
    }

    public void eliminarJugador(Long id) {
        jugadorRepository.deleteById(id);
    }
}
