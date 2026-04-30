# Proyecto: Gestión de Productos con Spring Boot

Un proyecto educativo diseñado para estudiantes de segundo año de Ingeniería en Computación que enseña los principios fundamentales de **Spring Framework**, decoradores básicos y de validación, buenas prácticas de APIs REST con HTTP status codes, manejo centralizado de errores e integración con base de datos relacional mediante JPA.

Este ejercicio corresponde al ramo **Fullstack I** para estudiantes de **Ingeniería en Informática de DUOC UC**.

## 📚 Objetivos de Aprendizaje

- Comprender la arquitectura de una aplicación Spring Boot
- Dominar decoradores (anotaciones) básicas y de validación
- Implementar APIs REST siguiendo buenas prácticas
- Usar códigos de estado HTTP apropiados
- Implementar manejo centralizado de excepciones con excepciones personalizadas
- Aplicar inyección de dependencias
- Integrar base de datos MySQL mediante Spring Data JPA
- Utilizar el patrón de diseño **CSR (Controller-Service-Repository)**: adaptación de MVC para Spring Boot

---

## 🔧 Requisitos Previos

- **Java 21** o superior
- **Maven 3.6+** para gestión de dependencias
- **MySQL 8+** con una base de datos llamada `productos`
- **IDE recomendado**: IntelliJ IDEA, Visual Studio Code o Eclipse
- Conocimientos básicos de Java y POO
- Conceptos básicos de APIs REST y HTTP

---

## 📦 Dependencias Principales

```xml
<!-- Spring Boot Starter Web MVC (REST Controllers y servidor web) -->
spring-boot-starter-webmvc

<!-- Spring Boot Starter Validation (Validación de datos) -->
spring-boot-starter-validation

<!-- Spring Boot Starter Data JPA (Persistencia con Hibernate) -->
spring-boot-starter-data-jpa

<!-- MySQL Connector (Driver de base de datos) -->
mysql-connector-j

<!-- Lombok (Generación automática de getters, setters, etc.) -->
lombok

<!-- Spring Boot Starter Test (Pruebas unitarias) -->
spring-boot-starter-test
```

---

## ⚙️ Configuración de Base de Datos

### Opción 1: Levantar MySQL con Docker (Recomendado)

Si no tienes MySQL instalado localmente, puedes levantarlo fácilmente con Docker:

```bash
docker run --name some-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql
```

Esto levanta un contenedor MySQL con:
- **Puerto**: 3306 (accesible desde tu máquina)
- **Usuario**: `root`
- **Contraseña**: `my-secret-pw`

Luego crea la base de datos conectándote al contenedor:

```bash
docker exec -it some-mysql mysql -uroot -pmy-secret-pw -e "CREATE DATABASE IF NOT EXISTS productos;"
```

Para detener o reiniciar el contenedor:
```bash
docker stop some-mysql   # Detener
docker start some-mysql  # Reiniciar
```

### Opción 2: MySQL instalado localmente

Crea la base de datos desde cualquier cliente MySQL:
```sql
CREATE DATABASE IF NOT EXISTS productos;
```

---

### Clientes de Base de Datos — Ver tablas y datos

Una vez levantado MySQL, puedes conectarte con cualquiera de estas herramientas para explorar la base de datos y ver las tablas que Hibernate crea automáticamente:

#### 🟠 IntelliJ IDEA (Database Tool Window)
IntelliJ incluye un cliente de base de datos integrado:
1. Ve a **View → Tool Windows → Database**
2. Haz clic en **+** → **Data Source → MySQL**
3. Completa los datos:
   - **Host**: `localhost`
   - **Port**: `3306`
   - **User**: `root`
   - **Password**: `my-secret-pw`
   - **Database**: `productos`
4. Haz clic en **Test Connection** y luego **OK**

Una vez conectado puedes expandir el esquema y ver la tabla `productos` que Hibernate crea automáticamente al levantar la aplicación.

