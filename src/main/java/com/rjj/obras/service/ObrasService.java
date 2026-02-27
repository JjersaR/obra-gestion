package com.rjj.obras.service;

import org.springframework.stereotype.Service;

import com.rjj.obras.repository.IObrasRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ObrasService {

  private final IObrasRepository repository;
}
