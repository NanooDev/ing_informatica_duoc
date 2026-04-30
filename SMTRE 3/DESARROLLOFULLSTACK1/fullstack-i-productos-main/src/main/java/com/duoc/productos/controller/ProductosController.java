package com.duoc.productos.controller;

import com.duoc.productos.dto.ProductoDTO;
import com.duoc.productos.dto.ProductoRequest;
import com.duoc.productos.service.ProductosService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/productos")
public class ProductosController {

    @Autowired
    private ProductosService productosService;

    @PostMapping
    public ResponseEntity<ProductoDTO> guardar(@Valid @RequestBody ProductoRequest request) {
        return new ResponseEntity<>(productosService.guardar(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ProductoDTO>> listar(@RequestParam(required = false) String nombre) {
        List<ProductoDTO> productos;
        if (nombre != null) {
            productos = productosService.buscarPorNombre(nombre);
        } else {
            productos = productosService.listar();
        }

        if (productos.isEmpty()) return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        return new ResponseEntity<>(productos, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoDTO> buscarPorId(@PathVariable Integer id) {
        return new ResponseEntity<>(productosService.buscarPorId(id), HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductoDTO> actualizar(@PathVariable Integer id, @Valid @RequestBody ProductoRequest request) {
        return new ResponseEntity<>(productosService.actualizar(id, request), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
           productosService.eliminar(id);
           return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}