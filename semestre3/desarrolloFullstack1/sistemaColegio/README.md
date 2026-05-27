🚩 Paso 1: Clonar el proyecto (Solo la primera vez)

Mariano creará el repositorio en la página de GitHub. Una vez creado, les pasará un link. Ustedes abren una terminal y escriben:

git clone https://github.com/usuario/sistema-colegio-backend.git

(Esto descarga una copia de todo el proyecto en su PC).

🔄 Paso 2: Actualizarse antes de empezar a trabajar

REGLA DE ORO: Antes de escribir una sola línea de código, deben traer lo que sus compañeros hicieron para no tener conflictos:

git pull origin main

🌿 Paso 3: Trabajar en una "Rama" (Branch)

Nunca trabajen directo en main. Creen su propio espacio:
Bash

# Ejemplo para Mariano creando el servicio de estudiantes
git checkout -b funcionalidad/estudiantes

💾 Paso 4: Guardar y subir sus cambios

Cuando terminen una parte del código:

    Guardar localmente: git add . (esto selecciona todo lo que cambiaron).

    Ponerle un nombre: git commit -m "Cree la entidad Estudiante y su base de datos".

    Subir a la nube: git push origin funcionalidad/estudiantes.

🤝 Paso 5: Unir los cambios (Pull Request)

En la página de GitHub, aparecerá un botón verde que dice "Compare & pull request". Mariano debe revisarlo y darle a "Merge" para que ese código pase a la rama principal del colegio.
