package com.rjj.descargas.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.*;

@Entity
@Table(name = "obra_visualizacion")
public class ObraVisualizacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private UUID obraId;

    private String rol;

    private LocalDateTime fecha;

    public ObraVisualizacion(){}

    public Long getId() {
        return id;
    }

    public UUID getObraId() {
        return obraId;
    }

    public void setObraId(UUID obraId) {
        this.obraId = obraId;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
}