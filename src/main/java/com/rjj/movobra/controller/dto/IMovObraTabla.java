package com.rjj.movobra.controller.dto;

import java.time.LocalDateTime;

public interface IMovObraTabla {
  String getMovobraid();

  String getNombre();

  String getUrl();

  String getBucket();

  LocalDateTime getFechasubida();

  String getTipousuarioregistra();

  String getEstado();

  String getObservaciones();

  boolean getPagado();

  boolean getJefe();

  String getNombreobra();
}
