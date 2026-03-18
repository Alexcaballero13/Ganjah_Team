package com.appganjah.backend.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Jugador {
    private Long id;
    private String nombre;
    private String posicion;
    private Integer nivel; // 1, 2, 3
}
