package biblioteca.salas.duoc.biblioteca.salas.duoc.controller;
import biblioteca.salas.duoc.biblioteca.salas.duoc.model.Estudiante;
import biblioteca.salas.duoc.biblioteca.salas.duoc.service.EstudianteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/estudiantes")
@Tag(name = "Estudiantes", description = "Operaciones relacionadas con los estudiantes")
public class EstudianteController {
    @Autowired
    private EstudianteService estudianteService;

    @GetMapping
    @Operation(summary = "Obtener todos los estudiantes", description = "Devuelve una lista de todos los estudiantes disponibles")
    public List<Estudiante> getAllEstudiantes() {
        return estudianteService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un estudiante por ID", description = "Devuelve un estudiante específico usando su ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Estudiante encontrado"),
        @ApiResponse(responseCode = "404", description = "Estudiante no encontrado")
    })
    public Estudiante getEstudianteById(@PathVariable Integer id) {
        return estudianteService.findById(id);
    }

    @PostMapping
    @Operation(summary = "Crear un estudiante", description = "Crea un nuevo estudiante")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Estudiante creado")
    })
    public Estudiante createEstudiante(@RequestBody Estudiante estudiante) {
        return estudianteService.save(estudiante);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un estudiante", description = "Actualiza la información de un estudiante existente")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Estudiante actualizado"),
        @ApiResponse(responseCode = "404", description = "Estudiante no encontrado")
    })
    public Estudiante updateEstudiante(@PathVariable Integer id, @RequestBody Estudiante estudiante) {
        estudiante.setId(id);
        return estudianteService.save(estudiante);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un estudiante", description = "Elimina un estudiante existente usando su ID")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Estudiante eliminado"),
        @ApiResponse(responseCode = "404", description = "Estudiante no encontrado")
    })
    public void deleteEstudiante(@PathVariable Integer id) {
        estudianteService.deleteById(id);
    }
}
