package com.appganjah.backend.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class JugadorDePartido {
    @NotBlank
    private String nombre;

    @NotNull
    private Equipo equipo;
}
