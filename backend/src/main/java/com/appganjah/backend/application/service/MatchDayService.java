package com.appganjah.backend.application.service;

import com.appganjah.backend.domain.model.JugadorDePartido;
import com.appganjah.backend.domain.model.MatchDay;
import com.appganjah.backend.domain.model.RosterStatus;
import com.appganjah.backend.domain.repository.MatchDayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class MatchDayService {

    private final MatchDayRepository matchDayRepository;

    private static final int MIN_JUGADORES = 12;
    private static final int MAX_JUGADORES = 18;

    public MatchDay registrarMatchDay(MatchDay matchDay) {
        validarRoster(matchDay.getJugadores());
        matchDay.setFechaPartido(java.time.LocalDateTime.now());
        matchDay.setRosterStatus(RosterStatus.COMPLETO);
        return matchDayRepository.save(matchDay);
    }

    public List<MatchDay> obtenerTodos() {
        return matchDayRepository.findAll();
    }

    public Optional<MatchDay> obtenerPorId(Long id) {
        return matchDayRepository.findById(id);
    }

    public void eliminarMatchDay(Long id) {
        matchDayRepository.deleteById(id);
    }

    // Se puede llamar en cualquier momento después del partido (incluso días
    // después); si ya tenía marcador, lo reemplaza. RatingService recalcula el
    // historial completo cada vez que hace falta, así que no hay que "deshacer"
    // nada del ajuste anterior.
    public Optional<MatchDay> registrarMarcador(Long id, Integer golesLocal, Integer golesVisitante) {
        return matchDayRepository.findById(id).map(matchDay -> {
            matchDay.setGolesLocal(golesLocal);
            matchDay.setGolesVisitante(golesVisitante);
            return matchDayRepository.save(matchDay);
        });
    }

    // Reemplaza el roster completo (equipo LOCAL/VISITANTE por jugador) de un
    // MatchDay ya confirmado. Para corregir después del sorteo quién jugó
    // realmente: alguien que se bajó a último momento, alguien que se sumó, etc.
    public Optional<MatchDay> actualizarJugadores(Long id, List<JugadorDePartido> jugadores) {
        validarRoster(jugadores);
        return matchDayRepository.findById(id).map(matchDay -> {
            matchDay.setJugadores(jugadores);
            matchDay.setRosterStatus(RosterStatus.COMPLETO);
            return matchDayRepository.save(matchDay);
        });
    }

    private void validarRoster(List<JugadorDePartido> jugadores) {
        if (jugadores == null || jugadores.size() < MIN_JUGADORES || jugadores.size() > MAX_JUGADORES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Un MatchDay requiere entre 12 y 18 jugadores");
        }

        Set<String> nombres = new HashSet<>();
        boolean tieneLocal = false;
        boolean tieneVisitante = false;
        for (JugadorDePartido jugador : jugadores) {
            String nombreNormalizado = jugador.getNombre().trim().toLowerCase(Locale.ROOT);
            if (!nombres.add(nombreNormalizado)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Un jugador no puede aparecer más de una vez en el MatchDay");
            }
            switch (jugador.getEquipo()) {
                case LOCAL:
                    tieneLocal = true;
                    break;
                case VISITANTE:
                    tieneVisitante = true;
                    break;
                default:
                    break;
            }
        }
        if (!tieneLocal || !tieneVisitante) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El MatchDay debe incluir jugadores de ambos equipos");
        }
    }
}
