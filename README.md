# 🎓 Mi Camino en Ingeniería en Informática

Repositorio central que documenta mi trayecto académico en la carrera de **Ingeniería en Informática** en Duoc UC. Aquí encontrarás proyectos, laboratorios, ejercicios y casos de estudio desarrollados a lo largo de la carrera, organizados por semestre y línea temática.

---

## 📚 Tabla de Materias

| Semestre | Asignatura | Descripción |
|----------|-----------|------------|
| **Semestre 3** | **Ingeniería de Software I** | Análisis, diseño y modelado de sistemas. Desarrollo de casos de estudio completos (Biblioteca, Piscina). Mockups interactivos y documentación de requisitos. |
| **Semestre 3** | **Base de Datos** | Diseño y normalización de bases de datos relacionales. Creación de modelos entidad-relación (MER), poblado de datos y consultas SQL complejas. Casos: Truck Rental, IP Futuro, All The Best, Kopera. |
| **Semestre 3** | **Desarrollo Full Stack I** | Arquitectura de microservicios, desarrollo backend con Spring Boot y frontend con tecnologías web. Proyectos: Sistema de Colegio, Gestión de Clientes y Productos. |

---

## 🚀 Proyectos Destacados

### **Sistema de Gestión de Biblioteca**
- **Ubicación:** `SMTRE 3/INGENIERIA SOFTWARE/CASO BIBLIOTECA/`
- **Descripción:** Sistema completo de gestión bibliográfica con múltiples roles de usuario (Estudiante, Profesor, Personal).
- **Características:**
  - Catálogo en línea con búsqueda y filtrado
  - Gestión de préstamos, devoluciones y reservas
  - Simulación de escaneo de ISBN
  - Control de acceso basado en roles (RBAC)
  - Mockup interactivo con HTML5, CSS3 y JavaScript
  - Modelo de base de datos relacional
- **Tecnologías:** HTML5, CSS3, JavaScript, Oracle Data Modeler

### **Sistema de Gestión de Piscina**
- **Ubicación:** `SMTRE 3/INGENIERIA SOFTWARE/CASO SEMESTRAL/`
- **Descripción:** Caso de estudio semestral de un sistema integral de gestión de piscina.
- **Características:**
  - Diseño de modelo entidad-relación (MER)
  - Análisis y especificación de requisitos
  - Primera y segunda presentación con iteraciones de mejora
- **Tecnologías:** Oracle Data Modeler, SQL

### **Sistema de Gestión de Colegio (Microservicios)**
- **Ubicación:** `SMTRE 3/DESARROLLOFULLSTACK1/sistema-colegio/`
- **Descripción:** Arquitectura de microservicios para la gestión académica de un colegio.
- **Características:**
  - Servicio de estudiantes independiente
  - Orquestación con Docker Compose
  - Integración con base de datos MySQL
  - Flujo Git colaborativo con ramas y pull requests
- **Tecnologías:** Java, Spring Boot, Maven, MySQL, Docker, Docker Compose, Git

### **Sistema de Gestión de Productos y Clientes**
- **Ubicación:** `SMTRE 3/DESARROLLOFULLSTACK1/fullstack-i-productos-main/` y `fullstack-i-clientes-main/`
- **Descripción:** Aplicaciones full stack independientes para la gestión de catálogos de productos y base de clientes.
- **Tecnologías:** Java, Spring Boot, JPA/Hibernate, MySQL, Maven

### **Actividades de Base de Datos**
- **Ubicación:** `SMTRE 3/BASE DE DATOS/`
- **Proyectos incluidos:**
  - Truck Rental Database
  - IP Futuro Database
  - All The Best Database
  - Kopera Database
- **Descripción:** Ejercicios progresivos de diseño y poblado de bases de datos relacionales.

---

## ⚙️ Guía de Configuración Rápida (Windows - Laboratorios)

