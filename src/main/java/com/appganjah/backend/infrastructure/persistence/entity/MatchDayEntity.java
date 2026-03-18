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
    @Column(name = "nombre_jugador")
    private List<String> jugadores;
}
