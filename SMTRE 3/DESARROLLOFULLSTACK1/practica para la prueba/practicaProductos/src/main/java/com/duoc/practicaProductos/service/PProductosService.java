package com.duoc.practicaProductos.service;

import com.duoc.practicaProductos.dto.ProductoDTO;
import com.duoc.practicaProductos.dto.ProductoRequest;
import com.duoc.practicaProductos.model.PProductos;
import com.duoc.practicaProductos.repository.PProductosRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PProductosService {
    @Autowired
    private PProductosRepository pproductosRepository;

    public ProductoDTO guardar(ProductoRequest productoRequest) {
        PProductos producto = new PProductos();
        producto.setNombre(productoRequest.getNombre());
        producto.setCantidad(productoRequest.getCantidad());
        producto.setPrecio(productoRequest.getPrecio());

        PProductos guardado = pproductosRepository.save(producto);
        return convertirADTO(guardado);
    }
    /*
    public List<PProductos> listar() {
        return pproductosRepository.listar();
    }

    public PProductos buscarPorId(Integer id) {
        return pproductosRepository.buscarPorId(id);
    }

    public PProductos actualizar(Integer id, PProductos productos) {
        return  pproductosRepository.actualizar(id, productos);
    }

    public void eliminar(Integer id) {
        pproductosRepository.eliminar(id);
    }
    */
    private ProductoDTO convertirADTO(PProductos producto) {
        ProductoDTO dto = new ProductoDTO();
        dto.setId(producto.getId());
        dto.setNombre(producto.getNombre());
        dto.setCantidad(producto.getCantidad());
        dto.setPrecio(producto.getPrecio());
        return dto;
    }
}
