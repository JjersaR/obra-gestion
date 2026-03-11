package com.rjj.usuarios.controller.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RUsuarioCredencialesRequest(
    @NotBlank(message = "El email es obligatorio") @Email(message = "El email no tiene un formato válido") String nombre,
    @NotBlank(message = "La contraseña es obligatoria") @Size(min = 6, max = 100, message = "La contraseña debe tener al menos 6 caracteres") String password) {

}
