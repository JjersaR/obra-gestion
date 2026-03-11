package com.rjj.obras.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rjj.obras.controller.dto.RObrasRequest;
import com.rjj.obras.controller.dto.RObrasResponse;
import com.rjj.obras.service.ObrasService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/obras")
public class ObrasController {

  private final ObrasService service;

  @PostMapping
  @PreAuthorize("hasAnyRole('ADMINISTRACION', 'PRESUPUESTOS')")
  public ResponseEntity<String> crear(@RequestBody RObrasRequest request) {
    var guardado = service.guardar(request);
    return ResponseEntity.ok(guardado.toString());
  }

  @GetMapping
  public ResponseEntity<List<RObrasResponse>> listar() {
    var obras = service.findAll();
    return (obras.isEmpty()) ? ResponseEntity.notFound().build() : ResponseEntity.ok(obras);
  }

  @GetMapping("/detalles")
  public ResponseEntity<RObrasResponse> listarPorId(@RequestParam String id) {
    var obra = service.getById(id);
    return (obra.isEmpty()) ? ResponseEntity.notFound().build() : ResponseEntity.ok(obra.get());
  }

}
