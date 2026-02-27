package com.rjj.archivos.service.impl;

import org.springframework.stereotype.Service;

import com.rjj.archivos.service.IStorageService;

import io.minio.MinioClient;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@AllArgsConstructor
public class MinioStorageServiceImpl implements IStorageService {

  private MinioClient minioClient;

}
