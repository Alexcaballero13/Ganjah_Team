package com.appganjah.backend.application.service;

import com.appganjah.backend.domain.model.Equipo;
import com.appganjah.backend.domain.model.Jugador;
import com.appganjah.backend.domain.model.JugadorDePartido;
import com.appganjah.backend.domain.model.MatchDay;
import com.appganjah.backend.domain.repository.MatchDayRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Calcula el nivelEfectivo de cada jugador: su nivelGeneral manual, ajustado
 * por cómo le ha ido en los partidos con marcador registrado. El ajuste:
 * - Pesa más cuanto más "sorpresivo" fue el resultado frente a lo esperado
 *   según el nivel manual de los dos equipos (ganarle a un equipo mejor en el
 *   papel pesa más que ganarle a uno peor).
 * - Pesa más cuanto más contundente fue el marcador (un 7-6 casi no mueve
 *   nada; un 7-1 sí). Excepción: si el equipo que ganó jugó con menos
 *   jugadores que el rival, se trata como margen máximo sin importar el
 *   marcador real (ganar en desventaja numérica tiene mérito extra).
 * - Pesa menos cuanto más viejo es el partido (vida media en días), para que
 *   el nivel refleje la forma actual y no se congele con resultados de hace
 *   mucho tiempo, sin que un partido "desaparezca" de golpe por antigüedad.
 * El ajuste acumulado nunca pesa más que PESO_MAXIMO_HISTORIAL frente a la
 * calificación manual, y ese peso crece con la cantidad de partidos jugados:
 * con pocos partidos, el rating manual del admin sigue mandando.
 */
@Service
@RequiredArgsConstructor
public class RatingService {

    private final MatchDayRepository matchDayRepository;

    private static final double AJUSTE_MAXIMO_POR_PARTIDO = 0.3;
    private static final double SENSIBILIDAD_DIFERENCIA = 0.2;
    private static final double GOLES_PARA_MARGEN_MAXIMO = 5.0;
    private static final double VIDA_MEDIA_DIAS = 60.0;
    private static final double PESO_MAXIMO_HISTORIAL = 0.6;
    private static final double PARTIDOS_PARA_PESO_MAXIMO = 20.0;
    private static final double AJUSTE_ACUMULADO_MAXIMO = 2.0;
    private static final double NIVEL_NEUTRO_SIN_CALIFICAR = 3.0;

    @Data
    @Builder
    @AllArgsConstructor
    public static class EstadisticasJugador {
        private Double nivelEfectivo;
        private int partidosJugados;
        private int victorias;
        private int empates;
        private int derrotas;
    }

    public Map<String, EstadisticasJugador> calcularEstadisticas(List<Jugador> jugadores) {
        Map<String, Double> nivelGeneralPorNombre = new HashMap<>();
        for (Jugador jugador : jugadores) {
            nivelGeneralPorNombre.put(jugador.getNombre(), jugador.getNivelGeneral());
        }

        Map<String, Double> ajusteAcumulado = new HashMap<>();
        Map<String, Double> pesoPartidosAcumulado = new HashMap<>();
        Map<String, int[]> resultados = new HashMap<>(); // [partidosJugados, victorias, empates, derrotas]

        List<MatchDay> partidosConMarcador = matchDayRepository.findAll().stream()
                .filter(this::tieneMarcadorYEquiposCompletos)
                .collect(Collectors.toList());

        for (MatchDay partido : partidosConMarcador) {
            procesarPartido(partido, nivelGeneralPorNombre, ajusteAcumulado, pesoPartidosAcumulado, resultados);
        }

        Map<String, EstadisticasJugador> estadisticas = new HashMap<>();
        for (Jugador jugador : jugadores) {
            Double nivelGeneral = jugador.getNivelGeneral();
            int[] r = resultados.getOrDefault(jugador.getNombre(), new int[4]);

            Double nivelEfectivo = null;
            if (nivelGeneral != null) {
                double ajuste = ajusteAcumulado.getOrDefault(jugador.getNombre(), 0.0);
                double ajusteClamp = clamp(ajuste, -AJUSTE_ACUMULADO_MAXIMO, AJUSTE_ACUMULADO_MAXIMO);
                double partidosPesados = pesoPartidosAcumulado.getOrDefault(jugador.getNombre(), 0.0);
                double pesoHistorial = Math.min(PESO_MAXIMO_HISTORIAL,
                        (partidosPesados / PARTIDOS_PARA_PESO_MAXIMO) * PESO_MAXIMO_HISTORIAL);
                nivelEfectivo = clamp(nivelGeneral + pesoHistorial * ajusteClamp, 0.0, 5.0);
            }

            estadisticas.put(jugador.getNombre(), EstadisticasJugador.builder()
                    .nivelEfectivo(nivelEfectivo)
                    .partidosJugados(r[0])
                    .victorias(r[1])
                    .empates(r[2])
                    .derrotas(r[3])
                    .build());
        }
        return estadisticas;
    }

