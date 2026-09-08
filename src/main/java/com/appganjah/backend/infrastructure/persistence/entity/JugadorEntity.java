package com.appganjah.backend.infrastructure.persistence.entity;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "jugadores")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class JugadorEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String nombre;
    
    @Column(nullable = false)
    private String posicion;

    // Nullable a nivel de BD a propósito: así Hibernate puede agregar estas
    // columnas con ddl-auto=update sin romper filas ya existentes en Supabase
    // que todavía no tienen estos valores. La obligatoriedad real (1-5) se
    // valida en el modelo de dominio (Jugador) para cualquier jugador nuevo
    // o editado a través del API.
    @Column(name = "nivel_ataque")
    private Integer nivelAtaque;

    @Column(name = "nivel_defensa")
    private Integer nivelDefensa;
}
