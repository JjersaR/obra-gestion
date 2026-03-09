package com.rjj.descargas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rjj.descargas.entity.ObraVisualizacion;

@Repository
public interface ObraVisualizacionRepository
    extends JpaRepository<ObraVisualizacion, Long> {

  boolean existsByObraIdAndRolAndUsuarioId(String obraId, String rol, String usuarioId);
}
