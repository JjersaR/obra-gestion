package com.rjj.archivos.controller.dto;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

import com.rjj.archivos.entity.Archivos;

@Mapper(componentModel = "spring")
public interface IArchivoMapper {

  IArchivoMapper INSTANCE = Mappers.getMapper(IArchivoMapper.class);

  RArchivoResponse toDto(Archivos archivo);

  List<RArchivoResponse> toDtoList(List<Archivos> archivos);
}
