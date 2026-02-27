package com.rjj.obras.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rjj.obras.service.ObrasService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/obras")
public class ObrasController {

  private final ObrasService service;

}
