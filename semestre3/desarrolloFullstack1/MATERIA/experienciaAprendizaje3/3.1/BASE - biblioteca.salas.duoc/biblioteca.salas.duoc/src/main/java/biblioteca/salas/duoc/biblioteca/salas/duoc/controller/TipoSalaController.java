package biblioteca.salas.duoc.biblioteca.salas.duoc.controller;

import biblioteca.salas.duoc.biblioteca.salas.duoc.model.TipoSala;
import biblioteca.salas.duoc.biblioteca.salas.duoc.service.TipoSalaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tipo-salas")
@Tag(name = "Tipo de Salas", description = "Operaciones relacionadas con los tipos de salas")
public class TipoSalaController {
    @Autowired
    private TipoSalaService tipoSalaService;

    @GetMapping
    @Operation(summary = "Obtener todos los tipos de salas", description = "Devuelve una lista de todos los tipos de salas disponibles")
    public List<TipoSala> getAllTipoSalas() {
        return tipoSalaService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un tipo de sala por ID", description = "Devuelve un tipo de sala específico usando su ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Tipo de sala encontrado"),
        @ApiResponse(responseCode = "404", description = "Tipo de sala no encontrado")
    })
    public TipoSala getTipoSalaById(@PathVariable Integer id) {
        return tipoSalaService.findById(id);
    }

    @PostMapping
    @Operation(summary = "Crear un tipo de sala", description = "Crea un nuevo tipo de sala")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Tipo de sala creado")
    })
    public TipoSala createTipoSala(@RequestBody TipoSala tipoSala) {
        return tipoSalaService.save(tipoSala);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un tipo de sala", description = "Actualiza la información de un tipo de sala existente")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Tipo de sala actualizado"),
        @ApiResponse(responseCode = "404", description = "Tipo de sala no encontrado")
    })
    public TipoSala updateTipoSala(@PathVariable Integer id, @RequestBody TipoSala tipoSala) {
        tipoSala.setIdTipo(id);
        return tipoSalaService.save(tipoSala);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un tipo de sala", description = "Elimina un tipo de sala existente usando su ID")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Tipo de sala eliminado"),
        @ApiResponse(responseCode = "404", description = "Tipo de sala no encontrado")
    })
    public void deleteTipoSala(@PathVariable Integer id) {
        tipoSalaService.deleteById(id);
    }
}
