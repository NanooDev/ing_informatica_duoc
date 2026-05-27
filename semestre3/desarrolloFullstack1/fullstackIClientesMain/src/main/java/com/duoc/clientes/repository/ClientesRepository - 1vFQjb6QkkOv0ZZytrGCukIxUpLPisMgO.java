package com.duoc.clientes.repository;

import com.duoc.clientes.model.ClientesModel;
import org.springframework.stereotype.Repository;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Repository
public class ClientesRepository {
    private List<ClientesModel> listaClientes = new ArrayList<>();

    public ClientesModel guardar(ClientesModel cliente) {
        listaClientes.add(cliente);
        return cliente;
    }

    public List<ClientesModel> obtenerClientes() {
        return listaClientes;
    }

    public ClientesModel obtenerCliente(Integer id) {
        return listaClientes.stream().filter(cliente -> cliente.getId().equals(id)).findFirst().orElse(null);
    }

    public ClientesModel actualizar(Integer id, ClientesModel cliente) {
        int posicion = 0;
        for (int i = 0; i<listaClientes.size(); i++) {
            if (Objects.equals(listaClientes.get(i).getId(), id)) {
                posicion = i;
                break;
            }
        }

        ClientesModel clienteActualizado = new ClientesModel();
        clienteActualizado.setId(id);
        clienteActualizado.setNombre(cliente.getNombre());
        clienteActualizado.setEdad(cliente.getEdad());
        clienteActualizado.setCorreo(cliente.getCorreo());

        listaClientes.set(posicion, clienteActualizado);
        return clienteActualizado;
    }

    public void eliminar(Integer id) {
        listaClientes.removeIf(cliente -> Objects.equals(cliente.getId(), id));
    }
}