### Requisitos Previos
Asegúrate de tener instalado:
- **Git** ([descargar](https://git-scm.com/download/win))
- **Java Development Kit (JDK) 17+** ([descargar](https://www.oracle.com/java/technologies/downloads/))
- **MySQL Community Server** ([descargar](https://dev.mysql.com/downloads/mysql/))
- **Visual Studio Code** ([descargar](https://code.visualstudio.com/))
- **Docker Desktop** (opcional, para microservicios) ([descargar](https://www.docker.com/products/docker-desktop))

### Pasos de Instalación

#### 1️⃣ Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/ing_informatica_duoc.git
cd ing_informatica_duoc
```

#### 2️⃣ Configurar Variables de Entorno
En Windows, agrega al PATH:
- Ruta de JDK: `C:\Program Files\Java\jdk-XX\bin`
- Ruta de MySQL: `C:\Program Files\MySQL\MySQL Server 8.0\bin` (o versión instalada)

Verifica en PowerShell:
```powershell
java -version
mysql --version
```

#### 3️⃣ Clonar Repositorios de Base de Datos
```bash
cd "SMTRE 3/BASE DE DATOS"
# Cada carpeta contiene archivos .sql para crear y poblar las bases de datos
```

#### 4️⃣ Importar Base de Datos en MySQL
```bash
# Abre MySQL Workbench o CLI
mysql -u root -p < ruta/al/archivo.sql
```

#### 5️⃣ Configurar Proyectos Full Stack
```bash
cd "SMTRE 3/DESARROLLOFULLSTACK1/sistema-colegio"
# Construir con Maven
mvn clean install
# Ejecutar
mvn spring-boot:run
```

#### 6️⃣ Abrir Mockups en Navegador
```bash
# Para el caso de Biblioteca
cd "SMTRE 3/INGENIERIA SOFTWARE/CASO BIBLIOTECA/mockup_biblio"
# Abre index.html en tu navegador favorito
```

#### 7️⃣ Usar Docker (Opcional)
```bash
cd "SMTRE 3/DESARROLLOFULLSTACK1/sistema-colegio"
docker-compose up
```

---

## 🛠️ Tecnologías y Herramientas

| Categoría | Tecnologías |
|-----------|------------|
| **Lenguajes de Programación** | Java, SQL, HTML5, CSS3, JavaScript |
| **Backend & Frameworks** | Spring Boot 2.x, Spring Data JPA, Hibernate |
| **Base de Datos** | MySQL 8.0, SQL Server (compatible) |
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) |
| **Control de Versiones** | Git, GitHub |
| **Herramientas de Modelado** | Oracle Data Modeler, MySQL Workbench |
| **Contenedorización** | Docker, Docker Compose |
| **Build & Dependency** | Maven 3.6+ |
| **IDEs & Editors** | Visual Studio Code, Eclipse, MySQL Workbench |
| **Sistemas Operativos** | Windows 10/11, Linux, macOS |

---

## 📁 Estructura del Repositorio

```
ing_informatica_duoc/
├── SMTRE 3/
│   ├── BASE DE DATOS/           # Ejercicios y casos de diseño BD
│   ├── DESARROLLOFULLSTACK1/    # Proyectos Java + Spring Boot
│   ├── INGENIERIA SOFTWARE/     # Casos de estudio y mockups
│   └── CLASE ACT 2.2/           # Actividades complementarias
├── LICENSE                       # Licencia del proyecto
└── README.md                     # Este archivo
```

---

## 🎯 Objetivos de Aprendizaje Alcanzados

✅ Análisis y diseño de sistemas de información  
✅ Modelado de datos y bases de datos relacionales  
✅ Desarrollo de aplicaciones web full stack  
✅ Arquitectura de microservicios  
✅ Implementación de patrones de software  
✅ Uso de herramientas de control de versiones  
✅ Contenedorización y orquestación de servicios  
✅ Documentación técnica y especificación de requisitos  

---

## 📝 Notas Importantes

- **Organización:** Cada semestre y asignatura tiene su propia carpeta con subcarpetas por actividad/proyecto.
- **Bases de Datos:** Los archivos `.sql` están listos para ejecutarse. Crea una BD vacía antes de importar.
- **Proyectos Maven:** Asegúrate de tener Maven instalado y PATH configurado correctamente.
- **Docker:** Los archivos `docker-compose.yml` facilitan levantar todo el stack sin instalaciones locales.
- **Git:** Utiliza ramas para cada funcionalidad y mantén `main` estable.

---

## 🤝 Contribuciones

Este repositorio documenta mi aprendizaje académico. Si deseas replicar o mejorar cualquier proyecto:

1. Realiza un fork del repositorio
2. Crea una rama para tu mejora: `git checkout -b mejora/tu-caracteristica`
3. Commit tus cambios: `git commit -m "Descripción clara del cambio"`
4. Push a tu rama: `git push origin mejora/tu-caracteristica`
5. Abre un Pull Request

---

## 📞 Contacto

**Autor:** Mariano Acevedo  
**Institución:** Duoc UC - Ingeniería en Informática  
**Período Académico:** 2024-2026

---

## 📄 Licencia

Este proyecto está bajo la licencia especificada en [LICENSE](LICENSE). Consulta el archivo para más detalles.

---

**Última actualización:** 30 de abril de 2026  
*Este README se actualiza conforme avanzan los semestres y se completan nuevos proyectos.*
