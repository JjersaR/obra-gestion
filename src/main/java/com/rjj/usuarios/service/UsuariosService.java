package com.rjj.usuarios.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.rjj.usuarios.repository.IUsuariosRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsuariosService {

  private final IUsuariosRepository repository;
  private final PasswordEncoder encoder;
}
