package com.rjj.movobra.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rjj.movobra.service.MovobraService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/movobra")
public class MovobraController {

  private final MovobraService service;

}
