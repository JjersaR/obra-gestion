package com.rjj.usuarios.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.rjj.usuarios.entity.Usuarios;

@Repository
public interface IUsuariosRepository extends JpaRepository<Usuarios, UUID> {

  Optional<Usuarios> findById(UUID id);

  Optional<Usuarios> findByEmail(String email);

  Optional<Usuarios> findByNombre(String nombre);

  @Query("SELECT u FROM Usuarios u WHERE u.email = ?1 OR u.nombre = ?1")
  Optional<Usuarios> findByEmailOrNombre(String nombre);
}
