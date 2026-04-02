package com.rjj.movobra.entity;

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
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "movimiento_obras")
@EntityListeners(AuditingEntityListener.class)
public class Movobra {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "obra_id", nullable = false, updatable = false)
  private UUID obraId;

  @Enumerated(EnumType.STRING)
  @Column(name = "tipo_movimiento", nullable = false)
  private ETipo tipoMovimiento;

  @Column(name = "usuario_registra_id", nullable = false)
  private UUID usuarioRegistraId;

  @Column(name = "usuario_aprueba_id")
  private UUID usuarioApruebaId;

  @Column(name = "archivo_id", nullable = false)
  private UUID archivoId;

  @Enumerated(EnumType.STRING)
  private ETipo estado = ETipo.SUBIDO;

  private String observaciones;

  private boolean pagado = false;

  private boolean jefe = false;

  // Audit fields
  @CreatedDate
  @Column(name = "creado_en")
  private LocalDateTime creadoEn;

  @Column(name = "modificado_en")
  @LastModifiedDate
  private LocalDateTime modificadoEn;

  @PrePersist
  public void prePersist() {
    this.creadoEn = LocalDateTime.now();
  }
}
