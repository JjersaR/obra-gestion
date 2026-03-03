package com.rjj.usuarios.controller.dto;

public record RUsuariosRequest(
    String nombre,
    String tipoUsuario,
    String email,
    String password,
    boolean cambioPassword,
    boolean isEnabled,
    boolean accountNoExpired,
    boolean accountNoLocked,
    boolean credentialNoExpired) {

}
