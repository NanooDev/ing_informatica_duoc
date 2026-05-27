package com.duoc.clientes.service;

import com.duoc.clientes.model.ClientesModel;
import com.duoc.clientes.repository.ClientesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClientesService {
    @Autowired
    private ClientesRepository clientesRepository;

    public ClientesModel saveCliente(ClientesModel cliente) {
        return clientesRepository.guardar(cliente);
    }

    public List<ClientesModel> getClientes() {
        return clientesRepository.obtenerClientes();
    }

    public ClientesModel obtenerClientePorId(Integer id) {
        return clientesRepository.obtenerCliente(id);
    }

    public ClientesModel actualizarCliente(Integer id, ClientesModel cliente) {
        return clientesRepository.actualizar(id, cliente);
    }

    public String deleteCliente(Integer id) {
        clientesRepository.eliminar(id);
        return "Cliente eliminado";
    }
}
