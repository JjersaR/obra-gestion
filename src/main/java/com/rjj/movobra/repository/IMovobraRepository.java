package com.rjj.movobra.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.rjj.movobra.controller.dto.IMovObraTabla;
import com.rjj.movobra.entity.ETipo;
import com.rjj.movobra.entity.Movobra;

@Repository
public interface IMovobraRepository extends JpaRepository<Movobra, UUID> {

  @Query(value = """
      SELECT
        -- ID
        mo.id AS movobraid,

        -- Archivo
        a.nombre,
        a.url,
        a.bucket,
        a.creado_en AS fechasubida,

        -- Usuario que sube (registra)
        u.tipo_usuario tipoUsuarioRegistra,

        -- Movimiento
        mo.estado,
        mo.observaciones,
        mo.pagado,
        mo.jefe,

          -- Obra
          o.nombre nombreobra

        FROM movimiento_obras mo

        -- Archivo principal
        INNER JOIN archivos a
          ON a.id = mo.archivo_id
          AND a.movobra_id = mo.obra_id

        -- Usuario que subió (registra)
        INNER JOIN usuarios u
          ON u.id = mo.usuario_registra_id

        -- obra
        INNER JOIN obras o
          ON o.id = a.movobra_id

        WHERE
          mo.obra_id = :obraId
          AND mo.tipo_movimiento = :movimiento
          AND a.categoria = :categoria
                  """, nativeQuery = true)
  List<IMovObraTabla> datosParaTabla(UUID obraId, String categoria, String movimiento);

}
