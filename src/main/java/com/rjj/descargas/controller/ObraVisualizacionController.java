package com.rjj.descargas.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.rjj.descargas.controller.dto.RVisualizacion;
import com.rjj.descargas.service.ObraVisualizacionService;

@RestController
@RequestMapping("/api/v1/visualizacion")
public class ObraVisualizacionController {

  @Autowired
  private ObraVisualizacionService service;

  @PostMapping
  public String registrar(@RequestBody RVisualizacion visualizacion) {
    service.registrarVisualizacion(visualizacion);
    return "Visualizacion registrada";
  }
}
