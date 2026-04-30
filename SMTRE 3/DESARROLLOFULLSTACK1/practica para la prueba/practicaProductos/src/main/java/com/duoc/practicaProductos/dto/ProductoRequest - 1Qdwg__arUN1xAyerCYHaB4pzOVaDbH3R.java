package com.duoc.practicaProductos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ProductoRequest {

    @NotBlank(message = "El nombre no puede estar vacio")
    private String nombre;

    @Positive(message = "La cantidad debe ser mayor cero")
    @NotNull(message = "La cantidad es obligatoria")
    private Integer cantidad;

    @Positive(message = "El precio debe ser mayor cero")
    @NotNull(message = "El precio es obligatorio")
    private Integer precio;
}
