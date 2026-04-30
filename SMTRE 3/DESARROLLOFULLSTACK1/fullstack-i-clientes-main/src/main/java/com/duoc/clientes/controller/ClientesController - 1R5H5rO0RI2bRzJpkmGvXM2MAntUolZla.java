package com.duoc.clientes.controller;

import com.duoc.clientes.model.ClientesModel;
import com.duoc.clientes.service.ClientesService;
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
        } catch (Exception e) {
            return new ResponseEntity("Error al guardar al cliente", HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping
    public ResponseEntity<List<ClientesModel>> listarClientes() {
        try{
            return ResponseEntity.status(200).body(clientesService.getClientes());
        } catch (Exception e) {
            return new ResponseEntity("Error al obtener la lista de clientes", HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("{id}")
    public ResponseEntity<ClientesModel> listarClientesPorId(@PathVariable Integer id) {
        try{
            return ResponseEntity.status(200).body(clientesService.obtenerClientePorId(id));
        } catch (Exception e) {
            return new ResponseEntity("Error al obtener el cliente", HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("{id}")
    public ResponseEntity<ClientesModel> actualizarClientePorId(@PathVariable Integer id, @Valid @RequestBody ClientesModel cliente) {
        try{
            return ResponseEntity.status(200).body(clientesService.actualizarCliente(id, cliente));
        } catch (Exception e) {
            return new  ResponseEntity("Error al actualizar el cliente", HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("{id}")
    public ResponseEntity<String> eliminarCliente(@PathVariable Integer id) {
        try{
            return ResponseEntity.status(200).body(clientesService.deleteCliente(id));
        } catch (Exception e) {
            return new ResponseEntity("Error al borrar el cliente", HttpStatus.BAD_REQUEST);
        }
    }
}