    private boolean tieneMarcadorYEquiposCompletos(MatchDay partido) {
        if (partido.getGolesLocal() == null || partido.getGolesVisitante() == null) {
            return false;
        }
        List<JugadorDePartido> jugadores = partido.getJugadores();
        return jugadores != null && !jugadores.isEmpty()
                && jugadores.stream().allMatch(j -> j.getEquipo() != null);
    }

    private void procesarPartido(MatchDay partido,
                                  Map<String, Double> nivelGeneralPorNombre,
                                  Map<String, Double> ajusteAcumulado,
                                  Map<String, Double> pesoPartidosAcumulado,
                                  Map<String, int[]> resultados) {
        List<JugadorDePartido> local = partido.getJugadores().stream()
                .filter(j -> j.getEquipo() == Equipo.LOCAL)
                .collect(Collectors.toList());
        List<JugadorDePartido> visitante = partido.getJugadores().stream()
                .filter(j -> j.getEquipo() == Equipo.VISITANTE)
                .collect(Collectors.toList());

        if (local.isEmpty() || visitante.isEmpty()) {
            return;
        }

        double nivelLocal = promedioNivelGeneral(local, nivelGeneralPorNombre);
        double nivelVisitante = promedioNivelGeneral(visitante, nivelGeneralPorNombre);
        double diferencia = nivelLocal - nivelVisitante;
        double esperadoLocal = 1.0 / (1.0 + Math.pow(10, -diferencia * SENSIBILIDAD_DIFERENCIA));

        int golesLocal = partido.getGolesLocal();
        int golesVisitante = partido.getGolesVisitante();
        double resultadoLocal;
        if (golesLocal > golesVisitante) {
            resultadoLocal = 1.0;
        } else if (golesLocal < golesVisitante) {
            resultadoLocal = 0.0;
        } else {
            resultadoLocal = 0.5;
        }

        // Mérito por jugar en desventaja numérica: si el equipo que ganó tenía
        // menos jugadores que el rival, se trata como si el margen hubiera sido
        // el máximo (una goleada entre equipos parejos en cantidad), aunque el
        // marcador haya sido ajustado. Ganarle al rival siendo menos pesa más
        // que la diferencia de goles en sí.
        boolean localGanoConMenosJugadores = resultadoLocal == 1.0 && local.size() < visitante.size();
        boolean visitanteGanoConMenosJugadores = resultadoLocal == 0.0 && visitante.size() < local.size();
        double factorMargen = (localGanoConMenosJugadores || visitanteGanoConMenosJugadores)
                ? 1.0
                : Math.min(1.0, Math.abs(golesLocal - golesVisitante) / GOLES_PARA_MARGEN_MAXIMO);

        long diasTranscurridos = ChronoUnit.DAYS.between(partido.getFechaPartido(), LocalDateTime.now());
        double pesoAntiguedad = Math.pow(0.5, Math.max(0, diasTranscurridos) / VIDA_MEDIA_DIAS);

        double deltaLocal = AJUSTE_MAXIMO_POR_PARTIDO * pesoAntiguedad * factorMargen * (resultadoLocal - esperadoLocal);
        double deltaVisitante = -deltaLocal;

        // Índices de "resultados": 0 = partidosJugados, 1 = victorias, 2 = empates, 3 = derrotas
        int indiceLocal = resultadoLocal == 1.0 ? 1 : resultadoLocal == 0.5 ? 2 : 3;
        int indiceVisitante = resultadoLocal == 1.0 ? 3 : resultadoLocal == 0.5 ? 2 : 1;

        for (JugadorDePartido jugador : local) {
            ajusteAcumulado.merge(jugador.getNombre(), deltaLocal, Double::sum);
            pesoPartidosAcumulado.merge(jugador.getNombre(), pesoAntiguedad, Double::sum);
            sumarResultado(resultados, jugador.getNombre(), indiceLocal);
        }
        for (JugadorDePartido jugador : visitante) {
            ajusteAcumulado.merge(jugador.getNombre(), deltaVisitante, Double::sum);
            pesoPartidosAcumulado.merge(jugador.getNombre(), pesoAntiguedad, Double::sum);
            sumarResultado(resultados, jugador.getNombre(), indiceVisitante);
        }
    }

    private void sumarResultado(Map<String, int[]> resultados, String nombre, int indiceResultado) {
        int[] r = resultados.computeIfAbsent(nombre, k -> new int[4]);
        r[0]++;
        r[indiceResultado]++;
    }

    // getOrDefault no alcanza acá: el jugador puede existir en el mapa con valor
    // null (nivelGeneral null porque nunca lo calificaron), y en ese caso debe
    // tratarse igual que uno sin registro, con el nivel neutro.
    private double promedioNivelGeneral(List<JugadorDePartido> equipo, Map<String, Double> nivelGeneralPorNombre) {
        return equipo.stream()
                .map(j -> {
                    Double nivel = nivelGeneralPorNombre.get(j.getNombre());
                    return nivel != null ? nivel : NIVEL_NEUTRO_SIN_CALIFICAR;
                })
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(NIVEL_NEUTRO_SIN_CALIFICAR);
    }

    private double clamp(double valor, double min, double max) {
        return Math.max(min, Math.min(max, valor));
    }
}
