package com.rjj.usuarios.controller;

import java.net.URI;
import java.net.URISyntaxException;

//login
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rjj.usuarios.controller.dto.RUsuarioCredencialesRequest;
import com.rjj.usuarios.controller.dto.RUsuarioRegistrado;
import com.rjj.usuarios.controller.dto.RUsuariosRequest;
import com.rjj.usuarios.service.UsuariosService;

import jakarta.annotation.security.PermitAll;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/usuarios")
public class UsuariosController {

  private static final String API_V1_USUARIOS = "/api/v1/usuarios";

  private final UsuariosService service;

  // Instanciamos el repositorio oficial de Spring para guardar sesiones
  private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

  @PermitAll
  @PostMapping
  public ResponseEntity<Boolean> guardar(@RequestBody RUsuariosRequest request) throws URISyntaxException {
    service.guardar(request);
    return ResponseEntity.created(new URI(API_V1_USUARIOS)).build();
  }

  @PostMapping("/login")
  public ResponseEntity<RUsuarioRegistrado> login(@RequestBody RUsuarioCredencialesRequest request,
    HttpServletRequest httpRequest, HttpServletResponse httpResponse) { // Pedimos acceso a la petició

    var login = service.iniciarSesion(request);

    if (login.isPresent()) {
        // ¡LA MAGIA OCURRE AQUÍ! 
        // Obligamos a Spring a guardar la sesión en la memoria del navegador
        securityContextRepository.saveContext(SecurityContextHolder.getContext(), httpRequest, httpResponse);
        
        return ResponseEntity.ok(login.get());
    } else {
        return ResponseEntity.noContent().build();
    }
    //return (login.isEmpty()) ? ResponseEntity.noContent().build() : ResponseEntity.ok(login.get());
  }
}
