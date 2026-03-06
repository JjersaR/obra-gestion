package com.rjj.archivos.controller.dto;

import org.springframework.web.multipart.MultipartFile;

public record RArchivoRequest(
    String tipoEntidad,
    String movobraId,
    String categoria,
    MultipartFile file) {

}
