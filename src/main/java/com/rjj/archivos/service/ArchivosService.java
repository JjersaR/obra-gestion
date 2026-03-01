package com.rjj.archivos.service;

import org.springframework.stereotype.Service;

import com.rjj.archivos.repository.IArchivosRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ArchivosService {

  private final IArchivosRepository repository;
  private final IStorageService storageService;
}
