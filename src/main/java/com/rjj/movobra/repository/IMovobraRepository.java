package com.rjj.movobra.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rjj.movobra.entity.Movobra;

@Repository
public interface IMovobraRepository extends JpaRepository<Movobra, UUID> {

}
