# Piscinas Verano Perfecto — Prototipo de Gestión de Mantenciones

Prototipo **100% estático** (HTML + CSS + JavaScript, sin build ni servidor) del sistema
de gestión de mantenciones de piscinas descrito en el informe del proyecto. Sirve para
demostrar las 3 interfaces (Administrador/Supervisor, Técnico, Cliente) y el flujo
completo de negocio sin necesidad de instalar nada.

## Cómo usarlo

1. Descarga/copia toda la carpeta `piscinas/`.
2. Abre `index.html` con doble clic (o súbela a cualquier hosting estático: GitHub
   Pages, Netlify, un pendrive, etc.). No requiere PHP, Node, base de datos ni conexión
   a internet.
3. Inicia sesión con cualquiera de los **usuarios demo** (botones de acceso rápido en
   la pantalla de login) o con las credenciales de la tabla más abajo.

Todos los datos viven en `localStorage` del navegador (clave `pvp_db_v1`). Si quieres
volver al dataset original, usa el enlace "Restablecer datos de demostración" en el
login.

## Usuarios demo

| Rol | Nombre | Correo | Contraseña |
|---|---|---|---|
| Administrador | Francisca Muñoz | admin@veranoperfecto.cl | admin123 |
| Supervisor (Sector Oriente) | Camila Soto | camila.soto@veranoperfecto.cl | super123 |
| Supervisor (Sector Sur) | Andrea Vega | andrea.vega@veranoperfecto.cl | super123 |
| Técnico (Sector Oriente) | Pedro Salinas | pedro.salinas@veranoperfecto.cl | tecnico123 |
| Técnico (Sector Poniente, con calificaciones bajas) | Diego Morales | diego.morales@veranoperfecto.cl | tecnico123 |
| Cliente | Condominio Central | contacto@condominiocentral.cl | cliente123 |

(Hay más técnicos y 10 clientes en total; revisa `assets/js/data.js` para la lista
completa.)

## Qué incluye

- **`/admin` → `admin.html`**: dashboard con KPIs, Rutas de Hoy en vivo (se
  autoactualiza cada 8s y al instante si abres `tecnico.html` en otra pestaña),
  Reportes de técnicos (con alerta visual si un técnico promedia menos de 3★),
  CRUD de Contratos / Clientes / Personal, gestión de Turnos con validación de
  solapamiento, Facturación (generación mensual con un botón) e Incidencias.
  El Supervisor ve una versión recortada (solo su sector, sin Contratos/Clientes/
  Personal/Turnos/Facturación) — simula el RBAC real.
- **`/tecnico` → `tecnico.html`**: vista mobile-first con "Mi ruta de hoy", registro de
  pH/cloro y checklist obligatorio antes de "Marcar Efectuada", reagendar (con motivo
  obligatorio) y reportar incidencias con foto.
- **`/portal` → `portal.html`**: estado de pago, próxima visita, plan contratado,
  historial filtrable por fecha, descarga de boletas (PDF vía impresión del navegador)
  y calificación 1-5★ tras una visita Efectuada.

## Patrones de diseño implementados (igual que se pedían para la versión Laravel)

- **Strategy** — `assets/js/pricing.js`: `EstrategiaDescuentoVolumen` y
  `EstrategiaReajusteAnual` son intercambiables y se combinan en `CalculadoraPrecio`.
  Agregar una regla nueva no requiere tocar las existentes.
- **Observer** — `assets/js/observer.js`: cuando un técnico marca una visita como
  Efectuada o Reagendada (`tecnico.js`), se llama a `visitaSubject.notificar(...)`.
  Dos observadores suscritos (notificar a Administración y al Supervisor de la zona)
  reaccionan sin que el formulario del técnico los conozca.

## Por qué es estático y no Laravel

El informe original pedía un backend completo en Laravel + MySQL + Docker. Se cambió a
un prototipo estático porque el objetivo inmediato era tener algo **descargable y
mostrable en cualquier lado** sin depender de un servidor, base de datos o entorno
Docker. Este prototipo reproduce el modelo de datos, las reglas de negocio y los
patrones de diseño en JavaScript, pero **no reemplaza** los requerimientos no
funcionales que sí necesitan un servidor real:

| Requerimiento del informe | En este prototipo | En la versión real (Laravel) |
|---|---|---|
| RBAC por middleware/policies | Simulado en JS (oculta/redirige) — **no es seguridad real**, cualquiera con consola del navegador puede saltárselo | `spatie/laravel-permission` + Policies en el servidor |
| Persistencia de datos | `localStorage` del navegador (no se comparte entre dispositivos/usuarios) | MySQL, con migraciones, índices y transacciones |
| PDF / Excel | `window.print()` y CSV vía Blob | `barryvdh/laravel-dompdf` y `maatwebsite/excel` reales |
| Cierre de sesión por inactividad (20 min) / bloqueo (3 intentos / 15 min) | Implementado en `auth.js` con `localStorage`, se puede burlar editando el storage | Sesión de servidor + rate limiting real |
| Notificación Observer | Event bus en memoria + `localStorage` | Eventos/Listeners de Laravel, colas reales |
| Optimización de ruta por geolocalización | TODO — solo se ordena por comuna/hora | API de mapas / geolocalización |
| Disponibilidad offline del técnico | Solo un indicador visual cosmético | PWA + Service Worker + cola de sincronización real |

Si más adelante quieres retomar la versión Laravel completa (backend real, BD, Docker,
RBAC server-side, etc.), este prototipo sirve como especificación funcional viva: cada
pantalla, regla de negocio y entidad ya está validada en JS y se puede traducir 1:1 a
migraciones/modelos/controladores Laravel.

## Estructura de archivos

```
piscinas/
├── index.html              Login + selector de usuarios demo
├── admin.html               Panel Administrador / Supervisor
├── tecnico.html              Vista Técnico (mobile-first)
├── portal.html                Portal de Cliente
├── README.md
└── assets/
    ├── css/styles.css       Design system (paleta azul/turquesa)
    └── js/
        ├── utils.js          Helpers (fechas, CLP, toasts, modales, export CSV)
        ├── data.js            Dataset de demostración + persistencia en localStorage
        ├── pricing.js          Patrón Strategy (cálculo de precios)
        ├── observer.js          Patrón Observer (notificaciones)
        ├── auth.js              Login, sesión, RBAC simulado, lockout
        ├── admin.js              Lógica del panel admin/supervisor
        ├── tecnico.js             Lógica de la vista técnico
        └── portal.js               Lógica del portal de cliente
```

## Limitaciones conocidas (a propósito, para mantenerlo simple)

- Los datos no se sincronizan entre dispositivos ni navegadores: cada navegador tiene
  su propia copia en `localStorage`.
- Borrar el historial de navegación / datos del sitio borra el dataset (usa
  "Restablecer datos de demostración" para regenerarlo).
- Las contraseñas se guardan en texto plano en el dataset de demo — es solo para
  fines de demostración, nunca se haría así en producción.
