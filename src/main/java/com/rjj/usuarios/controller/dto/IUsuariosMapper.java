package com.rjj.usuarios.controller.dto;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import com.rjj.usuarios.entity.Usuarios;

@Mapper(componentModel = "spring")
public interface IUsuariosMapper {
  IUsuariosMapper INSTANCE = Mappers.getMapper(IUsuariosMapper.class);

  // Para guardar el usuario
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "creadoEn", ignore = true)
  @Mapping(target = "modificadoEn", ignore = true)
  Usuarios toEntity(RUsuariosRequest request);
}
