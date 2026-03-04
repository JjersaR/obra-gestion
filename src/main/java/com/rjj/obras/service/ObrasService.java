package com.rjj.obras.service;

import org.springframework.stereotype.Service;

import com.rjj.obras.controller.dto.IObrasMapper;
import com.rjj.obras.controller.dto.RObrasRequest;
import com.rjj.obras.controller.dto.RObrasUpdateRequest;
import com.rjj.obras.repository.IObrasRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ObrasService {

  private final IObrasRepository repository;
  private final IObrasMapper mapper;

  public Boolean guardar(RObrasRequest request) {
    var obra = mapper.toEntity(request);

    repository.save(obra);
    return true;
  }

  public Boolean actualizar(RObrasUpdateRequest request) {
    if (repository.existsByNombre(request.nombre())) {
      var obra = mapper.toEntity(request);
      repository.save(obra);
      return true;
    }
    return false;
  }
}
