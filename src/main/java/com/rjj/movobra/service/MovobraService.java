package com.rjj.movobra.service;

import org.springframework.stereotype.Service;

import com.rjj.movobra.repository.IMovobraRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MovobraService {

  private final IMovobraRepository repository;
}
