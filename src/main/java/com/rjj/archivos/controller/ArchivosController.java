package com.rjj.archivos.controller;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
//para archivos 
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestParam;

import com.rjj.archivos.controller.dto.IRequerimientosActivos;
import com.rjj.archivos.controller.dto.RArchivoRequest;
import com.rjj.archivos.service.ArchivosService;
import com.rjj.movobra.entity.ETipo;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/archivos")
public class ArchivosController {

  private final ArchivosService service;
  private static final String API_V1_ARCHIVOS = "/api/v1/archivos";

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<String> guardar(@ModelAttribute RArchivoRequest request) throws URISyntaxException {
    var archivo = service.subirArchivo(ETipo.valueOf(request.tipoEntidad()), UUID.fromString(request.movobraId()),
        ETipo.valueOf(request.categoria()), request.file());

    return ResponseEntity.created(new URI(API_V1_ARCHIVOS)).body(archivo.toString());
  }

  @GetMapping("/{movobraId}")
  public ResponseEntity<List<IRequerimientosActivos>> listarRequerimientosActivos(@PathVariable String movobraId) {
    var archivos = service.findByRequerimientosActivos(UUID.fromString(movobraId));
    return (archivos.isEmpty()) ? ResponseEntity.noContent().build() : ResponseEntity.ok(archivos);
  }

  //ARCHIVOS
  @GetMapping("/descargar")
  public ResponseEntity<Resource> descargarArchivo(
      @RequestParam String categoria,
      @RequestParam String url,
      @RequestParam(required = false) String nombrePersonalizado // ¡NUEVO PARÁMETRO!
  ) {
    
    // Vamos al servicio por el archivo de MinIO
    var stream = service.descargarArchivo(categoria, url);
    var resource = new InputStreamResource(stream);

    // Si el frontend nos mandó un nombre bonito, lo usamos. Si no, usamos la ruta.
    String nombreFinal = (nombrePersonalizado != null && !nombrePersonalizado.isEmpty()) 
        ? nombrePersonalizado 
        : url.substring(url.lastIndexOf("/") + 1);

    // Preparamos la respuesta HTTP forzando la descarga
    return ResponseEntity.ok()
        // La cabecera "attachment" le dice al navegador que lo descargue, no que lo abra en una pestaña nueva
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nombreFinal + "\"")
        // OCTET_STREAM es un comodín para decirle que es un archivo binario genérico
        .contentType(MediaType.APPLICATION_OCTET_STREAM)
        .body(resource);
  }

}
