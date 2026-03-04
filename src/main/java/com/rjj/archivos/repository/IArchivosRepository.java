package com.rjj.archivos.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.rjj.archivos.entity.Archivos;
import com.rjj.movobra.entity.ETipo;

import jakarta.transaction.Transactional;

@Repository
public interface IArchivosRepository extends JpaRepository<Archivos, UUID> {

  @Query("""
      SELECT MAX(a.version)
      FROM Archivos a
      WHERE a.tipoEntidad = :tipoEntidad
      AND a.movobraId = :movobraId
      AND a.categoria = :categoria
       """)
  Integer findByMaxVersion(ETipo tipoEntidad, UUID movobraId, ETipo categoria);

  boolean existsByTipoEntidadAndMovobraIdAndCategoriaAndInmutableTrue(
      ETipo tipoEntidad, UUID movobraId, ETipo categoria);

  @Query("""
         UPDATE Archivos a
         SET a.actual = false
         WHERE a.tipoEntidad = :tipoEntidad
         AND a.movobraId = :movobraId
         AND a.categoria = :categoria
      """)
  @Modifying
  @Transactional
  void desactivarVersionesAnteriores(
      ETipo tipoEntidad,
      UUID movobraId,
      ETipo categoria);

}
