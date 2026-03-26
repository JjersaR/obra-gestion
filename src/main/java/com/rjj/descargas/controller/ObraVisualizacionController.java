package com.rjj.descargas.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.rjj.descargas.controller.dto.RVisualizacion;
import com.rjj.descargas.entity.ObraVisualizacion;
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

  // En ObraVisualizacionController.java
 @GetMapping("/{obraId}")
public List<ObraVisualizacion> obtenerVisualizaciones(@PathVariable String obraId) {
    // Cambia "repository" por "service"
    return service.obtenerPorObra(obraId); 
}
}
