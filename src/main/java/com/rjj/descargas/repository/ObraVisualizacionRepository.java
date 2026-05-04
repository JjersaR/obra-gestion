package com.rjj.descargas.repository;

import java.util.List; // <--- ESTE ES EL QUE SUELE FALTAR
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import com.rjj.descargas.entity.ObraVisualizacion;

@Repository
public interface ObraVisualizacionRepository extends JpaRepository<ObraVisualizacion, Long> {

  // Para evitar duplicados
  boolean existsByObraIdAndRolAndUsuarioId(String obraId, String rol, String usuarioId);

  // Para obtener la lista de quién ha visto la obra
  List<ObraVisualizacion> findByObraId(String obraId);

  @Modifying
  long deleteByObraId(String obraId);
}
