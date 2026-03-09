package com.rjj.descargas.controller;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.rjj.descargas.service.ObraVisualizacionService;

@RestController
@RequestMapping("/api/v1/visualizacion")
public class ObraVisualizacionController {

    @Autowired
    private ObraVisualizacionService service;

    @PostMapping
    public String registrar(
            @RequestParam UUID obraId,
            @RequestParam String rol){

        service.registrarVisualizacion(obraId, rol);

        return "Visualizacion registrada";
    }
}