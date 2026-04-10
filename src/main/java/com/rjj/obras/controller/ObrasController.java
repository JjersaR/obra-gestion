package com.rjj.obras.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rjj.obras.controller.dto.RActualizarFecha;
import com.rjj.obras.controller.dto.RObrasRequest;
import com.rjj.obras.controller.dto.RObrasResponse;
import com.rjj.obras.service.ObrasService;

import jakarta.websocket.server.PathParam;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/obras")
public class ObrasController {

  private final ObrasService service;

  @PostMapping
  @PreAuthorize("hasAnyRole('ADMINISTRACION', 'PRESUPUESTOS')")
  public ResponseEntity<String> crear(@RequestBody RObrasRequest request) {
    // guardar en la BD
    var id = service.guardar(request);
    log.info("¡Obra recibida y guardada exitosamente!");
    // Devolvemos un 201 Created para que el JS muestre el alert
    return ResponseEntity.status(HttpStatus.CREATED).body(id.toString());
  }

  @GetMapping
  public ResponseEntity<List<RObrasResponse>> listar() {
    var obras = service.findAll();
    return (obras.isEmpty()) ? ResponseEntity.notFound().build() : ResponseEntity.ok(obras);
  }

  @GetMapping("/detalles/{id}")
  public ResponseEntity<RObrasResponse> listarPorId(@PathVariable String id) {
    var obra = service.getById(id);
    return (obra.isEmpty()) ? ResponseEntity.notFound().build() : ResponseEntity.ok(obra.get());
  }

  // Usamos PATCH para modificar el estatus de la obra
  @PatchMapping("/{id}/estatus")
  @PreAuthorize("hasRole('GERENTE')") //  Solo el Gerente pasa
  public ResponseEntity<Void> cambiarEstatus(@PathVariable String id, @RequestBody Map<String, String> request) {
      
      String nuevoEstatus = request.get("status"); // Cierre del JSON
      
      service.actualizarEstatus(id, nuevoEstatus);
      
      return ResponseEntity.ok().build();
  }

  @PatchMapping
  public ResponseEntity<Void> actualizarFecha(@RequestBody RActualizarFecha request) {
    service.actualizarFecha(request);
    return ResponseEntity.ok().build();
  }

}
