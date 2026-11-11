package com.appganjah.backend.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Jugador {
    private Long id;
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.READ_ONLY)
    private Integer legacySequence;
    @NotBlank
    @Size(max = 120)
    private String nombre;

    @NotBlank
    @Size(max = 40)
    private String posicion;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer nivelAtaque; // 1 a 5

    @NotNull
    @Min(1)
    @Max(5)
    private Integer nivelDefensa; // 1 a 5

    // Nivel combinado (manual + ajuste por historial de resultados reales) y
    // estadísticas de partidos con marcador registrado, calculados por
    // RatingService. No se reciben del cliente ni se persisten: se completan
    // solo al listar jugadores, para mostrarlos y para el sorteo.
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.READ_ONLY)
    private Double nivelEfectivo;

    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.READ_ONLY)
    private Integer partidosJugados;

    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.READ_ONLY)
    private Integer victorias;

    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.READ_ONLY)
    private Integer empates;

    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.READ_ONLY)
    private Integer derrotas;

    // La categoría visual se puede persistir más adelante. Mientras permanezca
    // null, el frontend aplica la regla central aprobada usando el nivel efectivo
    // o el promedio real de ataque y defensa (sin inventar estadísticas).
    @com.fasterxml.jackson.annotation.JsonProperty(access = com.fasterxml.jackson.annotation.JsonProperty.Access.READ_ONLY)
    private String categoriaVisual;

    /**
     * Nivel general del jugador: siempre se deriva del promedio de ataque y
     * defensa. No se recibe del cliente ni se persiste en la base de datos.
     */
    public Double getNivelGeneral() {
        if (nivelAtaque == null || nivelDefensa == null) {
            return null;
        }
        return (nivelAtaque + nivelDefensa) / 2.0;
    }
}
