package com.appganjah.backend.presentation.controller;

import com.appganjah.backend.application.service.ReporteService;
import com.appganjah.backend.application.service.ReporteService.JugadorReporteDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
@Tag(name = "Reportes", description = "Reportes de partidos")
public class ReporteController {

    private final ReporteService reporteService;

    @GetMapping("/partidos-por-mes")
    @Operation(summary = "Reporte de partidos jugados por mes")
    public List<JugadorReporteDTO> reporteMensual(@RequestParam int mes, @RequestParam int anio) {
        return reporteService.generarReporteMensual(mes, anio);
    }
}
