package com.rjj.obras.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rjj.obras.entity.Obras;

@Repository
public interface IObrasRepository extends JpaRepository<Obras, UUID> {

}
