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
    
    @Column(nullable = false)
    private Integer nivel;
}
