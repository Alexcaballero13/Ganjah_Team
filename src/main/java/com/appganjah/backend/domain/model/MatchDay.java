package com.appganjah.backend.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MatchDay {
    private Long id;
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.READ_ONLY)
    private LocalDateTime fechaPartido;

    // @Valid cascadea la validación a cada JugadorDePartido (nombre y equipo
    // obligatorios): sin esto, @NotEmpty solo exige la lista no vacía, no que
    // cada elemento esté bien formado.
    @NotEmpty
    @Valid
    private List<JugadorDePartido> jugadores; // Nombre + equipo (LOCAL/VISITANTE)

    // Marcador final. Nullable: se conoce recién cuando termina el partido, se
    // ingresa después desde el historial (puede quedar sin marcador indefinidamente
    // si nadie lo registra, o si es un MatchDay de antes de este cambio).
    private Integer golesLocal;
    private Integer golesVisitante;
}
