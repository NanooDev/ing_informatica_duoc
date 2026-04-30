# ================================
# STAGE 1: BUILD
# Usa Maven con JDK 21 para compilar y empaquetar la aplicación
# ================================
FROM maven:3.9-eclipse-temurin-21 AS build

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el pom.xml primero para aprovechar la caché de capas de Docker
# Si el pom no cambia, Maven no re-descarga las dependencias
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copia el código fuente
COPY src ./src

# Compila y empaqueta la aplicación, omitiendo los tests
RUN mvn package -DskipTests -q


# ================================
# STAGE 2: RUN
# Usa solo el JRE para ejecutar el JAR generado (imagen más liviana)
# ================================
FROM eclipse-temurin:21-jre

# Establece el directorio de trabajo
WORKDIR /app

# Copia únicamente el JAR generado desde el stage de build
COPY --from=build /app/target/*.jar app.jar

# Expone el puerto por defecto de Spring Boot
EXPOSE 8080

# Comando para ejecutar la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]