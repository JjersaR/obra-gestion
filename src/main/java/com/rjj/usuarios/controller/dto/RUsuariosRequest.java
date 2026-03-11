package com.rjj.usuarios.controller.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RUsuariosRequest(
    @NotBlank(message = "El nombre es obligatorio") @Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres") String nombre,
    @NotBlank(message = "El tipo de usuario es obligatorio") String tipoUsuario,
    @NotBlank(message = "El email es obligatorio") @Email(message = "El email no tiene un formato válido") String email,
    @NotBlank(message = "La contraseña es obligatoria") @Size(min = 6, max = 100, message = "La contraseña debe tener al menos 6 caracteres") String password,
    @NotNull(message = "Debe indicar si requiere cambio de contraseña") Boolean cambioPassword,
    @NotNull(message = "Debe indicar si el usuario está habilitado") Boolean isEnabled,
    @NotNull(message = "Debe indicar si la cuenta no ha expirado") Boolean accountNoExpired,
    @NotNull(message = "Debe indicar si la cuenta no está bloqueada") Boolean accountNoLocked,
    @NotNull(message = "Debe indicar si las credenciales no han expirado") Boolean credentialNoExpired) {

}
