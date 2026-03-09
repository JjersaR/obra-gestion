package com.rjj.descargas.service;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.rjj.descargas.controller.dto.RVisualizacion;
import com.rjj.descargas.entity.ObraVisualizacion;
import com.rjj.descargas.repository.ObraVisualizacionRepository;

@Service
public class ObraVisualizacionService {

  @Autowired
  private ObraVisualizacionRepository repository;

  public void registrarVisualizacion(RVisualizacion registrar) {

    if (!repository.existsByObraIdAndRolAndUsuarioId(registrar.obraId(), registrar.rol(), registrar.usuarioId())) {

      ObraVisualizacion v = new ObraVisualizacion();
      v.setObraId(registrar.obraId());
      v.setRol(registrar.rol());
      v.setUsuarioId(registrar.usuarioId());
      v.setFecha(LocalDateTime.now());

      repository.save(v);
    }
  }
}
