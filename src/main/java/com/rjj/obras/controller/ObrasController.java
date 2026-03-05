package com.rjj.obras.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rjj.obras.controller.dto.RObrasRequest;
import com.rjj.obras.service.ObrasService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/obras")
public class ObrasController {

  private final ObrasService service;

  @PostMapping
  public ResponseEntity<String> crear(@RequestBody RObrasRequest request) {
    var guardado = service.guardar(request);
    return ResponseEntity.ok(guardado.toString());
  }

}
