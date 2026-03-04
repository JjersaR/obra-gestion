package com.rjj.archivos.controller.utils;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.rjj.movobra.entity.ETipo;

@Component
public class NameBuilder {
  private NameBuilder() {
  }

  public String build(
      ETipo tipoEntidad,
      UUID movobraId,
      ETipo categoria,
      int version,
      MultipartFile file) {

    String ownerType = tipoEntidad.name().toLowerCase();
    String category = categoria.name().toLowerCase();

    LocalDate now = LocalDate.now();

    String year = String.valueOf(now.getYear());
    String month = String.format("%02d", now.getMonthValue());

    String uuid = UUID.randomUUID().toString().substring(0, 8);

    String extension = getExtension(file);

    return String.format("%s/%s/%s/%s/%s/%s_v%d.%s",
        ownerType,
        movobraId,
        category,
        year,
        month,
        uuid,
        version,
        extension);
  }

  private String getExtension(MultipartFile file) {

    String name = file.getOriginalFilename();

    if (name == null || !name.contains(".")) {
      throw new IllegalArgumentException("Archivo sin extensión válida");
    }

    return name.substring(name.lastIndexOf(".") + 1);
  }
}
