package com.rjj.archivos.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.rjj.movobra.entity.ETipo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "archivos", indexes = {
    @Index(name = "idx_archivos_movobra_categoria", columnList = "movobra_id, categoria")
})
@EntityListeners(AuditingEntityListener.class)
public class Archivos {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false)
  private String bucket;

  @Column(nullable = false)
  private String url;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ETipo tipoMovimiento;

  @Column(name = "movobra_id", nullable = false)
  private UUID movobraId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private ETipo categoria;

  @Column(name = "size_bytes", nullable = false)
  private Long sizeBytes;

  @Column(length = 64, nullable = false, unique = true)
  private String checksum;

  @Column(nullable = false)
  private String mimeType;

  private Boolean inmutable;

  // Audit fields
  @CreatedDate
  @Column(name = "creado_en")
  private LocalDateTime creadoEn;

  @Column(name = "modificado_en")
  @LastModifiedDate
  private LocalDateTime modificadoEn;
}
