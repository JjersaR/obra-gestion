package com.rjj.obras.controller.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

public record RObrasRequest(
    String nombre,
    BigDecimal montoAntesIva,
    @JsonFormat(pattern = "yyyy-MM-dd") LocalDate fechaInicio,
    @JsonFormat(pattern = "yyyy-MM-dd") LocalDate fechaFin,
    String status) {

}
