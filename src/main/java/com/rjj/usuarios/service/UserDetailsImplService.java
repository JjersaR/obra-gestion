package com.rjj.usuarios.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.authentication.AccountExpiredException;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.rjj.usuarios.entity.Usuarios;
import com.rjj.usuarios.repository.IUsuariosRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserDetailsImplService implements UserDetailsService {

  private final IUsuariosRepository repository;

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    log.debug("Buscando usuario {}", username);

    var usuario = repository.findByEmailOrNombre(username).orElseThrow(() -> {
      log.warn("Usuario no encontrado con credencial: {}", username);
      return new UsernameNotFoundException("Usuario no encontrado: " + username);
    });

    // Verificar que el usuario esté habilitado
    if (!usuario.isEnabled()) {
      log.warn("Intento de login para usuario deshabilitado: {}", username);
      throw new DisabledException("La cuenta está deshabilitada");
    }

    // Verificar que la cuenta no esté bloqueada
    if (!usuario.isAccountNoLocked()) {
      log.warn("Intento de login para cuenta bloqueada: {}", username);
      throw new LockedException("La cuenta está bloqueada");
    }

    // Verificar que la cuenta no haya expirado
    if (!usuario.isAccountNoExpired()) {
      log.warn("Intento de login para cuenta expirada: {}", username);
      throw new AccountExpiredException("La cuenta ha expirado");
    }

    // Verificar que las credenciales no hayan expirado
    if (!usuario.isCredentialNoExpired()) {
      log.warn("Intento de login con credenciales expiradas: {}", username);
      throw new CredentialsExpiredException("Las credenciales han expirado");
    }

    var autoridades = crearAutoridades(usuario);

    log.debug("Usuario encontrado: {}", usuario.getNombre());

    return new User(usuario.getNombre(), usuario.getPassword(), usuario.isEnabled(), usuario.isAccountNoExpired(),
        usuario.isCredentialNoExpired(), usuario.isAccountNoLocked(), autoridades);
  }

  private List<GrantedAuthority> crearAutoridades(Usuarios usuario) {
    List<GrantedAuthority> authorities = new ArrayList<>();

    // Obtenemos el rol
    authorities.add(new SimpleGrantedAuthority("ROLE_" + usuario.getTipoUsuario().name()));

    // Agregamos permisos
    switch (usuario.getTipoUsuario()) {
      case RESIDENTE:
        break;
      case GERENTE:
        authorities.add(new SimpleGrantedAuthority(""));
        break;
      case CONTADOR:
        authorities.add(new SimpleGrantedAuthority(""));
        break;
      case ADMINISTRACION:
        authorities.add(new SimpleGrantedAuthority(""));
        break;
      case COMPRAS:
        authorities.add(new SimpleGrantedAuthority(""));
        break;
      case PRESUPUESTOS:
        authorities.add(new SimpleGrantedAuthority(""));
        break;
    }

    return authorities;
  }
}
