package com.rjj.movobra.controller;

import java.net.URI;
import java.net.URISyntaxException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rjj.movobra.controller.dto.RRESIDENTERequest;
import com.rjj.movobra.service.MovobraService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/movobra")
public class MovobraController {

  private final MovobraService service;
  private static final String API_V1_MOVOBRA = "/api/v1/movobra";

  @PostMapping
  public ResponseEntity<Boolean> guardarResidente(@RequestBody RRESIDENTERequest request) throws URISyntaxException {
    service.guardar(request);
    return ResponseEntity.created(new URI(API_V1_MOVOBRA)).build();
  }

}
