package com.appganjah.backend.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    @NotEmpty
    private List<JugadorDePartido> jugadores; // Nombre + equipo (LOCAL/VISITANTE)

    // Marcador final. Nullable: se conoce recién cuando termina el partido, se
    // ingresa después desde el historial (puede quedar sin marcador indefinidamente
    // si nadie lo registra, o si es un MatchDay de antes de este cambio).
    private Integer golesLocal;
    private Integer golesVisitante;
}
