package com.rjj.archivos.controller.dto;

public record RConfirmarArchivoRequest(
    String tipoEntidad,
    String movobraId,
    String categoria,
    String objectKey,
    String nombre,
    long sizeBytes,
    String mimeType,
    int version) {

}
