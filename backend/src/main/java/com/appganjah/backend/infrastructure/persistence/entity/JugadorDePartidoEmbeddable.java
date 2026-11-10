package com.appganjah.backend.infrastructure.persistence.entity;

import com.appganjah.backend.domain.model.Equipo;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;

@Embeddable
@Data
@AllArgsConstructor
@NoArgsConstructor
public class JugadorDePartidoEmbeddable {
    @Column(name = "nombre_jugador")
    private String nombre;

    // Nullable: los MatchDay registrados antes de este cambio no tienen equipo
    // asignado por jugador, solo la lista plana de nombres que existía antes.
    @Enumerated(EnumType.STRING)
    @Column(name = "equipo")
    private Equipo equipo;
}
