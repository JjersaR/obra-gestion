package com.rjj.archivos.controller;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rjj.archivos.controller.dto.RArchivoRequest;
import com.rjj.archivos.controller.dto.RArchivoResponse;
import com.rjj.archivos.controller.dto.RListaArchivoRequest;
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

  @GetMapping
  public ResponseEntity<List<RArchivoResponse>> listarArchivos(@RequestBody RListaArchivoRequest request) {
    var archivos = service.listarArchivos(request.bucket(), request.tipoEntidad(), request.movobraId(),
        request.categoria());
    return (archivos.isEmpty()) ? ResponseEntity.notFound().build() : ResponseEntity.ok(archivos);
  }

}
