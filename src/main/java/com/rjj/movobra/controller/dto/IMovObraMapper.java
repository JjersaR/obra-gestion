package com.rjj.movobra.controller.dto;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.rjj.movobra.entity.Movobra;

@Mapper(componentModel = "spring")
public interface IMovObraMapper {

  @Mapping(target = "id", ignore = true)
  @Mapping(target = "usuarioApruebaId", ignore = true)
  @Mapping(target = "estado", ignore = true)
  @Mapping(target = "observaciones", ignore = true)
  @Mapping(target = "pagado", ignore = true)
  @Mapping(target = "creadoEn", ignore = true)
  @Mapping(target = "modificadoEn", ignore = true)
  Movobra toEntity(RMovObraRequest request);
}
