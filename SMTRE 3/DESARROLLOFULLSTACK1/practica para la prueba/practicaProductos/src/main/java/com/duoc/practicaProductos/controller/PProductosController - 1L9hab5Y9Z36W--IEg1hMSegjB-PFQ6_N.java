package com.duoc.practicaProductos.controller;

import com.duoc.practicaProductos.dto.ProductoDTO;
import com.duoc.practicaProductos.model.PProductos;
import com.duoc.practicaProductos.repository.PProductosRepository;
import com.duoc.practicaProductos.service.PProductosService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1/pproductos")
public class PProductosController {
    @Autowired
    private PProductosService pproductosService;

    public ResponseEntity<ProductoDTO> guardar(@Valid @RequestBody PProductos productos) {
        try{
            return ResponseEntity.status(200).body(pproductosService.guardar(productos));
        }catch(Exception ex){
            return new ResponseEntity("Error al crear un producto",HttpStatus.BAD_REQUEST);
        }
    }
}
