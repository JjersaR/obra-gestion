package com.rjj.usuarios.service;

import java.util.Optional;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.rjj.usuarios.controller.dto.IUsuariosMapper;
import com.rjj.usuarios.controller.dto.RUsuarioCredencialesRequest;
import com.rjj.usuarios.controller.dto.RUsuarioRegistrado;
import com.rjj.usuarios.controller.dto.RUsuariosRequest;
import com.rjj.usuarios.repository.IUsuariosRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UsuariosService {

  private final IUsuariosRepository repository;
  private final IUsuariosMapper mapper;
  private final PasswordEncoder encoder;
  private final AuthenticationManager authenticationManager;

  public Boolean guardar(RUsuariosRequest request) {
    var usuario = mapper.toEntity(request);

    String password = encoder.encode(usuario.getPassword());
    usuario.setPassword(password);
    repository.save(usuario);
    return true;
  }

  public Optional<RUsuarioRegistrado> iniciarSesion(RUsuarioCredencialesRequest request) {
    try {
      log.info("Intentando autenticar a {}", request.nombre());

      // se autentica el usuario
      Authentication auth = authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(
              request.nombre(),
              request.password()));

      // se le avisa a spring que el usuario se ha autenticado
      SecurityContextHolder.getContext().setAuthentication(auth);

      // se recupera los detalles del usuario
      CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();

      // se retorna el usuario
      return Optional.of(
          new RUsuarioRegistrado(
              userDetails.getId().toString(),
              userDetails.getUsername(),
              userDetails.getTipoUsuario(),
              userDetails.getEmail()));

    } catch (AuthenticationException ex) {
      log.warn("Error de autenticación: {}", ex.getMessage());
      return Optional.empty();
    }
  }

}
