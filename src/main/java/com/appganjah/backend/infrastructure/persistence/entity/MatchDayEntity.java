package com.appganjah.backend.infrastructure.persistence.entity;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "matchday")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MatchDayEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private LocalDateTime fechaPartido;
    
    @ElementCollection
    @CollectionTable(name = "matchday_jugadores", joinColumns = @JoinColumn(name = "matchday_id"))
    private List<JugadorDePartidoEmbeddable> jugadores;

    // Marcador final, nullable: se ingresa después desde el historial, cuando se
    // conoce el resultado real. Los MatchDay existentes quedan en null.
    @Column(name = "goles_local")
    private Integer golesLocal;

    @Column(name = "goles_visitante")
    private Integer golesVisitante;
}
