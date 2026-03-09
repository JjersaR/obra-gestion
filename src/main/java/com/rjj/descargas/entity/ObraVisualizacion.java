package com.rjj.descargas.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "obra_visualizacion")
public class ObraVisualizacion {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "obra_id", nullable = false)
  private String obraId;

  @Column(nullable = false)
  private String rol;

  @Column(name = "usuario_id", nullable = false)
  private String usuarioId;

  private LocalDateTime fecha;

}
