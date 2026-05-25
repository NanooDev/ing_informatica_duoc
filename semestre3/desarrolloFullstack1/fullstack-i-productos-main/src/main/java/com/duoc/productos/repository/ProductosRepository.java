package com.duoc.productos.repository;

import com.duoc.productos.model.Productos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductosRepository extends JpaRepository<Productos, Integer> {
    List<Productos> findProductosByNombreContainsIgnoreCase(String nombre);
}
