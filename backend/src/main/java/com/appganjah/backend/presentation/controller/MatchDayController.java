package com.appganjah.backend.presentation.controller;

import com.appganjah.backend.application.service.MatchDayService;
import com.appganjah.backend.domain.model.JugadorDePartido;
import com.appganjah.backend.domain.model.MatchDay;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.List;

@RestController
@RequestMapping("/api/matchdays")
@RequiredArgsConstructor
@Tag(name = "MatchDay", description = "Gestión de MatchDays")
public class MatchDayController {

    private final MatchDayService matchDayService;

    @PostMapping
    @Operation(summary = "Registrar un MatchDay")
    public MatchDay registrar(@Valid @RequestBody MatchDay matchDay) {
        return matchDayService.registrarMatchDay(matchDay);
    }

    @GetMapping
    @Operation(summary = "Listar todos los MatchDays")
    public List<MatchDay> listar() {
        return matchDayService.obtenerTodos();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un MatchDay por ID")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        matchDayService.eliminarMatchDay(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/marcador")
    @Operation(summary = "Registrar o corregir el marcador final de un MatchDay")
    public ResponseEntity<MatchDay> registrarMarcador(@PathVariable Long id, @Valid @RequestBody MarcadorRequest marcador) {
        return matchDayService.registrarMarcador(id, marcador.getGolesLocal(), marcador.getGolesVisitante())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/jugadores")
    @Operation(summary = "Editar el roster (equipo LOCAL/VISITANTE) de un MatchDay ya confirmado")
    public ResponseEntity<MatchDay> actualizarJugadores(@PathVariable Long id, @Valid @RequestBody JugadoresRequest body) {
        // Un mismo nombre no puede estar dos veces (ni en el mismo equipo ni en
        // equipos distintos): contaría partidos y aplicaría ajustes de rating
        // opuestos sobre la misma persona.
        long nombresDistintos = body.getJugadores().stream()
                .map(JugadorDePartido::getNombre)
                .distinct()
                .count();
        if (nombresDistintos != body.getJugadores().size()) {
            return ResponseEntity.badRequest().build();
        }

        return matchDayService.actualizarJugadores(id, body.getJugadores())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MarcadorRequest {
        @NotNull
        @Min(0)
        private Integer golesLocal;

        @NotNull
        @Min(0)
        private Integer golesVisitante;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class JugadoresRequest {
        @NotEmpty
        @Valid
        private List<JugadorDePartido> jugadores;
    }
}
