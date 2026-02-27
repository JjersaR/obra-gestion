package com.rjj.usuarios.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rjj.usuarios.service.UsuariosService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/usuarios")
public class UsuariosController {

  private final UsuariosService service;

}
