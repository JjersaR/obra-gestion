package com.rjj.obras.controller.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RObrasUpdateRequest(
    String id,
    String nombre,
    BigDecimal montoAntesIva,
    LocalDate fechaInicio,
    LocalDate fechaFin,
    String status) {

}
