package com.appganjah.backend.presentation.controller;

import com.appganjah.backend.application.service.MatchDayService;
import com.appganjah.backend.domain.model.MatchDay;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matchdays")
@RequiredArgsConstructor
@Tag(name = "MatchDay", description = "Gestión de MatchDays")
public class MatchDayController {

    private final MatchDayService matchDayService;

    @PostMapping
    @Operation(summary = "Registrar un MatchDay")
    public MatchDay registrar(@RequestBody MatchDay matchDay) {
        return matchDayService.registrarMatchDay(matchDay);
    }

    @GetMapping
    @Operation(summary = "Listar todos los MatchDays")
    public List<MatchDay> listar() {
        return matchDayService.obtenerTodos();
    }
}
