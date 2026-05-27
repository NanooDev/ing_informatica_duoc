package biblioteca.salas.duoc.biblioteca.salas.duoc.controller;

import biblioteca.salas.duoc.biblioteca.salas.duoc.model.Sala;
import biblioteca.salas.duoc.biblioteca.salas.duoc.service.SalaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/salas")
@Tag(name = "Salas", description = "Operaciones relacionadas con las salas")
public class SalaController {
    @Autowired
    private SalaService salaService;

    @GetMapping
    @Operation(summary = "Obtener todas las salas", description = "Devuelve una lista de todas las salas disponibles")
    public List<Sala> getAllSalas() {
        return salaService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener una sala por ID", description = "Devuelve una sala específica usando su ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Sala encontrada"),
        @ApiResponse(responseCode = "404", description = "Sala no encontrada")
    })
    public Sala getSalaById(@PathVariable Integer id) {
        return salaService.findById(id);
    }

    @PostMapping
    @Operation(summary = "Crear una sala", description = "Crea una nueva sala")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Sala creada")
    })
    public Sala createSala(@RequestBody Sala sala) {
        return salaService.save(sala);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar una sala", description = "Actualiza la información de una sala existente")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Sala actualizada"),
        @ApiResponse(responseCode = "404", description = "Sala no encontrada")
    })
    public Sala updateSala(@PathVariable Integer id, @RequestBody Sala sala) {
        sala.setCodigo(id);
        return salaService.save(sala);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar una sala", description = "Elimina una sala existente usando su ID")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Sala eliminada"),
        @ApiResponse(responseCode = "404", description = "Sala no encontrada")
    })
    public void deleteSala(@PathVariable Integer id) {
        salaService.deleteById(id);
    }
}
