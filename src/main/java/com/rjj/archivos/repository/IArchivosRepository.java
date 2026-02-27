package com.rjj.archivos.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rjj.archivos.entity.Archivos;

@Repository
public interface IArchivosRepository extends JpaRepository<Archivos, UUID> {

}
