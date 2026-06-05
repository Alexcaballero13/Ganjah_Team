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
}
