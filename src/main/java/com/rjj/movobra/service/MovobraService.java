package com.rjj.movobra.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.rjj.movobra.controller.dto.IMovObraMapper;
import com.rjj.movobra.controller.dto.IMovObraTabla;
import com.rjj.movobra.controller.dto.RMovObraRequest;
import com.rjj.movobra.controller.dto.RMovObraUpdateRequest;
import com.rjj.movobra.controller.dto.RPago;
import com.rjj.movobra.entity.ETipo;
import com.rjj.movobra.repository.IMovobraRepository;
import com.rjj.usuarios.service.CustomUserDetails;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MovobraService {

  private final IMovobraRepository repository;
  private final IMovObraMapper mapper;

  public boolean guardar(RMovObraRequest request) {
    repository.save(mapper.toEntity(request));
    return true;
  }

  public List<IMovObraTabla> datosParaTabla(UUID movobraId, String categoria, String movimiento) {
    return repository.datosParaTabla(movobraId, categoria, movimiento);
  }

  @Transactional
  public void actualizar(UUID obraId, RMovObraUpdateRequest request) {

    var movobra = repository.findById(obraId).get();

    if (request.estado() != null) {
      movobra.setEstado(ETipo.valueOf(request.estado()));
    }

    if (ETipo.valueOf(request.estado()) == ETipo.ACEPTADO) {
      Authentication auth = SecurityContextHolder.getContext().getAuthentication();
      var principal = (CustomUserDetails) auth.getPrincipal();
      movobra.setUsuarioApruebaId(principal.getId());
    }

    if (request.observaciones() != null) {
      movobra.setObservaciones(request.observaciones());
    }

    repository.save(movobra);
  }

  @Transactional
  public void actualizarPagado(RPago request) {
    var movobra = repository.findById(request.id()).get();
    movobra.setPagado(request.pagado());
    repository.save(movobra);
  }
}
