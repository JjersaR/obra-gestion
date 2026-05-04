package com.rjj.archivos.controller.dto;

public record RSasUrlResponse(
    String sasUrl, // URL para subir directo a Azure
    String objectKey // clave para guardar en tu BD después
) {

}
