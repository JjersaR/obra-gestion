package com.rjj.obras.controller.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonFormat;

public record RActualizarFecha(
        UUID id,
        String nombre, 
        BigDecimal montoAntesIva,
        String residente,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate fechaInicio,
        @JsonFormat(pattern = "yyyy-MM-dd") LocalDate fechaFin,
        Integer noSemanas) {

}
