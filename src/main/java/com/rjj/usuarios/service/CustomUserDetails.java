package com.rjj.usuarios.service;

import java.util.Collection;
import java.util.UUID;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CustomUserDetails implements UserDetails {
  private final UUID id;
  private final String username;
  private final String email;
  private final String password;
  private final String tipoUsuario;
  private final boolean enabled;
  private final boolean accountNonLocked;
  private final boolean accountNonExpired;
  private final boolean credentialsNonExpired;
  private final Collection<? extends GrantedAuthority> authorities;

}
