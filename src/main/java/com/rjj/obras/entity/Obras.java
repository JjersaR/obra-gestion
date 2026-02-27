package com.rjj.obras.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "obras")
@EntityListeners(AuditingEntityListener.class)
public class Obras {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(unique = true, nullable = false)
  private String nombre;

  @Column(name = "monto_antes_iva", nullable = false)
  private BigDecimal montoAntesIva;

  @Column(name = "fecha_inicio", nullable = false)
  private LocalDate fechaInicio;

  @Column(name = "fecha_fin", nullable = false)
  private LocalDate fechaFin;

  @Enumerated(EnumType.STRING)
  private EStatus status;

  // Audit fields
  @CreatedDate
  @Column(name = "creado_en")
  private LocalDateTime creadoEn;

  @Column(name = "modificado_en")
  @LastModifiedDate
  private LocalDateTime modificadoEn;
}
