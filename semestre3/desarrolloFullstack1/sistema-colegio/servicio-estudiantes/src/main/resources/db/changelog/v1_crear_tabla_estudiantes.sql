-- Liquibase ChangeLog
-- changeset mariano:1
CREATE TABLE estudiantes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    rut VARCHAR(12) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL
);