package com.rjj.archivos.service;

import org.springframework.stereotype.Service;

import com.rjj.archivos.repository.IArchivosRepository;
import com.rjj.archivos.service.impl.MinioStorageServiceImpl;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ArchivosService {

  private final IArchivosRepository repository;
  private final MinioStorageServiceImpl storageService;
}
