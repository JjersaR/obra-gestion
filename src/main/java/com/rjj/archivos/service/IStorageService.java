package com.rjj.archivos.service;

import java.io.InputStream;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import com.rjj.movobra.entity.ETipo;

public interface IStorageService {
  String upload(
      ETipo tipoEntidad,
      UUID movobraId,
      ETipo categoria,
      int version,
      MultipartFile file);

  InputStream download(String bucket, String objectKey);
}
