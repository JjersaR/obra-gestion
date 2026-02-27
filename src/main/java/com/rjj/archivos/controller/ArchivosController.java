package com.rjj.archivos.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rjj.archivos.service.ArchivosService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/archivos")
public class ArchivosController {

  private final ArchivosService service;

}
