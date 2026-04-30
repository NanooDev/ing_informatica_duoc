package com.duoc.productos.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ProductoRequest {

    @NotBlank(message = "El nombre no puede estar vacío")
    private String nombre;

    @Positive(message = "La cantidad debe ser mayor a cero")
    @NotNull(message = "La cantidad es obligatoria")
    private Integer cantidad;

    @Positive(message = "El precio debe ser mayor a cero")
    @NotNull(message = "El precio es obligatorio")
    private Integer precio;
}