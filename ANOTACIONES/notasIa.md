# 🐧 Guía de Integración: IA Local en Ubuntu (Sin Límites)

Esta guía detalla cómo configurar un entorno de IA privado en **Linux**, optimizado para tu **Intel Core Ultra 7** y **32GB de RAM**.

---

## 1. Instalar Ollama en Ubuntu
En Linux no bajamos un `.exe`. Todo se hace por terminal para que el sistema lo reconozca como un servicio nativo.

1.  Abre tu terminal (`Ctrl + Alt + T`).
2.  Ejecuta el script oficial de instalación:
    ```bash
    curl -fsSL [https://ollama.com/install.sh](https://ollama.com/install.sh) | sh
    
Verificación: Una vez termine, escribe ollama --version. Si responde, el servicio ya está corriendo de fondo (systemd).

2. Descargar los Modelos (Cerebros)
Desde la misma terminal, baja los modelos que aguantan tus 32GB de RAM:

DeepSeek Coder V2 (16B): El mejor para programar.

Bash
ollama run deepseek-coder-v2:16b

*   **Llama 3.1 (8B):** Para respuestas rápidas.
    ```bash
    ollama run llama3.1
    
3. Configurar VS Code (Continue)
En VS Code, instala la extensión Continue.

Haz clic en el icono de Continue (barra lateral izquierda).

Pulsa el engranaje (Settings). Se abrirá un archivo llamado config.json.

Pega esta configuración para conectar con Ollama:

JSON
{
  "models": [
    {
      "title": "Cerebro Local (DeepSeek)",
      "model": "deepseek-coder-v2:16b",
      "provider": "ollama"
    },
    {
      "title": "Rápido (Llama 3.1)",
      "model": "llama3.1",
      "provider": "ollama"
    }
  ],
  "tabAutocompleteModel": {
    "title": "Autocomplete",
    "model": "deepseek-coder-v2:16b",
    "provider": "ollama"
  }
}
4. Tips Pro para Ubuntu
Aceleración de Hardware: Tu Core Ultra 7 tiene una iGPU potente. Ubuntu suele reconocerla mejor que Windows. Si notas lentitud, asegúrate de tener instalados los drivers de Intel:
sudo apt install intel-opencl-icd

Uso de Memoria: En Linux, puedes ver el consumo real en tiempo real con el comando htop. Verás cómo los 32GB de RAM se aprovechan al máximo.

Atajos en Linux:

Ctrl + L: Chat.

Ctrl + I: Editar código directamente.

5. Mantenimiento
Para actualizar Ollama y sus modelos en el futuro, solo vuelve a correr el comando de instalación de la Sección 1 o usa:

Bash
ollama pull deepseek-coder-v2:16b

---

### ¿Cómo aplicarlo en tu archivo `notasIa.md`?
Como ya tienes el archivo abierto en VS Code (según **image_8ecf1c.png**):
1.  Borra lo que tenías.
2.  Pega este nuevo contenido.
3.  Guarda con `Ctrl + S`.

Como estás en Ubuntu, si al correr el comando de instalación de Ollama te pide contraseña, es tu clave de usuario (sudo). ¿Pudiste abrir la terminal ya para probar el primer comando?