#### 🐬 MySQL Workbench (oficial de Oracle, gratuito)
Descarga: [dev.mysql.com/downloads/workbench](https://dev.mysql.com/downloads/workbench/)

#### 🐘 DBeaver (universal, gratuito)
Soporta MySQL, PostgreSQL y muchos más.
Descarga: [dbeaver.io](https://dbeaver.io/)

#### ⚡ TablePlus (macOS/Windows, versión gratuita disponible)
Descarga: [tableplus.com](https://tableplus.com/)

---

### Configuración en `application.properties`

En `src/main/resources/application.properties`, configura tu conexión MySQL:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/productos?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=my-secret-pw
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
```

> `ddl-auto=update` hace que Hibernate cree la tabla `productos` automáticamente si no existe al iniciar la aplicación.

---

## 🏗️ Estructura del Proyecto

```
productos/
├── src/
│   ├── main/
│   │   ├── java/com/duoc/productos/
│   │   │   ├── ProductosApplication.java         # Punto de entrada
│   │   │   ├── controller/
│   │   │   │   └── ProductosController.java      # Endpoints REST
│   │   │   ├── dto/
│   │   │   │   ├── ProductoDTO.java              # Respuesta al cliente
│   │   │   │   └── ProductoRequest.java          # Datos de entrada con validaciones
│   │   │   ├── model/
│   │   │   │   └── Productos.java               # Entidad JPA (tabla en BD)
│   │   │   ├── service/
│   │   │   │   └── ProductosService.java         # Lógica de negocio
│   │   │   ├── repository/
│   │   │   │   └── ProductosRepository.java      # Acceso a datos (JPA)
│   │   │   └── exception/
│   │   │       ├── GlobalExceptionHandler.java   # Manejo centralizado de errores
│   │   │       └── ProductoNotFoundException.java # Excepción personalizada
│   │   └── resources/
│   │       └── application.properties            # Configuración
│   └── test/
│       └── ProductosApplicationTests.java        # Pruebas
└── pom.xml                                       # Configuración Maven
```

---

## 🎯 Conceptos Clave

### 1. **Decoradores (Anotaciones) Básicos de Spring**

Las anotaciones son etiquetas especiales que proporcionan metadatos sobre el programa, no afectan directamente la operación del código pero proveen información al framework.

#### `@SpringBootApplication`
**Ubicación**: [ProductosApplication.java](src/main/java/com/duoc/productos/ProductosApplication.java)

```java
@SpringBootApplication
public class ProductosApplication {
    public static void main(String[] args) {
        SpringApplication.run(ProductosApplication.class, args);
    }
}
```

**¿Qué hace?** Combina tres anotaciones en una:
- `@Configuration`: Marca la clase como fuente de definiciones de beans
- `@EnableAutoConfiguration`: Permite que Spring Boot configure automáticamente la aplicación basándose en las dependencias
- `@ComponentScan`: Escanea el paquete actual y subpaquetes buscando componentes anotados

---

#### `@RestController`
**Ubicación**: [ProductosController.java](src/main/java/com/duoc/productos/controller/ProductosController.java)

```java
@RestController
@RequestMapping("/api/v1/productos")
public class ProductosController {
    // ...
}
```

**¿Qué hace?**
- Marca la clase como controlador REST
- Equivalente a `@Controller` + `@ResponseBody`
- Los métodos retornan datos serializados (JSON) automáticamente
- `@RequestMapping("/api/v1/productos")`: Define la ruta base para todos los endpoints

---

#### `@Autowired`
**Ubicación**: [ProductosController.java](src/main/java/com/duoc/productos/controller/ProductosController.java)

```java
@Autowired
private ProductosService productosService;
```

**¿Qué hace?**
- **Inyección de Dependencias**: Spring inyecta automáticamente una instancia de `ProductosService`
- No necesitas crear la instancia manualmente con `new`
- Spring gestiona el ciclo de vida del objeto
- Promueve el desacoplamiento y facilita las pruebas

---

#### `@Service`
**Ubicación**: [ProductosService.java](src/main/java/com/duoc/productos/service/ProductosService.java)

```java
@Service
public class ProductosService {
    // ...
}
```

**¿Qué hace?**
- Marca la clase como un bean de servicio (componente del negocio)
- Contiene la lógica empresarial
- Spring la detecta automáticamente y la registra como bean

---

#### `@Repository`
**Ubicación**: [ProductosRepository.java](src/main/java/com/duoc/productos/repository/ProductosRepository.java)

```java
@Repository
public interface ProductosRepository extends JpaRepository<Productos, Integer> {
    List<Productos> findProductosByNombreContainsIgnoreCase(String nombre);
}
```

**¿Qué hace?**
- Marca la interfaz como repositorio (capa de acceso a datos)
- Al extender `JpaRepository`, hereda operaciones CRUD completas automáticamente
- Spring genera la implementación en tiempo de ejecución
- `findProductosByNombreContainsIgnoreCase`: Spring deriva la consulta SQL del nombre del método

---

#### `@Entity` y `@Table`
**Ubicación**: [Productos.java](src/main/java/com/duoc/productos/model/Productos.java)

```java
@Entity
@Table(name = "productos")
public class Productos {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    // ...
}
```

**¿Qué hacen?**
- `@Entity`: Marca la clase como entidad JPA (mapeada a una tabla en la BD)
- `@Table(name = "productos")`: Especifica el nombre de la tabla
- `@Id`: Marca el campo como llave primaria
- `@GeneratedValue`: El valor se genera automáticamente (auto-increment)

---

### 2. **Patrón DTO (Data Transfer Object)**

Este proyecto separa la entidad de base de datos del objeto que se expone al cliente, usando dos clases:

#### `ProductoRequest` — Datos de entrada
**Ubicación**: [ProductoRequest.java](src/main/java/com/duoc/productos/dto/ProductoRequest.java)

```java
@Data
public class ProductoRequest {

    @NotBlank(message = "El nombre no puede estar vacío")
    private String nombre;

    @NotNull(message = "La cantidad es obligatoria")
    @Positive(message = "La cantidad debe ser mayor a cero")
    private Integer cantidad;

    @NotNull(message = "El precio es obligatorio")
    @Positive(message = "El precio debe ser mayor a cero")
    private Integer precio;
}
```

#### `ProductoDTO` — Datos de salida
**Ubicación**: [ProductoDTO.java](src/main/java/com/duoc/productos/dto/ProductoDTO.java)

```java
@Data
public class ProductoDTO {
    private Integer id;
    private String nombre;
    private Integer cantidad;
    private Integer precio;
}
```

**¿Por qué separar?**
- El cliente no debería enviar el `id` al crear (lo genera la BD)
- Permite controlar qué campos se exponen en la respuesta
- Protege la entidad interna de cambios externos

---

### 3. **Decoradores de Validación**

Garantizan que los datos recibidos cumplan con reglas específicas **antes** de procesarlos.

#### `@NotNull`
- **Valida**: El valor no puede ser `null`
- **Tipo**: Cualquier tipo de datos

#### `@NotBlank`
- **Valida**: El string no puede ser `null` ni estar vacío
- **Trim**: Considera espacios en blanco como vacío
- **Tipo**: Solo strings

#### `@Positive`
- **Valida**: El número debe ser estrictamente mayor que 0
- **Tipo**: Números (Integer, Double, BigDecimal, etc.)

#### Decoradores de Lombok

```java
@Data                    // Genera: getters, setters, equals(), hashCode(), toString()
@NoArgsConstructor       // Genera constructor sin argumentos
@AllArgsConstructor      // Genera constructor con todos los campos
```

---

### 4. **Mapeo de Endpoints REST**

**Ubicación**: [ProductosController.java](src/main/java/com/duoc/productos/controller/ProductosController.java)

```java
@RestController
@RequestMapping("/api/v1/productos")
public class ProductosController {

    // POST - Crear producto
    @PostMapping
    public ResponseEntity<ProductoDTO> guardar(@Valid @RequestBody ProductoRequest request)

    // GET - Listar todos o filtrar por nombre
    @GetMapping
    public ResponseEntity<List<ProductoDTO>> listar(@RequestParam(required = false) String nombre)

    // GET - Buscar por ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductoDTO> buscarPorId(@PathVariable Integer id)

    // PUT - Actualizar producto
    @PutMapping("/{id}")
    public ResponseEntity<ProductoDTO> actualizar(@PathVariable Integer id, @Valid @RequestBody ProductoRequest request)

    // DELETE - Eliminar producto
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id)
}
```

| Decorator | Verbo HTTP | Operación | Descripción |
|-----------|-----------|-----------|-------------|
| `@GetMapping` | GET | Read | Obtiene datos sin modificarlos |
| `@PostMapping` | POST | Create | Crea un nuevo recurso |
| `@PutMapping` | PUT | Update | Actualiza completamente un recurso |
| `@DeleteMapping` | DELETE | Delete | Elimina un recurso |

#### Parámetros Importantes

```java
// @RequestBody: Mapea el JSON del request al objeto
// @Valid: Activa la validación de datos
@PostMapping
public ResponseEntity<ProductoDTO> guardar(@Valid @RequestBody ProductoRequest request) { }

// @PathVariable: Extrae valores de la ruta URL
@GetMapping("/{id}")
public ResponseEntity<ProductoDTO> buscarPorId(@PathVariable Integer id) { }

// @RequestParam: Extrae parámetros de la query string (?nombre=xyz)
@GetMapping
public ResponseEntity<List<ProductoDTO>> listar(@RequestParam(required = false) String nombre) { }
```

---

### 5. **HTTP Status Codes (Códigos de Estado)**

| Código | Nombre | Significado | Cuándo se usa en este proyecto |
|--------|--------|------------|-------------------------------|
| **200** | OK | Solicitud exitosa | GET por ID, PUT exitoso |
| **201** | Created | Recurso creado | POST exitoso |
| **204** | No Content | Sin contenido | GET con lista vacía, DELETE exitoso |
| **400** | Bad Request | Datos inválidos | Validaciones fallidas |
| **404** | Not Found | Recurso no encontrado | ID inexistente en GET, PUT, DELETE |

```java
// 201 - Crear producto
return new ResponseEntity<>(productosService.guardar(request), HttpStatus.CREATED);

// 200 - Buscar por ID
return new ResponseEntity<>(productosService.buscarPorId(id), HttpStatus.OK);

// 204 - Lista vacía
if (productos.isEmpty()) return new ResponseEntity<>(HttpStatus.NO_CONTENT);

// 404 - Manejado automáticamente por GlobalExceptionHandler via ProductoNotFoundException
```

---

### 6. **Excepción Personalizada y Manejo Centralizado de Errores**

En lugar de manejar errores con try/catch en cada endpoint, Spring permite centralizar la gestión.

#### `ProductoNotFoundException`
**Ubicación**: [ProductoNotFoundException.java](src/main/java/com/duoc/productos/exception/ProductoNotFoundException.java)

```java
public class ProductoNotFoundException extends RuntimeException {
    public ProductoNotFoundException(Integer id) {
        super("Producto no encontrado con id: " + id);
    }
}
```

**¿Qué hace?**
- Extiende `RuntimeException` (no necesita declararse con `throws`)
- Se lanza desde el `Service` cuando no se encuentra un producto
- El mensaje incluye el ID buscado para mayor claridad

#### `GlobalExceptionHandler`
**Ubicación**: [GlobalExceptionHandler.java](src/main/java/com/duoc/productos/exception/GlobalExceptionHandler.java)

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

    @ExceptionHandler(ProductoNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(ProductoNotFoundException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
}
```

**¿Cómo funciona el flujo?**

1. Cliente solicita `GET /api/v1/productos/999` (no existe)
2. `ProductosService` lanza `ProductoNotFoundException(999)`
3. `GlobalExceptionHandler` la intercepta automáticamente
4. Retorna JSON `{"error": "Producto no encontrado con id: 999"}` con status 404

---

## 🚀 Crear un Nuevo Proyecto con Spring Initializr

### Opción 1: Web (Recomendado para principiantes)
1. Accede a: [start.spring.io](https://start.spring.io/)
2. Configura:
   - **Project**: Maven Project
   - **Language**: Java
   - **Spring Boot**: 4.0.5 o superior
   - **Group**: com.duoc
   - **Artifact**: productos
   - **Java Version**: 21
3. Dependencias (Add Dependencies):
   - Spring Web
   - Spring Boot Validation
   - Spring Data JPA
   - MySQL Driver
   - Lombok
4. Click "Generate"
5. Descomprime y abre en tu IDE favorito

### Opción 2: Línea de Comandos
```bash
curl https://start.spring.io/starter.zip \
  -d dependencies=web,validation,data-jpa,mysql,lombok \
  -d javaVersion=21 \
  -d bootVersion=4.0.5 \
  -d groupId=com.duoc \
  -d artifactId=productos \
  -o productos.zip

unzip productos.zip
cd productos
```

---

## ✅ Paso a Paso para Ejecutar el Proyecto

### Paso 1: Clonar o Descargar el Proyecto
```bash
cd tu-directorio
git clone <repositorio>
cd productos
```

### Paso 2: Verificar Java
```bash
java -version
# Debe mostrar Java 21 o superior
```

### Paso 3: Crear la base de datos en MySQL
```sql
CREATE DATABASE productos;
```

### Paso 4: Configurar credenciales
Edita `src/main/resources/application.properties` con tu usuario y contraseña de MySQL.

### Paso 5: Compilar el Proyecto
```bash
mvn clean compile
```

### Paso 6: Ejecutar la Aplicación
```bash
mvn spring-boot:run
```

**Salida esperada**:
```
[INFO] Started ProductosApplication in 2.5 seconds
```

La aplicación estará disponible en: `http://localhost:8080`

---

## 🧪 Pruebas de Endpoints

### Herramientas Recomendadas
- **Postman**: Interfaz gráfica completa
- **cURL**: Línea de comandos (incluido en macOS/Linux)
- **Thunder Client**: Extensión de VS Code
- **Insomnia**: Similar a Postman

### Resumen de Endpoints

| Método | URL | Descripción | Status Exitoso |
|--------|-----|-------------|----------------|
| POST | `/api/v1/productos` | Crear producto | 201 |
| GET | `/api/v1/productos` | Listar todos | 200 |
| GET | `/api/v1/productos?nombre=xyz` | Filtrar por nombre | 200 / 204 |
| GET | `/api/v1/productos/{id}` | Buscar por ID | 200 / 404 |
| PUT | `/api/v1/productos/{id}` | Actualizar producto | 200 / 404 |
| DELETE | `/api/v1/productos/{id}` | Eliminar producto | 204 / 404 |

### Ejemplos con cURL

#### 1. Crear un producto válido (POST)
```bash
curl -X POST http://localhost:8080/api/v1/productos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Leche",
    "cantidad": 10,
    "precio": 1500
  }'
```

**Respuesta esperada (201)**:
```json
{
    "id": 1,
    "nombre": "Leche",
    "cantidad": 10,
    "precio": 1500
}
```

---

#### 2. Crear producto con datos inválidos (POST)
```bash
curl -X POST http://localhost:8080/api/v1/productos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "",
    "cantidad": -5,
    "precio": null
  }'
```

**Respuesta esperada (400)**:
```json
{
    "nombre": "El nombre no puede estar vacío",
    "cantidad": "La cantidad debe ser mayor a cero",
    "precio": "El precio es obligatorio"
}
```

---

#### 3. Listar todos los productos (GET)
```bash
curl -X GET http://localhost:8080/api/v1/productos
```

**Respuesta esperada (200)**:
```json
[
    {
        "id": 1,
        "nombre": "Leche",
        "cantidad": 10,
        "precio": 1500
    }
]
```

---

#### 4. Filtrar por nombre (GET con query param)
```bash
curl -X GET "http://localhost:8080/api/v1/productos?nombre=leche"
```

**Respuesta esperada (200)**:
```json
[
    {
        "id": 1,
        "nombre": "Leche",
        "cantidad": 10,
        "precio": 1500
    }
]
```

---

#### 5. Buscar por ID (GET)
```bash
curl -X GET http://localhost:8080/api/v1/productos/1
```

**Respuesta esperada (200)**:
```json
{
    "id": 1,
    "nombre": "Leche",
    "cantidad": 10,
    "precio": 1500
}
```

**Si no existe (404)**:
```json
{
    "error": "Producto no encontrado con id: 999"
}
```

---

#### 6. Actualizar un producto (PUT)
```bash
curl -X PUT http://localhost:8080/api/v1/productos/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Leche Descremada",
    "cantidad": 20,
    "precio": 1800
  }'
```

**Respuesta esperada (200)**:
```json
{
    "id": 1,
    "nombre": "Leche Descremada",
    "cantidad": 20,
    "precio": 1800
}
```

---

#### 7. Eliminar un producto (DELETE)
```bash
curl -X DELETE http://localhost:8080/api/v1/productos/1
```

**Respuesta esperada (204)**: Sin cuerpo de respuesta.

**Si no existe (404)**:
```json
{
    "error": "Producto no encontrado con id: 1"
}
```

---

## 📊 Flujo de Datos en la Aplicación

```
┌─────────────────────────────────────────────────────────────────┐
│                   CLIENTE (Postman, cURL)                        │
└────────────────────────┬────────────────────────────────────────┘
                         │ 1. Envía JSON
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ProductosController                             │
│  - Recibe request HTTP                                           │
│  - Mapea JSON → ProductoRequest (@RequestBody)                   │
│  - Valida datos (@Valid)                                         │
│  - Si hay errores → GlobalExceptionHandler (captura)             │
└────────────────────────┬────────────────────────────────────────┘
                         │ 2. Si válido, llama al servicio
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ProductosService                                │
│  - Contiene lógica de negocio                                    │
│  - Convierte ProductoRequest → Productos (entidad)               │
│  - Convierte Productos → ProductoDTO (respuesta)                 │
│  - Lanza ProductoNotFoundException si no existe el recurso       │
└────────────────────────┬────────────────────────────────────────┘
                         │ 3. Persistencia
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ProductosRepository (JPA)                       │
│  - Extiende JpaRepository (CRUD automático)                      │
│  - Conecta con MySQL                                             │
│  - Hibernate genera y ejecuta el SQL                             │
└────────────────────────┬────────────────────────────────────────┘
                         │ 4. Respuesta
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ProductosController                             │
│  - ResponseEntity con HTTP Status (200, 201, 204, 400, 404)      │
│  - Serializa ProductoDTO → JSON                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │ 5. Envía JSON
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CLIENTE (Recibe respuesta)                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Patrón de Diseño CSR (Controller-Service-Repository)

**CSR** es la versión adaptada del patrón MVC específicamente para Spring Boot y APIs REST.

| Capa | Componente | Archivo | Responsabilidad |
|------|-----------|---------|-----------------|
| **Presentación** | **Controller** | `ProductosController.java` | Mapea rutas HTTP, recibe requests, retorna responses |
| **Lógica de Negocio** | **Service** | `ProductosService.java` | Contiene la lógica de negocio, conversión DTO ↔ Entidad |
| **Datos** | **Repository** | `ProductosRepository.java` | Acceso a MySQL mediante JPA, operaciones CRUD |
| **Datos** | **Model** | `Productos.java` | Entidad JPA mapeada a la tabla `productos` |
| **Datos** | **DTO** | `ProductoDTO / ProductoRequest` | Objetos de transferencia de datos (entrada y salida) |
| **Errores** | **Exception** | `GlobalExceptionHandler.java` | Captura excepciones y retorna respuestas coherentes |

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
Cada clase tiene un único propósito claro:
- Controller: Mapeo HTTP, sin lógica de negocio
- Service: Lógica de negocio y conversión de datos
- Repository: Acceso a base de datos

### 2. **Patrón DTO**
Separa la entidad interna (`Productos`) del contrato externo (`ProductoDTO`/`ProductoRequest`), protegiendo el modelo interno.

### 3. **Excepción Personalizada**
`ProductoNotFoundException` en lugar de `NullPointerException` genérico, con mensajes descriptivos y manejo centralizado.

### 4. **Inyección de Dependencias**
```java
@Autowired
private ProductosService productosService;
```
Facilita: Testing, desacoplamiento, mantenibilidad.

### 5. **Validación de Datos a la Entrada**
```java
@PostMapping
public ResponseEntity<ProductoDTO> guardar(@Valid @RequestBody ProductoRequest request)
```
Previene procesamiento de datos inválidos antes de llegar al servicio.

### 6. **Códigos de Estado HTTP Apropiados**
- 201: Recurso creado (POST)
- 200: Operación exitosa (GET, PUT)
- 204: Sin contenido (lista vacía, DELETE)
- 400: Datos inválidos
- 404: Recurso no encontrado

### 7. **Versionamiento de API**
`/api/v1/productos` permite evolucionar la API sin romper clientes existentes.

---

## 📖 Ejercicios Propuestos

### Nivel 1: Básico
1. Agregar un campo `descripcion` a `Productos` con validación `@NotBlank`
2. Crear un endpoint GET que retorne solo productos con `cantidad > 0`
3. Agregar validación de precio máximo con `@Max`

### Nivel 2: Intermedio
1. Implementar búsqueda combinada por nombre y precio usando `@Query` en el repository
2. Agregar paginación con `Pageable` en el endpoint de listar
3. Crear una excepción personalizada `ProductoDuplicadoException` para nombres repetidos

---

## 🐛 Solución de Problemas Comunes

### Error: "Unknown database 'productos'" al levantar el proyecto
Spring Boot intenta conectarse a la base de datos al iniciar. Si la base de datos `productos` no existe, la aplicación falla con este error:
```
java.sql.SQLSyntaxErrorException: Unknown database 'productos'
```
**Solución:** Crea la base de datos antes de levantar la aplicación.

Si usas Docker:
```bash
docker exec -it some-mysql mysql -uroot -pmy-secret-pw -e "CREATE DATABASE IF NOT EXISTS productos;"
```
Si usas MySQL local:
```sql
CREATE DATABASE IF NOT EXISTS productos;
```
> ⚠️ Hibernate crea las **tablas** automáticamente, pero **NO crea la base de datos**. Debes crearla manualmente una sola vez.

---

### Error: "Communications link failure" (MySQL no está corriendo)
```bash
# Si usas Docker, verifica que el contenedor esté activo:
docker ps
docker start some-mysql

# Si usas MySQL local, verifica que el servicio esté corriendo:
mysql -u root -p
```

### Error: "Port 8080 already in use"
```properties
# Cambiar puerto en application.properties:
server.port=8081
```

### Error: "Field productosService required a bean"
Asegúrate de que `ProductosService` tiene `@Service` y Spring escanea el paquete correcto.

### Error: "JSON parse error"
El JSON enviado tiene formato inválido. Verifica comillas dobles, tipos de datos correctos y que el `Content-Type` sea `application/json`.

---

## 📝 Recursos Adicionales

- [Documentación oficial de Spring Boot](https://spring.io/projects/spring-boot)
- [Spring Data JPA Reference](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/)
- [Jakarta Bean Validation](https://jakarta.ee/specifications/bean-validation/)
- [RESTful Web Services (HTTP Status Codes)](https://developer.mozilla.org/es/docs/Web/HTTP/Status)
- [Spring Initializr](https://start.spring.io/)

---

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT, diseñado para propósitos educativos.

---

**Última actualización**: Abril 2026
