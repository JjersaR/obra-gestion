package com.rjj.movobra.controller.dto;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import com.rjj.movobra.entity.Movobra;

@Mapper(componentModel = "spring")
public interface IMovObraMapper {
  IMovObraMapper INSTANCE = Mappers.getMapper(IMovObraMapper.class);

  // para que el RESIDENTE suba el archivo
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "usuarioApruebaId", ignore = true)
  @Mapping(target = "estado", ignore = true)
  @Mapping(target = "observaciones", ignore = true)
  @Mapping(target = "fechaPago", ignore = true)
  @Mapping(target = "ppComprobanteId", ignore = true)
  @Mapping(target = "pnComprobantePagoId", ignore = true)
  @Mapping(target = "RPago", ignore = true)
  @Mapping(target = "RFichaId", ignore = true)
  @Mapping(target = "RFacturaId", ignore = true)
  @Mapping(target = "creadoEn", ignore = true)
  @Mapping(target = "modificadoEn", ignore = true)
  Movobra toEntity(RRESIDENTERequest request);
}
