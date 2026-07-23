package com.rjj.usuarios.controller.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record RCodigoRecuperacion(

    @Email
    @NotBlank
    String email,

    @NotBlank
    @Pattern(regexp = "\\d{6}", message = "El código debe tener 6 dígitos")
    String codigo

) {
}