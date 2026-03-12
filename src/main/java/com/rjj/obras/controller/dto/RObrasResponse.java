package com.rjj.obras.controller.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RObrasResponse(
    String id,
    String nombre,
    String cliente,
    BigDecimal montoAntesIva,
    LocalDate fechaInicio,
    LocalDate fechaFin,
    int noSemanas,
    String gerente,
    String residente,
    String status) {

}
