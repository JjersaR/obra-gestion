package com.rjj.descargas.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.rjj.descargas.entity.ObraVisualizacion;

public interface ObraVisualizacionRepository 
        extends JpaRepository<ObraVisualizacion, Long> {

    boolean existsByObraIdAndRol(UUID obraId, String rol);
}