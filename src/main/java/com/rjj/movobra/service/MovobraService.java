package com.rjj.movobra.service;

import org.springframework.stereotype.Service;

import com.rjj.movobra.controller.dto.IMovObraMapper;
import com.rjj.movobra.controller.dto.RRESIDENTERequest;
import com.rjj.movobra.repository.IMovobraRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MovobraService {

  private final IMovobraRepository repository;
  private final IMovObraMapper mapper;

  public boolean guardar(RRESIDENTERequest request) {
    repository.save(mapper.toEntity(request));
    return true;
  }
}
