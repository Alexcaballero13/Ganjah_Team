package com.appganjah.backend.application.service;

import com.appganjah.backend.domain.model.MatchDay;
import com.appganjah.backend.domain.repository.MatchDayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MatchDayService {

    private final MatchDayRepository matchDayRepository;

    public MatchDay registrarMatchDay(MatchDay matchDay) {
        matchDay.setFechaPartido(java.time.LocalDateTime.now());
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
}
