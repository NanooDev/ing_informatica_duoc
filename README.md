# Ingeniería en Informática — Duoc UC

Repositorio central de proyectos, laboratorios y ejercicios realizados durante la carrera de Ingeniería en Informática en Duoc UC. El núcleo del repositorio es un backend estructurado en **microservicios** construido con **Java** y **Spring Boot**, diseñado para demostrar arquitecturas modernas orientadas a servicios.

---

## Descripción

Este proyecto implementa una arquitectura de microservicios en la que cada servicio es independiente, desplegable de forma autónoma y se comunica con los demás a través de APIs REST. El objetivo académico es aplicar los conceptos de diseño de software, patrones de integración y buenas prácticas de desarrollo backend aprendidos a lo largo de la carrera.

---

## Tecnologías utilizadas

- **Java 17** — lenguaje principal de desarrollo
- **Spring Boot 3** — framework para la creación de microservicios
- **Spring Web** — exposición de endpoints REST
- **Spring Data JPA** — capa de persistencia con soporte ORM
- **Spring Cloud** — coordinación entre microservicios (Gateway, Config Server, Eureka)
- **Maven** — gestor de dependencias y construcción del proyecto
- **Docker / Docker Compose** — contenerización y orquestación local
- **PostgreSQL** — base de datos relacional por servicio
- **Git** — control de versiones

---

## Requisitos previos

Antes de ejecutar el proyecto asegúrate de tener instalados los siguientes componentes:

- **Java Development Kit (JDK) 17** o superior
  - Verificar con: `java -version`
- **Apache Maven 3.9** o superior
  - Verificar con: `mvn -version`
- **Docker Desktop** (incluye Docker Compose)
  - Verificar con: `docker --version` y `docker compose version`
- **Git 2.x** o superior
  - Verificar con: `git --version`
- Un cliente REST como **Postman** o **cURL** para probar los endpoints (opcional)

---

## Clonar y ejecutar el proyecto localmente

### 1. Clonar el repositorio

```bash
git clone https://github.com/NanooDev/ing_informatica_duoc.git
cd ing_informatica_duoc
```

### 2. Levantar la infraestructura con Docker Compose

El archivo `docker-compose.yml` en la raíz del proyecto define las bases de datos y servicios de soporte necesarios.

```bash
docker compose up -d
```

### 3. Compilar todos los servicios con Maven

Desde la raíz del repositorio ejecuta el siguiente comando para compilar cada módulo:

```bash
mvn clean install -DskipTests
```

### 4. Ejecutar cada microservicio individualmente

Navega al directorio del microservicio que deseas iniciar y ejecútalo con el plugin de Spring Boot:

```bash
cd <nombre-del-microservicio>
mvn spring-boot:run
```

También puedes ejecutar el JAR generado directamente:

```bash
java -jar target/<nombre-del-microservicio>-0.0.1-SNAPSHOT.jar
```

### 5. Verificar que los servicios estén activos

- **Eureka Dashboard** (registro de servicios): `http://localhost:8761`
- **API Gateway**: `http://localhost:8080`
- Cada microservicio expone su propio puerto definido en su archivo `application.properties`

---

## Estructura de carpetas principales

```
ing_informatica_duoc/
├── api-gateway/                  # Enrutador central de peticiones
│   └── src/
│       └── main/
│           ├── java/             # Configuración del gateway
│           └── resources/
│               └── application.yml
├── eureka-server/                # Servicio de descubrimiento
│   └── src/
│       └── main/
│           ├── java/
│           └── resources/
│               └── application.yml
├── config-server/                # Servidor de configuración centralizada
│   └── src/
├── microservicio-usuarios/       # Gestión de usuarios y autenticación
│   └── src/
│       └── main/
│           ├── java/
│           │   └── com/duoc/usuarios/
│           │       ├── controller/
│           │       ├── service/
│           │       ├── repository/
│           │       └── model/
│           └── resources/
│               └── application.properties
├── microservicio-productos/      # Gestión de productos o recursos académicos
│   └── src/
├── microservicio-pedidos/        # Gestión de transacciones o solicitudes
│   └── src/
├── docker-compose.yml            # Orquestación de contenedores local
├── pom.xml                       # POM raíz del proyecto multi-módulo
├── .gitignore
├── LICENSE
└── README.md
```

---

## Licencia

Este proyecto se distribuye bajo la licencia **MIT**. Consulta el archivo [`LICENSE`](LICENSE) para más detalles.
