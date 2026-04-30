# Proyecto: Gestión de Clientes con Spring Boot

Un proyecto educativo diseñado para estudiantes de segundo año de Ingeniería en Computación que enseña los principios fundamentales de **Spring Framework**, decoradores básicos y de validación, buenas prácticas de APIs REST con HTTP status codes, y manejo centralizado de errores.

Este ejercicio corresponde al ramo **Fullstack I** para estudiantes de **Ingeniería en Informática de DUOC UC**.

## 📚 Objetivos de Aprendizaje

- Comprender la arquitectura de una aplicación Spring Boot
- Dominar decoradores (anotaciones) básicas y de validación
- Implementar APIs REST siguiendo buenas prácticas
- Usar códigos de estado HTTP apropiados
- Implementar manejo centralizado de excepciones
- Aplicar inyección de dependencias
- Utilizar el patrón de diseño **CSR (Controller-Service-Repository)**: adaptación de MVC para Spring Boot

---

## 🔧 Requisitos Previos

- **Java 21** o superior
- **Maven 3.6+** para gestión de dependencias
- **IDE recomendado**: IntelliJ IDEA, Visual Studio Code o Eclipse
- Conocimientos básicos de Java y POO
- Conceptos básicos de APIs REST y HTTP

---

## 📦 Dependencias Principales

```xml
<!-- Spring Boot Starter Web (REST Controllers y servidores web) -->
spring-boot-starter-web

<!-- Spring Boot Starter Validation (Validación de datos) -->
spring-boot-starter-validation

<!-- Lombok (Generación automática de getters, setters, etc.) -->
lombok

<!-- Spring Boot Starter Test (Pruebas unitarias) -->
spring-boot-starter-test
```

---

## 🏗️ Estructura del Proyecto

```
clientes/
├── src/
│   ├── main/
│   │   ├── java/com/duoc/clientes/
│   │   │   ├── ClientesApplication.java      # Punto de entrada
│   │   │   ├── controller/
│   │   │   │   └── ClientesController.java   # Endpoints REST
│   │   │   ├── model/
│   │   │   │   └── ClientesModel.java        # Entidad con validaciones
│   │   │   ├── service/
│   │   │   │   └── ClientesService.java      # Lógica de negocio
│   │   │   ├── repository/
│   │   │   │   └── ClientesRepository.java   # Acceso a datos
│   │   │   └── exception/
│   │   │       └── GlobalExceptionHandler.java # Manejo de errores
│   │   └── resources/
│   │       └── application.properties         # Configuración
│   └── test/
│       └── ClientesApplicationTests.java      # Pruebas
└── pom.xml                                    # Configuración Maven
```

---

## 🎯 Conceptos Clave

### 1. **Decoradores (Anotaciones) Básicos de Spring**

Las anotaciones son etiquetas especiales que proporcionan metadatos sobre el programa, no affecting directly the operation of the code but providing information to the framework.

#### `@SpringBootApplication`
**Ubicación**: [ClientesApplication.java](src/main/java/com/duoc/clientes/ClientesApplication.java)

```java
@SpringBootApplication
public class ClientesApplication {
    public static void main(String[] args) {
        SpringApplication.run(ClientesApplication.class, args);
    }
}
```

**¿Qué hace?** Combina tres anotaciones en una:
- `@Configuration`: Marca la clase como fuente de definiciones de beans
- `@EnableAutoConfiguration`: Permite que Spring Boot configure automáticamente la aplicación basándose en las dependencias
- `@ComponentScan`: Escanea el paquete actual y subpaquetes buscando componentes anotados

---

#### `@RestController`
**Ubicación**: [ClientesController.java](src/main/java/com/duoc/clientes/controller/ClientesController.java)

```java
@RestController
@RequestMapping("/api/v1/clientes")
public class ClientesController {
    // ...
}
```

**¿Qué hace?**
- Marca la clase como controlador REST
- Equivalente a `@Controller` + `@ResponseBody`
- Los métodos retornan datos serializados (JSON) automáticamente
- `@RequestMapping("/api/v1/clientes")`: Define la ruta base para todos los endpoints

