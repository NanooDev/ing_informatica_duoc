package com.duoc.clientes.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@NoArgsConstructor
@AllArgsConstructor
@Data
public class ClientesModel {

    @NotNull(message = "El Id no puede ser null")
    private Integer id;

    @NotNull(message = "El nombre no puede ser null")
    @NotBlank(message = "El nombre no puede estar vacio")
    private String nombre;

    @NotNull(message = "El correo no puede ser null")
    @NotBlank(message = "El correo no puede estar vacio")
    private String correo;

    @NotNull(message = "La edad no puede ser null")
    @Positive(message = "La edad debe ser mayor a cero")
    private Integer edad;
}
