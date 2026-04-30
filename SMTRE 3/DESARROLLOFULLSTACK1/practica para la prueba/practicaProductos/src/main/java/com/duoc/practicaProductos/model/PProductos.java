package com.duoc.practicaProductos.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "productos")
public class PProductos {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull(message = "No puede ser nulo")
    @NotBlank(message = "No puede estar vacio")
    private String nombre;

    @Positive(message = "Debe ser mayor que cero")
    private Integer cantidad;

    @Positive(message = "Debe ser mayor que cero")
    private Integer precio;
}