---

#### `@Autowired`
**Ubicación**: [ClientesController.java](src/main/java/com/duoc/clientes/controller/ClientesController.java#L13)

```java
@Autowired
private ClientesService clientesService;
```

**¿Qué hace?**
- **Inyección de Dependencias**: Spring inyecta automáticamente una instancia de `ClientesService`
- No necesitas crear la instancia manualmente con `new`
- Spring gestiona el ciclo de vida del objeto
- Promueve el desacoplamiento y facilita las pruebas

---

#### `@Service`
**Ubicación**: [ClientesService.java](src/main/java/com/duoc/clientes/service/ClientesService.java)

```java
@Service
public class ClientesService {
    // ...
}
```

**¿Qué hace?**
- Marca la clase como un bean de servicio (componente del negocio)
- Contiene la lógica empresarial
- Spring la detecta automáticamente y la registra como bean
- Se puede inyectar en otros componentes

---

#### `@Repository`
**Ubicación**: [ClientesRepository.java](src/main/java/com/duoc/clientes/repository/ClientesRepository.java)

```java
@Repository
public class ClientesRepository {
    // ...
}
```

**¿Qué hace?**
- Marca la clase como un repositorio (capa de acceso a datos)
- Responsable de CRUD (Create, Read, Update, Delete)
- En este proyecto, usa un ArrayList en memoria (simulación)
- En proyectos reales, se conectaría a una base de datos

---

### 2. **Decoradores de Validación (Validación de Datos)**

Garantizan que los datos recibidos cumplan con reglas específicas **antes** de procesarlos.

**Ubicación**: [ClientesModel.java](src/main/java/com/duoc/clientes/model/ClientesModel.java)

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClientesModel {
    
    @NotNull(message = "El nombre no puede ser null")
    @NotBlank(message = "El nombre no puede estar vacio")
    private String nombre;

    @NotNull(message = "El correo no puede ser null")
    @NotBlank(message = "El correo no puede estar vacio")
    private String correo;

    @NotNull(message = "La edad no puede ser null")
    @Positive(message = "La edad debe ser mayor a cero")
    private Integer edad;
}
```

#### `@NotNull`
- **Valida**: El valor no puede ser `null`
- **Tipo**: Cualquier tipo de datos
- **Diferencia con @NotBlank**: Permite strings vacíos `""`

#### `@NotBlank`
- **Valida**: El string no puede ser `null` ni estar vacío
- **Trim**: Considera espacios en blanco como vacío
- **Tipo**: Solo strings

#### `@Positive`
- **Valida**: El número debe ser mayor que 0
- **Tipo**: Números (Integer, Double, BigDecimal, etc.)

#### Decoradores de Lombok

```java
@Data                    // Genera: getters, setters, equals(), hashCode(), toString()
@NoArgsConstructor       // Genera constructor sin argumentos
@AllArgsConstructor      // Genera constructor con todos los campos
```

---

### 3. **Mapeo de Endpoints REST**

#### Verbos HTTP y Decoradores Correspondientes

```java
@RestController
@RequestMapping("/api/v1/clientes")
public class ClientesController {
    
    // GET - Obtener todos los clientes
    @GetMapping
    public ResponseEntity<List<ClientesModel>> listarClientes() { }
    
    // POST - Crear nuevo cliente
    @PostMapping
    public ResponseEntity<ClientesModel> agregarCliente(
        @Valid @RequestBody ClientesModel cliente
    ) { }
    
    // DELETE - Eliminar cliente por correo
    @DeleteMapping("{correo}")
    public ResponseEntity<String> eliminarCliente(
        @PathVariable String correo
    ) { }
}
```

| Decorator | Verbo HTTP | Operación | Descripción |
|-----------|-----------|-----------|-------------|
| `@GetMapping` | GET | Read | Obtiene datos sin modificarlos |
| `@PostMapping` | POST | Create | Crea un nuevo recurso |
| `@PutMapping` | PUT | Update | Actualiza completamente un recurso |
| `@PatchMapping` | PATCH | Partial Update | Actualiza parcialmente un recurso |
| `@DeleteMapping` | DELETE | Delete | Elimina un recurso |

#### Parámetros Importantes

```java
// @RequestBody: Mapea el JSON del request al objeto
@PostMapping
public ResponseEntity<ClientesModel> agregarCliente(
    @RequestBody ClientesModel cliente
) { }

// @Valid: Activa la validación de datos
@PostMapping
public ResponseEntity<ClientesModel> agregarCliente(
    @Valid @RequestBody ClientesModel cliente
) { }

// @PathVariable: Extrae valores de la ruta
@DeleteMapping("{correo}")
public ResponseEntity<String> eliminarCliente(
    @PathVariable String correo
) { }
```

---

### 4. **HTTP Status Codes (Códigos de Estado)**

Los códigos HTTP comunican al cliente el resultado de su request.

#### Códigos Utilizados en Este Proyecto

| Código | Nombre | Significado | Cuándo Usar |
|--------|--------|------------|-----------|
| **200** | OK | La solicitud fue exitosa | GET exitoso, DELETE exitoso |
| **201** | Created | Recurso creado exitosamente | POST que crea un recurso |
| **400** | Bad Request | Solicitud inválida o error en validación | Datos inválidos, errores de negocio |
| **404** | Not Found | Recurso no encontrado | GET de recurso inexistente |
| **500** | Internal Server Error | Error del servidor | Excepciones no controladas |

#### Ejemplo de Uso en el Proyecto

```java
// GET exitoso (200)
@GetMapping
public ResponseEntity<List<ClientesModel>> listarClientes() {
    return ResponseEntity.status(200).body(clientesService.getClientes());
}

// POST exitoso (201)
@PostMapping
public ResponseEntity<ClientesModel> agregarCliente(@Valid @RequestBody ClientesModel cliente) {
    return ResponseEntity.status(201).body(clientesService.saveCliente(cliente));
}

// Error en validación (400)
// Manejado automáticamente por GlobalExceptionHandler
```

---

### 5. **Manejo Centralizado de Excepciones**

En lugar de manejar errores en cada endpoint, Spring permite centralizar la gestión en una clase especial.

**Ubicación**: [GlobalExceptionHandler.java](src/main/java/com/duoc/clientes/exception/GlobalExceptionHandler.java)

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationErrors(
        MethodArgumentNotValidException ex
    ) {
        Map<String, String> errores = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
            errores.put(error.getField(), error.getDefaultMessage())
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errores);
    }
}
```

**¿Cómo funciona?**

1. `@RestControllerAdvice`: Marca la clase como handler global de excepciones
2. `@ExceptionHandler`: Define qué tipo de excepción maneja este método
3. Cuando alguien envía un cliente sin nombre, Spring:
   - Lanza `MethodArgumentNotValidException`
   - `GlobalExceptionHandler` lo captura
   - Retorna un JSON con los errores específicos

**Respuesta de Error (ejemplo)**:
```json
{
    "nombre": "El nombre no puede estar vacio",
    "edad": "La edad debe ser mayor a cero"
}
```

---

## 🚀 Crear un Nuevo Proyecto con Spring Initializr

Si deseas crear un proyecto similar desde cero, puedes usar **Spring Initializr**:

### Opción 1: Web (Recomendado para principiantes)
1. Accede a: [start.spring.io](https://start.spring.io/)
2. Configura:
   - **Project**: Maven Project
   - **Language**: Java
   - **Spring Boot**: 4.0.4 o superior
   - **Group**: com.duoc
   - **Artifact**: clientes
   - **Java Version**: 21
3. Dependencias (Add Dependencies):
   - Spring Web
   - Spring Boot Validation
   - Lombok
4. Click "Generate"
5. Descomprime y abre en tu IDE favorito

### Opción 2: Línea de Comandos
```bash
curl https://start.spring.io/starter.zip \
  -d dependencies=web,validation,lombok \
  -d javaVersion=21 \
  -d bootVersion=4.0.4 \
  -d groupId=com.duoc \
  -d artifactId=clientes \
  -o clientes.zip

unzip clientes.zip
cd clientes
```

---

## ✅ Paso a Paso para Ejecutar el Proyecto

### Paso 1: Clonar o Descargar el Proyecto
```bash
cd tu-directorio
# Si es un repositorio git:
git clone <repositorio>
cd clientes
```

### Paso 2: Verificar Java
```bash
java -version
# Debe mostrar Java 21 o superior
```

### Paso 3: Compilar el Proyecto
```bash
mvn clean compile
```

- `clean`: Elimina compilaciones anteriores
- `compile`: Compila el código fuente

### Paso 4: Ejecutar la Aplicación
```bash
mvn spring-boot:run
```

**Salida esperada**:
```
[INFO] Started ClientesApplication in 2.5 seconds
```

La aplicación estará disponible en: `http://localhost:8080`

---

## 🧪 Pruebas de Endpoints

### Herramientas Recomendadas
- **Postman**: Interfaz gráfica completa
- **cURL**: Línea de comandos (incluido en macOS/Linux)
- **Thunder Client**: Extensión de VS Code
- **Insomnia**: Similar a Postman

### Ejemplos con cURL

#### 1. Listar todos los clientes (GET)
```bash
curl -X GET http://localhost:8080/api/v1/clientes
```

**Respuesta esperada (200)**:
```json
[]
```

---

#### 2. Crear un cliente válido (POST)
```bash
curl -X POST http://localhost:8080/api/v1/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "correo": "juan@example.com",
    "edad": 25
  }'
```

**Respuesta esperada (201)**:
```json
{
    "nombre": "Juan Pérez",
    "correo": "juan@example.com",
    "edad": 25
}
```

---

#### 3. Intentar crear cliente con datos inválidos (POST)
```bash
curl -X POST http://localhost:8080/api/v1/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "",
    "correo": "juan@example.com",
    "edad": -5
  }'
```

**Respuesta esperada (400)**:
```json
{
    "nombre": "El nombre no puede estar vacio",
    "edad": "La edad debe ser mayor a cero"
}
```

---

#### 4. Listar clientes después de crear uno (GET)
```bash
curl -X GET http://localhost:8080/api/v1/clientes
```

**Respuesta esperada (200)**:
```json
[
    {
        "nombre": "Juan Pérez",
        "correo": "juan@example.com",
        "edad": 25
    }
]
```

---

#### 5. Eliminar un cliente (DELETE)
```bash
curl -X DELETE http://localhost:8080/api/v1/clientes/juan@example.com
```

**Respuesta esperada (200)**:
```json
"Cliente eliminado"
```

---

## 📊 Flujo de Datos en la Aplicación

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Postman, cURL)                   │
└────────────────────────┬──────────────────────────────────────────┘
                         │ 1. Envía JSON
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ClientesController                              │
│  - Recibe request HTTP                                           │
│  - Mapea JSON → ClientesModel (@RequestBody)                     │
│  - Valida datos (@Valid)                                         │
│  - Si hay errores → GlobalExceptionHandler (captura)             │
└────────────────────────┬──────────────────────────────────────────┘
                         │ 2. Si válido, llama servicio
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ClientesService                                 │
│  - Contiene lógica de negocio                                    │
│  - Procesa los datos                                             │
│  - Llama al repositorio                                          │
└────────────────────────┬──────────────────────────────────────────┘
                         │ 3. Persistencia
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ClientesRepository                              │
│  - ArrayList (simula base de datos en memoria)                   │
│  - CRUD: Crear, Leer, Actualizar, Eliminar                      │
│  - Retorna datos procesados                                      │
└────────────────────────┬──────────────────────────────────────────┘
                         │ 4. Respuesta
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ClientesController                              │
│  - ResponseEntity with HTTP Status (200, 201, 400)               │
│  - Serializa objeto → JSON                                       │
└────────────────────────┬──────────────────────────────────────────┘
                         │ 5. Envía JSON
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENTE (Recibe respuesta)                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Patrón de Diseño CSR (Controller-Service-Repository)

**CSR** es la versión adaptada del patrón MVC específicamente para Spring Boot y APIs REST.

| Capa | Componente | Archivo | Responsabilidad |
|------|-----------|---------|-----------------|
| **Presentación** | **Controller** | `ClientesController.java` | Mapea rutas HTTP, recibe requests, retorna responses |
| **Lógica de Negocio** | **Service** | `ClientesService.java` | Contiene la lógica de negocio, orquesta operaciones |
| **Datos** | **Repository** | `ClientesRepository.java` | Acceso a datos, persistencia, operaciones CRUD |
| **Datos** | **Model** | `ClientesModel.java` | Representa la entidad con atributos y validaciones |

### ¿Por qué CSR en lugar de MVC?

En aplicaciones REST con Spring Boot:
- **No hay "View" tradicional** (HTML) → La respuesta es **JSON**
- La **separación de responsabilidades** es más clara
- **Service** maneja la lógica de negocio (no el Controller)
- **Repository** aísla el acceso a datos
- Facilita **testing y mantenimiento**

### Ventajas del Patrón CSR

✅ Código más limpio y organizado  
✅ Fácil de testear (inyección de dependencias)  
✅ Escalable (añadir funcionalidades sin afectar otras capas)  
✅ Reutilizable (Service puede usarse desde múltiples Controllers)  
✅ Mantenible (cambios aislados por capa)

---

## 💡 Buenas Prácticas Implementadas

### 1. **Separación de Responsabilidades**
Cada clase tiene una único propósito claro:
- Controller: Mapeo HTTP
- Service: Lógica de negocio
- Repository: Acceso a datos

### 2. **Inyección de Dependencias**
```java
@Autowired
private ClientesService clientesService;
```
Facilita: Testing, desacoplamiento, mantenibilidad

### 3. **Validación de Datos a la Entrada**
```java
@PostMapping
public ResponseEntity<ClientesModel> agregarCliente(@Valid @RequestBody ClientesModel cliente)
```
Previene procesamiento de datos inválidos

### 4. **Códigos de Estado HTTP Apropiados**
- 200: Operación exitosa
- 201: Recurso creado
- 400: Solicitud inválida
- 500: Error del servidor

### 5. **Manejo Centralizado de Excepciones**
En lugar de try-catch en cada método, usar `@RestControllerAdvice`

### 6. **Versionamiento de API**
`/api/v1/clientes` permite evitar conflictos al cambiar la API

---

## 📖 Ejercicios Propuestos

### Nivel 1: Básico
1. Agregar un nuevo campo `telefono` a `ClientesModel` con validación
2. Crear un endpoint PUT para actualizar cliente
3. Agregar validación de email usando `@Email`

### Nivel 2: Intermedio
1. Agregar manejo de excepción personalizada (ej: ClienteNoEncontradoException)
2. Implementar búsqueda de cliente por correo (GET con parámetro)
3. Agregar información de error más detallada en respuestas

---

## 📝 Recursos Adicionales

- [Documentación oficial de Spring Boot](https://spring.io/projects/spring-boot)
- [Spring Framework Reference](https://docs.spring.io/spring-framework/docs/current/reference/html/)
- [Jakarta Bean Validation](https://jakarta.ee/specifications/bean-validation/)
- [RESTful Web Services (HTTP Status Codes)](https://developer.mozilla.org/es/docs/Web/HTTP/Status)

---

## 🐛 Solución de Problemas Comunes

### Error: "Port 8080 already in use"
```bash
# Cambiar puerto en application.properties:
server.port=8081
```

### Error: "Field clientesService required a bean of type"
Este error significa que la inyección de dependencias no encontró el bean. Asegurate:
- La clase `ClientesService` tiene `@Service`
- El controlador tiene `@Autowired`
- Spring escanea el paquete correcto

### Error: "JSON parse error"
El JSON enviado tiene formato inválido. Verifica:
- Comillas dobles en propiedades
- Tipos de datos correctos
- No hay caracteres de escape faltantes

---

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT, diseñado para propósitos educativos.

---

**Última actualización**: 28 de marzo de 2026