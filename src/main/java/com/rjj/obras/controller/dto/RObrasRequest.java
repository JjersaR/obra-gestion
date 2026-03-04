package com.rjj.obras.controller.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RObrasRequest(
    String nombre,
    BigDecimal montoAntesIva,
    LocalDate fechaInicio,
    LocalDate fechaFin,
    String status) {

}
