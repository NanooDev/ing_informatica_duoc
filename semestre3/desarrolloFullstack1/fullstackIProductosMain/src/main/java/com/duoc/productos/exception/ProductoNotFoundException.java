package com.duoc.productos.exception;

public class ProductoNotFoundException extends RuntimeException {
    public ProductoNotFoundException(Integer id) {
        super("Producto no encontrado con id: " + id);
    }
}