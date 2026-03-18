package com.rjj.movobra.controller.dto;

public record RMovObraRequest(
    String obraId, // FK
    String tipoMovimiento, // ETipo
    String usuarioRegistraId,
    String archivoId) {

}
