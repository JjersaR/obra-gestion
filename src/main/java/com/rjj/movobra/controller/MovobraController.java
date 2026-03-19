package com.rjj.movobra.controller;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rjj.movobra.controller.dto.IMovObraTabla;
import com.rjj.movobra.controller.dto.RMovObraRequest;
import com.rjj.movobra.controller.dto.RMovObraUpdateRequest;
import com.rjj.movobra.service.MovobraService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/movobra")
public class MovobraController {

  private final MovobraService service;
  private static final String API_V1_MOVOBRA = "/api/v1/movobra";

  @PostMapping
  public ResponseEntity<Boolean> guardar(@RequestBody RMovObraRequest request) throws URISyntaxException {
    service.guardar(request);
    return ResponseEntity.created(new URI(API_V1_MOVOBRA)).build();
  }

  @GetMapping("/{id}/{categoria}/{movimiento}")
  public ResponseEntity<List<IMovObraTabla>> datosParaTabla(@PathVariable String id, @PathVariable String categoria,
      @PathVariable String movimiento) {
    return ResponseEntity.ok(service.datosParaTabla(UUID.fromString(id), categoria, movimiento));
  }

  @PutMapping("/{id}")
  public ResponseEntity<Void> actualizar(
      @PathVariable UUID id,
      @RequestBody RMovObraUpdateRequest request) {
    service.actualizar(id, request);
    return ResponseEntity.noContent().build();
  }

  @PutMapping("/pago/{id}")
  public ResponseEntity<Void> actualizarPagado(@PathVariable UUID id) {
    service.actualizarPagado(id);
    return ResponseEntity.noContent().build();
  }

}
