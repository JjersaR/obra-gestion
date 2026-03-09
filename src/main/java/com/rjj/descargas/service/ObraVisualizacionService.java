package com.rjj.descargas.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.rjj.descargas.entity.ObraVisualizacion;
import com.rjj.descargas.repository.ObraVisualizacionRepository;

@Service
public class ObraVisualizacionService {

    @Autowired
    private ObraVisualizacionRepository repository;

    public void registrarVisualizacion(UUID obraId, String rol){

        if(!repository.existsByObraIdAndRol(obraId, rol)){

            ObraVisualizacion v = new ObraVisualizacion();
            v.setObraId(obraId);
            v.setRol(rol);
            v.setFecha(LocalDateTime.now());

            repository.save(v);
        }
    }
}