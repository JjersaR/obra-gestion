package com.rjj.usuarios.controller.dto;

import jakarta.validation.constraints.Email;

public record RContraOlvidada(@Email String email) {

}
