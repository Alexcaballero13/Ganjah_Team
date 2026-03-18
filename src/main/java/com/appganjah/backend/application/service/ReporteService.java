package com.appganjah.backend.application.service;

import com.appganjah.backend.domain.model.MatchDay;
import com.appganjah.backend.domain.repository.MatchDayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReporteService {

    private final MatchDayRepository matchDayRepository;

    public List<JugadorReporteDTO> generarReporteMensual(int mes, int anio) {
        List<MatchDay> matchDays = matchDayRepository.findAll();

        Map<String, Long> conteoPartidos = matchDays.stream()
                .filter(m -> m.getFechaPartido().getMonthValue() == mes && m.getFechaPartido().getYear() == anio)
                .flatMap(m -> m.getJugadores().stream())
                .collect(Collectors.groupingBy(nombre -> nombre, Collectors.counting()));

        return conteoPartidos.entrySet().stream()
                .map(entry -> new JugadorReporteDTO(entry.getKey(), entry.getValue().intValue()))
                .sorted(Comparator.comparingInt(JugadorReporteDTO::getPartidosJugados).reversed())
                .collect(Collectors.toList());
    }

    public static class JugadorReporteDTO {
        private final String nombre;
        private final int partidosJugados;

        public JugadorReporteDTO(String nombre, int partidosJugados) {
            this.nombre = nombre;
            this.partidosJugados = partidosJugados;
        }

        public String getNombre() {
            return nombre;
        }

        public int getPartidosJugados() {
            return partidosJugados;
        }
    }
}
