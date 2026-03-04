package com.rjj.usuarios.entity;

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
@Table(name = "usuarios")
@EntityListeners(AuditingEntityListener.class)
public class Usuarios {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false)
  private String nombre;

  @Enumerated(EnumType.STRING)
  @Column(name = "tipo_usuario", nullable = false)
  private ETipoUsuario tipoUsuario;

  @Column(unique = true, nullable = false)
  private String email;

  @Column(nullable = false)
  private String password;

  @Column(name = "cambio_password", nullable = true)
  private Boolean cambioPassword;

  @Column(name = "is_enabled")
  private boolean isEnabled = true;

  @Column(name = "account_no_expired")
  private boolean accountNoExpired = true;

  @Column(name = "account_no_locked")
  private boolean accountNoLocked = true;

  @Column(name = "credential_no_expired")
  private boolean credentialNoExpired = true;

  // Audit fields
  @CreatedDate
  @Column(name = "creado_en")
  private LocalDateTime creadoEn;

  @Column(name = "modificado_en")
  @LastModifiedDate
  private LocalDateTime modificadoEn;
}
