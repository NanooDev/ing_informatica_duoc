package com.example.demo.controller;

import com.example.demo.model.ClientesModel;
import com.example.demo.service.ClientesService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/clientes")
public class ClientesController {
    @Autowired
    private ClientesService clientesService;

    @PostMapping
    public ResponseEntity<ClientesModel> agregarCliente(@Valid @RequestBody ClientesModel cliente) {
        try{
            return ResponseEntity.status(201).body(clientesService.saveCliente(cliente));
        }catch (Exception e){
            return new ResponseEntity("Error al guardar el cliente", HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping
    public ResponseEntity<List<ClientesModel>> listarClientes(){
        try{
            return ResponseEntity.status(200).body(clientesService.getClientes());
        }catch (Exception e){
            return  new ResponseEntity("Error al obtener los clientes", HttpStatus.BAD_REQUEST);
        }
    }
}
