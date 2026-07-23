package com.rjj.usuarios.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rjj.usuarios.entity.PasswordReset;
import com.rjj.usuarios.entity.Usuarios;

@Repository
public interface IPasswordResetRepository extends JpaRepository<PasswordReset, UUID> {
Optional<PasswordReset> findFirstByUsuarioAndUsadoFalseOrderByCreadoEnDesc(Usuarios usuario);

}