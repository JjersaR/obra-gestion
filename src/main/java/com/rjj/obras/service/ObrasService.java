package com.rjj.obras.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.rjj.obras.controller.dto.IObrasMapper;
import com.rjj.obras.controller.dto.RObrasRequest;
import com.rjj.obras.repository.IObrasRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ObrasService {

  private final IObrasRepository repository;
  private final IObrasMapper mapper;

  public UUID guardar(RObrasRequest request) {
    var obra = mapper.toEntity(request);

    var guardado = repository.save(obra);
    return guardado.getId();
  }

}
