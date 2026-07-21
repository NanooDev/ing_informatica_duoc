/*
 * Autenticación y RBAC del prototipo (simulados en el cliente, sin backend).
 * En la versión Laravel real esto lo resuelven middleware + policies de
 * spatie/laravel-permission; aquí se reproduce el mismo comportamiento
 * (sesión, expiración por inactividad, bloqueo por intentos) en JS para
 * que la demo se sienta igual, dejando muy claro en el README que la
 * protección real de rutas/datos requiere un servidor.
 */
window.App = window.App || {};

App.Auth = (function () {
  const SESSION_KEY = 'pvp_session_v1';
  const INTENTOS_KEY = 'pvp_login_attempts_v1';
  const MAX_INTENTOS = 3;
  const BLOQUEO_MIN = 15;
  const INACTIVIDAD_MIN = 20;

  function registrarIntentoFallido(email) {
    const data = JSON.parse(localStorage.getItem(INTENTOS_KEY) || '{}');
    const reg = data[email] || { intentos: 0, bloqueadoHasta: null };
    reg.intentos += 1;
    if (reg.intentos >= MAX_INTENTOS) {
      reg.bloqueadoHasta = Date.now() + BLOQUEO_MIN * 60 * 1000;
    }
    data[email] = reg;
    localStorage.setItem(INTENTOS_KEY, JSON.stringify(data));
    return reg;
  }

  function estaBloqueado(email) {
    const data = JSON.parse(localStorage.getItem(INTENTOS_KEY) || '{}');
    const reg = data[email];
    if (!reg || !reg.bloqueadoHasta) return null;
    if (Date.now() >= reg.bloqueadoHasta) {
      delete data[email];
      localStorage.setItem(INTENTOS_KEY, JSON.stringify(data));
      return null;
    }
    return reg.bloqueadoHasta;
  }

  function limpiarIntentos(email) {
    const data = JSON.parse(localStorage.getItem(INTENTOS_KEY) || '{}');
    delete data[email];
    localStorage.setItem(INTENTOS_KEY, JSON.stringify(data));
  }

  // Devuelve { ok, usuario } o { ok:false, motivo, bloqueadoHasta }
  function login(email, password) {
    email = (email || '').trim().toLowerCase();
    const bloqueadoHasta = estaBloqueado(email);
    if (bloqueadoHasta) {
      return { ok: false, motivo: 'bloqueado', bloqueadoHasta };
    }

    const db = App.DB.cargar();
    const usuario = db.usuarios.find((u) => u.email.toLowerCase() === email);

    if (!usuario || usuario.password !== password) {
      const reg = registrarIntentoFallido(email);
      const restantes = Math.max(0, MAX_INTENTOS - reg.intentos);
      return { ok: false, motivo: 'credenciales', intentosRestantes: restantes, bloqueadoHasta: reg.bloqueadoHasta };
    }

    if (usuario.rol !== 'cliente') {
      const empleado = db.empleados.find((e) => e.id === usuario.refId);
      if (empleado && empleado.activo === false) {
        return { ok: false, motivo: 'inactivo' };
      }
    } else {
      const cliente = db.clientes.find((c) => c.id === usuario.refId);
      if (cliente && cliente.activo === false) {
        return { ok: false, motivo: 'inactivo' };
      }
    }

    limpiarIntentos(email);
    const sesion = { userId: usuario.id, ultimaActividad: Date.now() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
    return { ok: true, usuario };
  }

  function sesionActual() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const sesion = JSON.parse(raw);
    const minutosInactivo = (Date.now() - sesion.ultimaActividad) / 60000;
    if (minutosInactivo > INACTIVIDAD_MIN) {
      cerrarSesion();
      return null;
    }
    const db = App.DB.cargar();
    const usuario = db.usuarios.find((u) => u.id === sesion.userId);
    if (!usuario) { cerrarSesion(); return null; }
    return usuario;
  }

  function tocarActividad() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return;
    const sesion = JSON.parse(raw);
    sesion.ultimaActividad = Date.now();
    localStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
  }

  function cerrarSesion() {
    localStorage.removeItem(SESSION_KEY);
  }

  const RUTA_POR_ROL = {
    administrador: 'admin.html',
    supervisor: 'admin.html',
    tecnico: 'tecnico.html',
    cliente: 'portal.html',
  };

  // Protege una página: si no hay sesión válida o el rol no calza, redirige.
  function requerirRol(rolesPermitidos) {
    const usuario = sesionActual();
    if (!usuario) {
      window.location.href = 'index.html';
      return null;
    }
    if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
      window.location.href = RUTA_POR_ROL[usuario.rol] || 'index.html';
      return null;
    }
    iniciarVigilanciaInactividad();
    return usuario;
  }

  let vigilanciaActiva = false;
  function iniciarVigilanciaInactividad() {
    if (vigilanciaActiva) return;
    vigilanciaActiva = true;
    ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'].forEach((ev) => {
      window.addEventListener(ev, tocarActividad, { passive: true });
    });
    setInterval(() => {
      if (!sesionActual()) {
        window.location.href = 'index.html?expirada=1';
      }
    }, 15000);
  }

  function redirigirSegunRol(usuario) {
    window.location.href = RUTA_POR_ROL[usuario.rol] || 'index.html';
  }

  return {
    login, sesionActual, cerrarSesion, requerirRol, redirigirSegunRol,
    MAX_INTENTOS, BLOQUEO_MIN, INACTIVIDAD_MIN,
  };
})();
