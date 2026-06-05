package com.appganjah.backend.application.service;

import com.appganjah.backend.domain.model.MatchDay;
import com.appganjah.backend.domain.repository.JugadorRepository;
import com.appganjah.backend.domain.repository.MatchDayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReporteService {

    private final MatchDayRepository matchDayRepository;
    private final JugadorRepository jugadorRepository;

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

    public List<String> generarReporteAusentesMensual(int mes, int anio) {
        List<MatchDay> matchDays = matchDayRepository.findAll();

        // Jugadores que SÍ asistieron al menos una vez en el mes
        Set<String> asistentes = matchDays.stream()
                .filter(m -> m.getFechaPartido().getMonthValue() == mes && m.getFechaPartido().getYear() == anio)
                .flatMap(m -> m.getJugadores().stream())
                .collect(Collectors.toSet());

        // Todos los jugadores registrados en el sistema
        List<String> todosLosJugadores = jugadorRepository.findAll().stream()
                .map(j -> j.getNombre())
                .collect(Collectors.toList());

        // Los que NO asistieron
        return todosLosJugadores.stream()
                .filter(nombre -> !asistentes.contains(nombre))
                .sorted()
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
