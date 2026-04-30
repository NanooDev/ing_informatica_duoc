package com.duoc.practicaProductos.repository;

import com.duoc.practicaProductos.model.PProductos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public interface PProductosRepository extends JpaRepository<PProductos, Integer> {
}
