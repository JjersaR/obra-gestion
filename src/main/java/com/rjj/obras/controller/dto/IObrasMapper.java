package com.rjj.obras.controller.dto;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import com.rjj.obras.entity.Obras;

@Mapper(componentModel = "spring")
public interface IObrasMapper {
  IObrasMapper INSTANCE = Mappers.getMapper(IObrasMapper.class);

  // Para guardar obra
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "creadoEn", ignore = true)
  @Mapping(target = "modificadoEn", ignore = true)
  Obras toEntity(RObrasRequest request);

  // Para actualizar obra
  @Mapping(target = "creadoEn", ignore = true)
  @Mapping(target = "modificadoEn", ignore = true)
  Obras toEntity(RObrasUpdateRequest request);
}
