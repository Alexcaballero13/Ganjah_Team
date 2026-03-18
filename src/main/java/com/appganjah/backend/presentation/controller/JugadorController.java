package com.appganjah.backend.presentation.controller;

import com.appganjah.backend.application.service.JugadorService;
import com.appganjah.backend.domain.model.Jugador;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jugadores")
@RequiredArgsConstructor
@Tag(name = "Jugadores", description = "CRUD de jugadores")
public class JugadorController {

    private final JugadorService jugadorService;

    @GetMapping
    @Operation(summary = "Listar todos los jugadores")
    public List<Jugador> listar() {
        return jugadorService.obtenerTodosLosJugadores();
    }

    @PostMapping
    @Operation(summary = "Crear un nuevo jugador")
    public Jugador crear(@RequestBody Jugador jugador) {
        return jugadorService.crearJugador(jugador);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un jugador por ID")
    public ResponseEntity<Jugador> obtener(@PathVariable Long id) {
        return jugadorService.obtenerJugadorPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un jugador")
    public Jugador actualizar(@PathVariable Long id, @RequestBody Jugador jugador) {
        return jugadorService.actualizarJugador(id, jugador);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un jugador")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        jugadorService.eliminarJugador(id);
        return ResponseEntity.noContent().build();
    }
}
