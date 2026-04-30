package com.duoc.practicaProductos.dto;

import lombok.Data;

@Data
public class ProductoDTO {
    private Integer id;
    private String nombre;
    private Integer cantidad;
    private Integer precio;
}
