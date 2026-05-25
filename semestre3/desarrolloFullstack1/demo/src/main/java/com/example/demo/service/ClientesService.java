package com.example.demo.service;

import com.example.demo.model.ClientesModel;
import com.example.demo.repository.ClientesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClientesService {
    @Autowired
    private ClientesRepository clientesRepository;

    public ClientesModel saveCliente(ClientesModel cliente){ return clientesRepository.guardar(cliente);}
}
