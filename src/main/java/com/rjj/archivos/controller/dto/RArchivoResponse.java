package com.rjj.archivos.controller.dto;

public record RArchivoResponse(
    String id,
    String url,
    String nombre,
    String tipoEntidad,
    String movobraId,
    String categoria,
    Integer version,
    Boolean actual) {

}
