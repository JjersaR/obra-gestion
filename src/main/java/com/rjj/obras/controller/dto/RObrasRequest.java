package com.rjj.obras.controller.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.annotation.Nullable;

public record RObrasRequest(
    String nombre,
    String cliente,
    BigDecimal montoAntesIva,
    @Nullable @JsonFormat(pattern = "yyyy-MM-dd") LocalDate fechaInicio,
    @Nullable @JsonFormat(pattern = "yyyy-MM-dd") LocalDate fechaFin,
    @Nullable Integer noSemanas,
    String gerente,
    String residente,
    String observaciones,
    String status) {

}
