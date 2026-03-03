package com.rjj.usuarios.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.rjj.usuarios.controller.dto.IUsuariosMapper;
import com.rjj.usuarios.controller.dto.RUsuariosRequest;
import com.rjj.usuarios.repository.IUsuariosRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsuariosService {

  private final IUsuariosRepository repository;
  private final IUsuariosMapper mapper;
  private final PasswordEncoder encoder;

  public Boolean guardar(RUsuariosRequest request) {
    var usuario = mapper.toEntity(request);

    String password = encoder.encode(usuario.getPassword());
    usuario.setPassword(password);
    repository.save(usuario);
    return true;
  }
}
