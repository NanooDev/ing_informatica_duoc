/*
 * Lógica del Panel de Administrador / Supervisor.
 * Administrador ve todas las secciones; Supervisor solo Panel de Control,
 * Rutas de Hoy, Reportes Técnicos e Incidencias (y solo de su sector) -- la
 * verificación real de permisos en la versión Laravel la harían las
 * Policies; aquí se reproduce ocultando/bloqueando en el cliente.
 */
(function () {
  const usuario = App.Auth.requerirRol(['administrador', 'supervisor']);
  if (!usuario) return;

  const U = App.Utils;
  let db = App.DB.cargar();
  const esSupervisor = usuario.rol === 'supervisor';
  const empleadoActual = db.empleados.find((e) => e.id === usuario.refId) || null;
  let seccionActual = 'dashboard';
  let piscinasNuevasTemp = [];

  function crearAudit(accion, entidad, entidadId, detalle) {
    return { id: U.uid('aud'), userId: usuario.id, usuarioNombre: usuario.nombre, accion, entidad, entidadId, detalle, creada: new Date().toISOString() };
  }

  // ---------------------------------------------------------------------
  // Navegación
  // ---------------------------------------------------------------------
  const TITULOS = {
    dashboard: 'Panel de Control', rutas: 'Rutas de Hoy', reportes: 'Reportes Técnicos',
    contratos: 'Contratos', clientes: 'Clientes', personal: 'Personal', turnos: 'Turnos',
    facturacion: 'Facturación', incidencias: 'Incidencias',
  };

  function aplicarVisibilidadNav() {
    if (!esSupervisor) return;
    const permitido = ['dashboard', 'rutas', 'reportes', 'incidencias'];
    U.$all('#nav-admin a').forEach((a) => {
      if (!permitido.includes(a.dataset.section)) a.style.display = 'none';
    });
  }

  function mostrarSeccion(nombre) {
    seccionActual = nombre;
    U.$all('.admin-section').forEach((s) => s.classList.remove('active'));
    const sec = document.getElementById('sec-' + nombre);
    if (sec) sec.classList.add('active');
    U.$all('#nav-admin a').forEach((a) => a.classList.toggle('active', a.dataset.section === nombre));
    U.$('#topbar-title').textContent = TITULOS[nombre] || '';
    document.getElementById('sidebar').classList.remove('open');
    renderSeccion(nombre);
  }

  function renderSeccion(nombre) {
    db = App.DB.cargar();
    if (nombre === 'dashboard') renderDashboard();
    else if (nombre === 'rutas') renderRutasHoy();
    else if (nombre === 'reportes') renderReportes();
    else if (nombre === 'contratos') renderContratos();
    else if (nombre === 'clientes') renderClientes();
    else if (nombre === 'personal') renderPersonal();
    else if (nombre === 'turnos') renderTurnos();
    else if (nombre === 'facturacion') renderFacturacion();
    else if (nombre === 'incidencias') renderIncidencias();
    actualizarNotificaciones();
  }

  U.$all('#nav-admin a').forEach((a) => {
    a.addEventListener('click', (e) => { e.preventDefault(); mostrarSeccion(a.dataset.section); });
  });
  document.getElementById('btn-menu').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));
  document.getElementById('btn-logout').addEventListener('click', (e) => { e.preventDefault(); App.Auth.cerrarSesion(); window.location.href = 'index.html'; });
  U.$('#sb-user-name').textContent = usuario.nombre;
  U.$('#sb-user-role').textContent = U.capitalize(usuario.rol) + (empleadoActual && empleadoActual.sectorId ? ' · ' + sectorNombre(empleadoActual.sectorId) : '');
  U.$('#topbar-avatar').textContent = U.inicialesNombre(usuario.nombre);
  U.$('#topbar-avatar').classList.add(...U.claseAvatar(usuario.nombre).split(' ').slice(1));

  U.$all('[data-close]').forEach((btn) => btn.addEventListener('click', () => U.modalCerrar(btn.dataset.close)));
  U.$all('.modal-overlay').forEach((m) => m.addEventListener('click', (e) => { if (e.target === m) U.modalCerrar(m.id); }));

  // ---------------------------------------------------------------------
  // Helpers de datos
  // ---------------------------------------------------------------------
  function nombreCliente(id) { const c = db.clientes.find((c) => c.id === id); return c ? c.nombre : '—'; }
  function nombreEmpleado(id) { const e = db.empleados.find((e) => e.id === id); return e ? e.nombre : 'Sin asignar'; }
  function piscina(id) { return db.piscinas.find((p) => p.id === id); }
  function sectorNombre(id) { const s = db.sectores.find((s) => s.id === id); return s ? s.nombre : '—'; }
  function tipoMantNombre(id) { const t = db.tiposMantencion.find((t) => t.id === id); return t ? t.nombre : '—'; }

  function visitaEnSectorPermitido(v) {
    if (!esSupervisor) return true;
    const p = piscina(v.piscinaId);
    return p && empleadoActual && p.sectorId === empleadoActual.sectorId;
  }

  function visitasDeHoy() {
    const hoyIso = U.toISODate(new Date());
    return db.visitas.filter((v) => v.fechaProgramada === hoyIso && visitaEnSectorPermitido(v));
  }

  function ordenarRuta(visitas) {
    // Orden simplificado por sector/comuna y luego por hora (ver README:
    // la optimización real por geolocalización queda documentada como TODO v2).
    return visitas.slice().sort((a, b) => {
      const pa = piscina(a.piscinaId), pb = piscina(b.piscinaId);
      const comunaCmp = (pa ? pa.comuna : '').localeCompare(pb ? pb.comuna : '');
      if (comunaCmp !== 0) return comunaCmp;
      return (a.horaProgramada || '').localeCompare(b.horaProgramada || '');
    });
  }

  // ---------------------------------------------------------------------
  // Dashboard
  // ---------------------------------------------------------------------
  const MESES_CORTO = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  function ultimosMesesData(n) {
    const hoy = new Date();
    const meses = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      meses.push({ anio: d.getFullYear(), mes: d.getMonth() + 1, label: MESES_CORTO[d.getMonth()] });
    }
    return meses.map((m) => {
      const visitasMes = db.visitas.filter((v) => {
        if (v.estado !== 'efectuada' || !visitaEnSectorPermitido(v)) return false;
        const f = new Date(v.fechaProgramada);
        return f.getFullYear() === m.anio && f.getMonth() + 1 === m.mes;
      });
      return { label: m.label, visitas: visitasMes.length, ingresos: visitasMes.reduce((a, v) => a + (v.precioVisita || 0), 0) };
    });
  }

  function renderGraficosDashboard() {
    const datos = ultimosMesesData(6);
    U.$('#chart-visitas').innerHTML = U.graficoLineas(datos.map((d) => d.visitas), { color: 'var(--turquesa-500)' });
    U.$('#chart-visitas-labels').innerHTML = datos.map((d) => `<span>${d.label}</span>`).join('');
    U.$('#chart-ingresos').innerHTML = U.graficoBarras(datos.map((d) => d.ingresos), { color: 'var(--azul-600)' });
    U.$('#chart-ingresos-labels').innerHTML = datos.map((d) => `<span>${d.label}</span>`).join('');
  }

  function renderMapaRutas(hoy) {
    const porComuna = {};
    hoy.forEach((v) => {
      const p = piscina(v.piscinaId);
      const comuna = p ? p.comuna : 'Sin comuna';
      (porComuna[comuna] = porComuna[comuna] || []).push(v);
    });
    const comunas = Object.keys(porComuna);
    const cont = U.$('#mapa-rutas-pins');
    U.$('#mapa-detalle').style.display = 'none';
    if (comunas.length === 0) {
      cont.innerHTML = '<p class="empty-state">Sin rutas programadas para hoy.</p>';
      return;
    }
    cont.innerHTML = comunas.map((c) => {
      const seed = U.hashStr(c);
      const left = 10 + (seed % 76);
      const top = 18 + ((seed >> 4) % 58);
      return `<button type="button" class="mapa-pin" data-comuna="${c}" style="left:${left}%;top:${top}%;" title="Ver ${porComuna[c].length} visita(s) en ${c}">
        <span class="mapa-pin-dot">📍</span>
        <span class="mapa-pin-label">${c} <b>${porComuna[c].length}</b></span>
      </button>`;
    }).join('');

    U.$all('.mapa-pin', cont).forEach((btn) => {
      btn.addEventListener('click', () => mostrarDetalleComuna(btn.dataset.comuna, porComuna[btn.dataset.comuna], btn));
    });
  }

  function mostrarDetalleComuna(comuna, visitas, btnEl) {
    const panel = U.$('#mapa-detalle');
    const yaAbierto = panel.style.display === 'block' && panel.dataset.comuna === comuna;
    U.$all('.mapa-pin').forEach((b) => b.classList.toggle('activo', !yaAbierto && b === btnEl));
    if (yaAbierto) { panel.style.display = 'none'; return; }

    panel.dataset.comuna = comuna;
    panel.innerHTML = `
      <div class="flex-between mb-8">
        <strong>📍 ${comuna} · ${visitas.length} visita(s)</strong>
        <button type="button" class="modal-close" id="mapa-detalle-cerrar">✕</button>
      </div>
      ${visitas.map((v) => {
        const p = piscina(v.piscinaId);
        const ct = db.contratos.find((c) => c.id === v.contratoId);
        return `<div class="mapa-detalle-item">
          <div>
            <strong>${p ? p.alias : ''}</strong> · ${nombreCliente(ct ? ct.clienteId : null)}
            <div class="text-sm text-suave">🧑‍🔧 ${nombreEmpleado(v.empleadoId)} · 🕒 ${v.horaProgramada}</div>
          </div>
          <span class="${U.badgeEstadoVisita(v.estado)}">${U.labelEstadoVisita(v.estado)}</span>
        </div>`;
      }).join('')}`;
    panel.style.display = 'block';
    document.getElementById('mapa-detalle-cerrar').addEventListener('click', () => {
      panel.style.display = 'none';
      U.$all('.mapa-pin').forEach((b) => b.classList.remove('activo'));
    });
  }

  function renderTecnicosEnTerreno(hoy) {
    const idsTecnicos = Array.from(new Set(hoy.map((v) => v.empleadoId)));
    const filas = idsTecnicos.map((id) => {
      const emp = db.empleados.find((e) => e.id === id);
      if (!emp) return null;
      const visitasEmp = hoy.filter((v) => v.empleadoId === id);
      return { emp, total: visitasEmp.length, efectuadas: visitasEmp.filter((v) => v.estado === 'efectuada').length };
    }).filter(Boolean);

    U.$('#lista-tecnicos-terreno').innerHTML = filas.map((f) => `
      <div class="tecnico-item">
        <div class="${U.claseAvatar(f.emp.nombre)} avatar-sm">${U.inicialesNombre(f.emp.nombre)}</div>
        <div class="tecnico-item-info">
          <strong>${f.emp.nombre}</strong>
          <span class="text-sm text-suave">${sectorNombre(f.emp.sectorId)}</span>
        </div>
        <span class="badge badge-info">${f.efectuadas}/${f.total}</span>
      </div>`).join('') || '<p class="empty-state">Sin técnicos en ruta hoy.</p>';
  }

  function renderDashboard() {
    const hoy = visitasDeHoy();
    U.$('#kpi-visitas-hoy').textContent = hoy.length;
    U.$('#kpi-efectuadas').textContent = hoy.filter((v) => v.estado === 'efectuada').length;
    U.$('#kpi-en-proceso').textContent = hoy.filter((v) => v.estado === 'en_curso').length;
    U.$('#kpi-tecnicos').textContent = db.empleados.filter((e) => e.cargo === 'tecnico' && e.activo).length;

    renderGraficosDashboard();
    renderMapaRutas(hoy);
    renderTecnicosEnTerreno(hoy);

    const filas = ordenarRuta(hoy).slice(0, 6).map((v) => filaRutaPreview(v)).join('')
      || '<tr><td colspan="5" class="empty-state">No hay visitas programadas para hoy en tu zona.</td></tr>';
    U.$('#tbody-rutas-hoy-preview').innerHTML = filas;

    const clientesOrdenados = db.clientes
      .map((c) => {
        const contratoIds = db.contratos.filter((ct) => ct.clienteId === c.id).map((ct) => ct.id);
        const visitasCliente = db.visitas.filter((v) => contratoIds.includes(v.contratoId))
          .sort((a, b) => (a.fechaProgramada < b.fechaProgramada ? 1 : -1));
        return { cliente: c, ultimaVisita: visitasCliente[0] };
      })
      .filter((x) => x.ultimaVisita)
      .sort((a, b) => (a.ultimaVisita.fechaProgramada < b.ultimaVisita.fechaProgramada ? 1 : -1))
      .slice(0, 6);

    U.$('#tbody-clientes-recientes').innerHTML = clientesOrdenados.map(({ cliente, ultimaVisita }) => {
      const incidenciaAbierta = db.incidencias.find((i) => i.estado !== 'resuelta'
        && db.visitas.find((v) => v.id === i.visitaId && v.contratoId && db.contratos.find((ct) => ct.id === v.contratoId && ct.clienteId === cliente.id)));
      const reporte = incidenciaAbierta ? incidenciaAbierta.descripcion : 'Mantención al día';
      return `<tr>
        <td><strong>${cliente.nombre}</strong></td>
        <td>${cliente.tipo} · ${cliente.tamano}</td>
        <td><span class="${U.badgeEstadoVisita(ultimaVisita.estado)}">${U.labelEstadoVisita(ultimaVisita.estado)}</span></td>
        <td class="celda-suave">${reporte}</td>
      </tr>`;
    }).join('') || '<tr><td colspan="4" class="empty-state">Sin datos todavía.</td></tr>';
  }

  function filaRutaPreview(v) {
    const p = piscina(v.piscinaId);
    const ct = db.contratos.find((c) => c.id === v.contratoId);
    return `<tr class="pointer" data-visita="${v.id}">
      <td><strong>${nombreCliente(ct ? ct.clienteId : null)}</strong><br><span class="celda-suave text-sm">${p ? p.alias : ''}</span></td>
      <td>${nombreEmpleado(v.empleadoId)}</td>
      <td>${p ? p.comuna : '—'}</td>
      <td>${v.horaProgramada}</td>
      <td><span class="${U.badgeEstadoVisita(v.estado)}">${U.labelEstadoVisita(v.estado)}</span></td>
    </tr>`;
  }

  // ---------------------------------------------------------------------
  // Rutas de hoy (vista completa)
  // ---------------------------------------------------------------------
  function renderRutasHoy() {
    const filas = ordenarRuta(visitasDeHoy());
    U.$('#rutas-actualizado').textContent = 'Actualizado ' + new Date().toLocaleTimeString('es-CL');
    U.$('#tbody-rutas-hoy').innerHTML = filas.map((v) => {
      const p = piscina(v.piscinaId);
      const ct = db.contratos.find((c) => c.id === v.contratoId);
      return `<tr>
        <td>${nombreCliente(ct ? ct.clienteId : null)}</td>
        <td>${p ? p.alias : '—'}</td>
        <td>${p ? p.comuna : '—'}</td>
        <td>${nombreEmpleado(v.empleadoId)}</td>
        <td>${v.horaProgramada}</td>
        <td><span class="${U.badgeEstadoVisita(v.estado)}">${U.labelEstadoVisita(v.estado)}</span>${v.validada ? ' ✅' : ''}</td>
        <td><button class="btn btn-outline btn-sm" data-ver-visita="${v.id}">Ver</button></td>
      </tr>`;
    }).join('') || '<tr><td colspan="7" class="empty-state">No hay visitas programadas para hoy en tu zona.</td></tr>';

    U.$all('[data-ver-visita]').forEach((b) => b.addEventListener('click', () => abrirDetalleVisita(b.dataset.verVisita)));
    U.$all('#tbody-rutas-hoy-preview tr[data-visita]').forEach((tr) => tr.addEventListener('click', () => abrirDetalleVisita(tr.dataset.visita)));
  }

  function abrirDetalleVisita(visitaId) {
    db = App.DB.cargar();
    const v = db.visitas.find((x) => x.id === visitaId);
    if (!v) return;
    const p = piscina(v.piscinaId);
    const ct = db.contratos.find((c) => c.id === v.contratoId);
    const tm = ct ? db.tiposMantencion.find((t) => t.id === ct.tipoMantencionId) : null;
    const cal = v.calificacionId ? db.calificaciones.find((c) => c.id === v.calificacionId) : null;

    let html = `
      <p><strong>${nombreCliente(ct ? ct.clienteId : null)}</strong> — ${p ? p.alias : ''}</p>
      <p class="text-suave text-sm">${p ? p.direccion + ', ' + p.comuna : ''}</p>
      <p>Técnico: <strong>${nombreEmpleado(v.empleadoId)}</strong> · Plan: ${tm ? tm.nombre : '—'} (${ct ? ct.frecuencia : ''})</p>
      <p>Programada: ${U.formatDateEs(v.fechaProgramada)} ${v.horaProgramada} — <span class="${U.badgeEstadoVisita(v.estado)}">${U.labelEstadoVisita(v.estado)}</span></p>`;

    if (v.parametrosQuimicos) {
      html += `<div class="divider"></div><p><strong>Parámetros químicos:</strong> pH ${v.parametrosQuimicos.ph} · Cloro ${v.parametrosQuimicos.cloro} ppm</p>`;
      if (v.parametrosQuimicos.observaciones) html += `<p class="text-sm text-suave">${v.parametrosQuimicos.observaciones}</p>`;
      html += '<p><strong>Checklist:</strong></p><ul>' + v.checklist.map((it) => `<li>${it.completado ? '✅' : '⬜️'} ${it.tarea}</li>`).join('') + '</ul>';
    }
    if (v.motivoReagendamiento) {
      html += `<div class="divider"></div><p><strong>Motivo de reagendamiento:</strong> ${v.motivoReagendamiento}</p>`;
    }
    if (v.solicitudReagendamiento) {
      html += `<div class="divider"></div><p><strong>Solicitud de reagendamiento del cliente:</strong> ${v.solicitudReagendamiento.motivo}</p>`;
    }
    if (cal) {
      html += `<div class="divider"></div><p><strong>Calificación del cliente:</strong> <span class="estrellas">${U.estrellas(cal.estrellas)}</span></p>`;
      if (cal.comentario) html += `<p class="text-sm text-suave">"${cal.comentario}"</p>`;
    }

    const puedeValidar = esSupervisor && v.estado === 'efectuada' && !v.validada && visitaEnSectorPermitido(v);
    if (puedeValidar) {
      html += `<div class="divider"></div><button class="btn btn-primary btn-block" id="btn-validar-visita">✅ Validar calidad de esta visita</button>`;
    } else if (v.validada) {
      html += `<div class="divider"></div><p class="badge badge-activo">Validada por supervisión</p>`;
    }

    if (!esSupervisor && (v.estado === 'pendiente' || v.estado === 'en_curso')) {
      const tecnicosDisponibles = db.empleados.filter((e) => e.cargo === 'tecnico' && e.activo);
      html += `<div class="divider"></div>
        <label class="text-sm" style="font-weight:600;">Reasignar técnico</label>
        <div class="flex gap-8 mt-8">
          <select class="input" id="select-reasignar">${tecnicosDisponibles.map((t) => `<option value="${t.id}" ${t.id === v.empleadoId ? 'selected' : ''}>${t.nombre}</option>`).join('')}</select>
          <button class="btn btn-secondary" id="btn-reasignar">Asignar</button>
        </div>`;
    }

    U.$('#visita-detalle-cuerpo').innerHTML = html;
    U.modalAbrir('modal-visita-detalle');

    const btnValidar = document.getElementById('btn-validar-visita');
    if (btnValidar) btnValidar.addEventListener('click', () => {
      db = App.DB.cargar();
      const visita = db.visitas.find((x) => x.id === visitaId);
      visita.validada = true;
      App.DB.guardar(db);
      U.toast('Visita validada correctamente.', 'success');
      U.modalCerrar('modal-visita-detalle');
      renderSeccion(seccionActual);
    });
    const btnReasignar = document.getElementById('btn-reasignar');
    if (btnReasignar) btnReasignar.addEventListener('click', () => {
      db = App.DB.cargar();
      const visita = db.visitas.find((x) => x.id === visitaId);
      visita.empleadoId = document.getElementById('select-reasignar').value;
      App.DB.guardar(db);
      U.toast('Técnico reasignado.', 'success');
      U.modalCerrar('modal-visita-detalle');
      renderSeccion(seccionActual);
    });
  }

  // ---------------------------------------------------------------------
  // Reportes técnicos / ingresos
  // ---------------------------------------------------------------------
  function datosReporteTecnicos() {
    return db.empleados
      .filter((e) => e.cargo === 'tecnico' && (!esSupervisor || e.sectorId === (empleadoActual && empleadoActual.sectorId)))
      .map((t) => {
        const visitasEfectuadas = db.visitas.filter((v) => v.empleadoId === t.id && v.estado === 'efectuada');
        const calls = visitasEfectuadas.map((v) => db.calificaciones.find((c) => c.id === v.calificacionId)).filter(Boolean);
        const promedio = calls.length ? calls.reduce((a, c) => a + c.estrellas, 0) / calls.length : null;
        const incidenciasCount = db.incidencias.filter((i) => i.empleadoId === t.id).length;
        return { tecnico: t, visitas: visitasEfectuadas.length, promedio, incidenciasCount };
      });
  }

  function renderReportes() {
    const filas = datosReporteTecnicos();
    U.$('#tbody-reportes-tecnicos').innerHTML = filas.map((f) => `
      <tr>
        <td><strong>${f.tecnico.nombre}</strong></td>
        <td>${sectorNombre(f.tecnico.sectorId)}</td>
        <td>${f.visitas}</td>
        <td>${f.promedio !== null ? f.promedio.toFixed(1) + ' ★' : '—'} ${f.promedio !== null && f.promedio < 3 ? '<span class="alerta-baja-calificacion">⚠ Bajo desempeño</span>' : ''}</td>
        <td>${f.incidenciasCount}</td>
      </tr>`).join('') || '<tr><td colspan="5" class="empty-state">Sin datos.</td></tr>';

    const periodos = {};
    db.facturas.forEach((f) => {
      const key = f.anio + '-' + String(f.mes).padStart(2, '0');
      periodos[key] = periodos[key] || { visitas: 0, ingresos: 0 };
      periodos[key].ingresos += f.montoTotal;
      periodos[key].visitas += db.facturaDetalles.filter((fd) => fd.facturaId === f.id).length;
    });
    const claves = Object.keys(periodos).sort().reverse();
    U.$('#tbody-ingresos-mes').innerHTML = claves.map((k) => `
      <tr><td>${k}</td><td>${periodos[k].visitas}</td><td>${U.formatCLP(periodos[k].ingresos)}</td></tr>
    `).join('') || '<tr><td colspan="3" class="empty-state">Aún no se ha generado facturación.</td></tr>';

    U.$('#btn-export-tecnicos-csv').onclick = () => {
      U.exportarCSV('reporte-tecnicos.csv', ['Técnico', 'Sector', 'Visitas efectuadas', 'Calificación promedio', 'Incidencias'],
        filas.map((f) => [f.tecnico.nombre, sectorNombre(f.tecnico.sectorId), f.visitas, f.promedio !== null ? f.promedio.toFixed(1) : '-', f.incidenciasCount]));
    };
    U.$('#btn-export-tecnicos-pdf').onclick = () => {
      const filasHtml = filas.map((f) => `<tr><td>${f.tecnico.nombre}</td><td>${sectorNombre(f.tecnico.sectorId)}</td><td>${f.visitas}</td><td>${f.promedio !== null ? f.promedio.toFixed(1) : '-'}</td><td>${f.incidenciasCount}</td></tr>`).join('');
      abrirImpresion('Reporte de desempeño de técnicos', `
        <h2>Reporte de desempeño de técnicos</h2>
        <p class="text-suave">Generado ${new Date().toLocaleString('es-CL')}</p>
        <table class="tabla"><thead><tr><th>Técnico</th><th>Sector</th><th>Visitas</th><th>Promedio</th><th>Incidencias</th></tr></thead><tbody>${filasHtml}</tbody></table>`);
    };
    U.$('#btn-export-ingresos-csv').onclick = () => {
      U.exportarCSV('reporte-ingresos.csv', ['Periodo', 'Visitas efectuadas', 'Ingresos'], claves.map((k) => [k, periodos[k].visitas, periodos[k].ingresos]));
    };
  }

  function abrirImpresion(titulo, html) {
    U.$('#modal-boleta-titulo').textContent = titulo;
    U.$('#boleta-cuerpo').innerHTML = html;
    U.modalAbrir('modal-boleta');
  }

  // ---------------------------------------------------------------------
  // Contratos
  // ---------------------------------------------------------------------
  function renderContratos() {
    U.$('#tbody-contratos').innerHTML = db.contratos.map((c) => {
      const piscinasNombres = c.piscinaIds.map((id) => piscina(id)).filter(Boolean).map((p) => p.alias).join(', ');
      const precioVigente = App.Pricing.precioVigente(c, c.piscinaIds.length);
      return `<tr>
        <td><strong>${nombreCliente(c.clienteId)}</strong></td>
        <td class="text-sm">${piscinasNombres}</td>
        <td>${U.capitalize(c.frecuencia)}</td>
        <td>${tipoMantNombre(c.tipoMantencionId)}</td>
        <td>${U.formatCLP(precioVigente)}</td>
        <td><span class="badge ${c.estado === 'activo' ? 'badge-activo' : 'badge-inactivo'}">${U.capitalize(c.estado)}</span></td>
        <td><button class="btn btn-outline btn-sm" data-editar-contrato="${c.id}">Editar</button></td>
      </tr>`;
    }).join('') || '<tr><td colspan="7" class="empty-state">Sin contratos registrados.</td></tr>';

    U.$all('[data-editar-contrato]').forEach((b) => b.addEventListener('click', () => abrirModalContrato(b.dataset.editarContrato)));
  }

  function poblarSelectClientes(select) {
    select.innerHTML = db.clientes.filter((c) => c.activo).map((c) => `<option value="${c.id}">${c.nombre}</option>`).join('');
  }
  function poblarSelectTipos(select) {
    select.innerHTML = db.tiposMantencion.map((t) => `<option value="${t.id}">${t.nombre}</option>`).join('');
  }
  function poblarSelectSectores(select, incluirVacio) {
    select.innerHTML = (incluirVacio ? '<option value="">Sin sector (administrador)</option>' : '') + db.sectores.map((s) => `<option value="${s.id}">${s.nombre}</option>`).join('');
  }

  function renderPiscinasFormulario(clienteId, seleccionadas) {
    const idsExistentes = new Set();
    db.contratos.filter((c) => c.clienteId === clienteId).forEach((c) => c.piscinaIds.forEach((id) => idsExistentes.add(id)));
    const piscinasCliente = db.piscinas.filter((p) => idsExistentes.has(p.id)).concat(piscinasNuevasTemp);
    const cont = U.$('#ct-piscinas-lista');
    if (piscinasCliente.length === 0) {
      cont.innerHTML = '<p class="text-sm text-suave">Este cliente aún no tiene piscinas registradas. Agrega una nueva abajo.</p>';
      return;
    }
    cont.innerHTML = piscinasCliente.map((p) => `
      <label class="flex-center gap-8" style="padding:6px 0;">
        <input type="checkbox" value="${p.id}" ${seleccionadas.includes(p.id) ? 'checked' : ''} style="width:auto;">
        ${p.alias} — ${p.comuna} (${p.volumenM3} m³)
      </label>`).join('');
    cont.querySelectorAll('input[type=checkbox]').forEach((cb) => cb.addEventListener('change', actualizarPrecioPreview));
  }

  function actualizarPrecioPreview() {
    const base = parseFloat(U.$('#ct-precio').value) || 0;
    const n = U.$all('#ct-piscinas-lista input[type=checkbox]:checked').length || 1;
    const fechaInicio = U.$('#ct-fecha-inicio').value || U.toISODate(new Date());
    const contratoTemp = { precioBase: base, fechaUltimoReajuste: fechaInicio };
    const vigente = App.Pricing.precioVigente(contratoTemp, n, new Date());
    U.$('#ct-precio-preview').textContent = U.formatCLP(vigente);
  }

  function abrirModalContrato(contratoId) {
    db = App.DB.cargar();
    piscinasNuevasTemp = [];
    const contrato = contratoId ? db.contratos.find((c) => c.id === contratoId) : null;
    U.$('#modal-contrato-titulo').textContent = contrato ? 'Editar contrato' : 'Nuevo contrato';
    U.$('#ct-id').value = contrato ? contrato.id : '';
    poblarSelectClientes(U.$('#ct-cliente'));
    poblarSelectTipos(U.$('#ct-tipo'));

    if (contrato) {
      U.$('#ct-cliente').value = contrato.clienteId;
      U.$('#ct-frecuencia').value = contrato.frecuencia;
      U.$('#ct-tipo').value = contrato.tipoMantencionId;
      U.$('#ct-precio').value = contrato.precioBase;
      U.$('#ct-fecha-inicio').value = contrato.fechaInicio;
      U.$('#ct-fecha-termino').value = contrato.fechaTermino || '';
      U.$('#ct-estado').value = contrato.estado;
      renderPiscinasFormulario(contrato.clienteId, contrato.piscinaIds);
    } else {
      U.$('#ct-frecuencia').value = 'semanal';
      U.$('#ct-precio').value = 30000;
      U.$('#ct-fecha-inicio').value = U.toISODate(new Date());
      U.$('#ct-fecha-termino').value = '';
      U.$('#ct-estado').value = 'activo';
      renderPiscinasFormulario(U.$('#ct-cliente').value, []);
    }
    actualizarPrecioPreview();
    U.modalAbrir('modal-contrato');
  }

  U.$('#btn-nuevo-contrato').addEventListener('click', () => abrirModalContrato(null));
  U.$('#ct-cliente').addEventListener('change', () => { piscinasNuevasTemp = []; renderPiscinasFormulario(U.$('#ct-cliente').value, []); actualizarPrecioPreview(); });
  U.$('#ct-precio').addEventListener('input', actualizarPrecioPreview);
  U.$('#ct-fecha-inicio').addEventListener('change', actualizarPrecioPreview);

  U.$('#ct-btn-add-piscina').addEventListener('click', () => {
    const alias = prompt('Nombre / alias de la piscina (ej: "Piscina patio trasero"):');
    if (!alias) return;
    const direccion = prompt('Dirección:', db.clientes.find((c) => c.id === U.$('#ct-cliente').value)?.direccion || '') || '';
    const comuna = prompt('Comuna:', db.clientes.find((c) => c.id === U.$('#ct-cliente').value)?.comuna || '') || '';
    const volumen = parseFloat(prompt('Volumen aproximado (m³):', '40')) || 40;
    const sectorMasCercano = db.sectores.find((s) => s.comunas.includes(comuna)) || db.sectores[0];
    const nueva = { id: U.uid('pis'), alias, direccion, comuna, sectorId: sectorMasCercano.id, volumenM3: volumen };
    piscinasNuevasTemp.push(nueva);
    renderPiscinasFormulario(U.$('#ct-cliente').value, piscinasNuevasTemp.map((p) => p.id));
    U.$all('#ct-piscinas-lista input[type=checkbox]').forEach((cb) => {
      if (piscinasNuevasTemp.find((p) => p.id === cb.value)) cb.checked = true;
    });
    actualizarPrecioPreview();
  });

  U.$('#form-contrato').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = U.$('#ct-id').value;
    const clienteId = U.$('#ct-cliente').value;
    const seleccionadas = U.$all('#ct-piscinas-lista input[type=checkbox]:checked').map((cb) => cb.value);
    if (!clienteId) { U.toast('Selecciona un cliente.', 'error'); return; }
    if (seleccionadas.length === 0) { U.toast('Selecciona al menos una piscina.', 'error'); return; }

    db = App.DB.cargar();
    piscinasNuevasTemp.forEach((p) => { if (!db.piscinas.find((x) => x.id === p.id)) db.piscinas.push(p); });

    const datos = {
      clienteId,
      piscinaIds: seleccionadas,
      frecuencia: U.$('#ct-frecuencia').value,
      tipoMantencionId: U.$('#ct-tipo').value,
      precioBase: parseFloat(U.$('#ct-precio').value),
      fechaInicio: U.$('#ct-fecha-inicio').value,
      fechaTermino: U.$('#ct-fecha-termino').value || null,
      estado: U.$('#ct-estado').value,
    };

    if (id) {
      const contrato = db.contratos.find((c) => c.id === id);
      Object.assign(contrato, datos);
      db.auditLog.unshift(crearAudit('Edición de contrato', 'Contrato', id, `Contrato de ${nombreCliente(clienteId)} actualizado`));
      U.toast('Contrato actualizado.', 'success');
    } else {
      const nuevo = { id: U.uid('ct'), fechaUltimoReajuste: datos.fechaInicio, ...datos };
      db.contratos.push(nuevo);
      db.auditLog.unshift(crearAudit('Creación de contrato', 'Contrato', nuevo.id, `Nuevo contrato para ${nombreCliente(clienteId)}`));
      U.toast('Contrato creado.', 'success');
    }
    App.DB.guardar(db);
    U.modalCerrar('modal-contrato');
    renderSeccion('contratos');
  });

  // ---------------------------------------------------------------------
  // Clientes
  // ---------------------------------------------------------------------
  function renderClientes() {
    U.$('#tbody-clientes').innerHTML = db.clientes.map((c) => `
      <tr>
        <td><strong>${c.nombre}</strong><br><span class="text-sm celda-suave">${c.tipo} · ${c.tamano}</span></td>
        <td>${c.rut}</td>
        <td>${c.tipo}</td>
        <td>${c.comuna}</td>
        <td class="text-sm">${c.email}<br>${c.telefono}</td>
        <td><span class="badge ${c.activo ? 'badge-activo' : 'badge-inactivo'}">${c.activo ? 'Activo' : 'Inactivo'}</span></td>
        <td class="flex gap-8">
          <button class="btn btn-outline btn-sm" data-editar-cliente="${c.id}">Editar</button>
          <button class="btn ${c.activo ? 'btn-danger' : 'btn-secondary'} btn-sm" data-toggle-cliente="${c.id}">${c.activo ? 'Desactivar' : 'Activar'}</button>
        </td>
      </tr>`).join('');

    U.$all('[data-editar-cliente]').forEach((b) => b.addEventListener('click', () => abrirModalCliente(b.dataset.editarCliente)));
    U.$all('[data-toggle-cliente]').forEach((b) => b.addEventListener('click', () => {
      db = App.DB.cargar();
      const c = db.clientes.find((x) => x.id === b.dataset.toggleCliente);
      c.activo = !c.activo;
      App.DB.guardar(db);
      U.toast(`Cliente ${c.activo ? 'activado' : 'desactivado'}.`, 'success');
      renderClientes();
    }));
  }

  function abrirModalCliente(id) {
    db = App.DB.cargar();
    const c = id ? db.clientes.find((x) => x.id === id) : null;
    U.$('#modal-cliente-titulo').textContent = c ? 'Editar cliente' : 'Nuevo cliente';
    U.$('#cl-id').value = c ? c.id : '';
    U.$('#cl-nombre').value = c ? c.nombre : '';
    U.$('#cl-rut').value = c ? c.rut : '';
    U.$('#cl-tipo').value = c ? c.tipo : 'Particular';
    U.$('#cl-tamano').value = c ? c.tamano : 'Pequeña';
    U.$('#cl-comuna').value = c ? c.comuna : '';
    U.$('#cl-direccion').value = c ? c.direccion : '';
    U.$('#cl-email').value = c ? c.email : '';
    U.$('#cl-telefono').value = c ? c.telefono : '';
    U.$('#cl-activo').checked = c ? c.activo : true;
    U.$('#cl-error').style.display = 'none';
    U.modalAbrir('modal-cliente');
  }

  U.$('#btn-nuevo-cliente').addEventListener('click', () => abrirModalCliente(null));
  U.$('#form-cliente').addEventListener('submit', (e) => {
    e.preventDefault();
    db = App.DB.cargar();
    const id = U.$('#cl-id').value;
    const rut = U.$('#cl-rut').value.trim();
    const email = U.$('#cl-email').value.trim().toLowerCase();
    const dupRut = db.clientes.find((c) => c.rut === rut && c.id !== id);
    const dupEmail = db.usuarios.find((u) => u.email.toLowerCase() === email && (!id || db.clientes.find((c) => c.id === id)?.userId !== u.id));
    const errEl = U.$('#cl-error');
    if (dupRut) { errEl.textContent = 'Ya existe un cliente con ese RUT.'; errEl.style.display = 'block'; return; }
    if (dupEmail) { errEl.textContent = 'Ya existe una cuenta con ese correo.'; errEl.style.display = 'block'; return; }
    errEl.style.display = 'none';

    const datos = {
      nombre: U.$('#cl-nombre').value, rut, tipo: U.$('#cl-tipo').value, tamano: U.$('#cl-tamano').value,
      comuna: U.$('#cl-comuna').value, direccion: U.$('#cl-direccion').value, email, telefono: U.$('#cl-telefono').value,
      activo: U.$('#cl-activo').checked,
    };

    if (id) {
      const cliente = db.clientes.find((c) => c.id === id);
      Object.assign(cliente, datos);
      const userCliente = db.usuarios.find((u) => u.id === cliente.userId);
      if (userCliente) { userCliente.nombre = datos.nombre; userCliente.email = email; }
      U.toast('Cliente actualizado.', 'success');
    } else {
      const nuevoId = U.uid('cli');
      const nuevoUserId = U.uid('u');
      db.clientes.push({ id: nuevoId, userId: nuevoUserId, ...datos });
      db.usuarios.push({ id: nuevoUserId, nombre: datos.nombre, email, password: 'cliente123', rol: 'cliente', refId: nuevoId });
      U.toast('Cliente creado. Contraseña inicial: cliente123', 'success');
    }
    App.DB.guardar(db);
    U.modalCerrar('modal-cliente');
    renderClientes();
  });

  // ---------------------------------------------------------------------
  // Personal
  // ---------------------------------------------------------------------
  function renderPersonal() {
    U.$('#tbody-personal').innerHTML = db.empleados.map((emp) => `
      <tr>
        <td><strong>${emp.nombre}</strong></td>
        <td>${emp.rut}</td>
        <td>${U.capitalize(emp.cargo)}</td>
        <td>${emp.sectorId ? sectorNombre(emp.sectorId) : '—'}</td>
        <td><span class="badge ${emp.activo ? 'badge-activo' : 'badge-inactivo'}">${emp.activo ? 'Activo' : 'Inactivo'}</span></td>
        <td class="flex gap-8">
          <button class="btn btn-outline btn-sm" data-editar-personal="${emp.id}">Editar</button>
          <button class="btn ${emp.activo ? 'btn-danger' : 'btn-secondary'} btn-sm" data-toggle-personal="${emp.id}">${emp.activo ? 'Desactivar' : 'Activar'}</button>
        </td>
      </tr>`).join('');

    U.$all('[data-editar-personal]').forEach((b) => b.addEventListener('click', () => abrirModalPersonal(b.dataset.editarPersonal)));
    U.$all('[data-toggle-personal]').forEach((b) => b.addEventListener('click', () => {
      db = App.DB.cargar();
      const emp = db.empleados.find((x) => x.id === b.dataset.togglePersonal);
      emp.activo = !emp.activo;
      App.DB.guardar(db);
      U.toast(`${emp.nombre} ${emp.activo ? 'activado' : 'desactivado'}.`, 'success');
      renderPersonal();
    }));
  }

  function abrirModalPersonal(id) {
    db = App.DB.cargar();
    const emp = id ? db.empleados.find((x) => x.id === id) : null;
    U.$('#modal-personal-titulo').textContent = emp ? 'Editar integrante' : 'Nuevo integrante';
    U.$('#pe-id').value = emp ? emp.id : '';
    U.$('#pe-nombre').value = emp ? emp.nombre : '';
    U.$('#pe-rut').value = emp ? emp.rut : '';
    U.$('#pe-cargo').value = emp ? emp.cargo : 'tecnico';
    poblarSelectSectores(U.$('#pe-sector'), true);
    U.$('#pe-sector').value = emp && emp.sectorId ? emp.sectorId : '';
    const userEmp = emp ? db.usuarios.find((u) => u.id === emp.userId) : null;
    U.$('#pe-email').value = userEmp ? userEmp.email : '';
    U.$('#pe-activo').checked = emp ? emp.activo : true;
    U.$('#pe-error').style.display = 'none';
    U.modalAbrir('modal-personal');
  }

  U.$('#btn-nuevo-personal').addEventListener('click', () => abrirModalPersonal(null));
  U.$('#form-personal').addEventListener('submit', (e) => {
    e.preventDefault();
    db = App.DB.cargar();
    const id = U.$('#pe-id').value;
    const rut = U.$('#pe-rut').value.trim();
    const email = U.$('#pe-email').value.trim().toLowerCase();
    const dupRut = db.empleados.find((emp) => emp.rut === rut && emp.id !== id);
    const dupEmail = db.usuarios.find((u) => u.email.toLowerCase() === email && (!id || db.empleados.find((emp) => emp.id === id)?.userId !== u.id));
    const errEl = U.$('#pe-error');
    if (dupRut) { errEl.textContent = 'Ya existe un integrante con ese RUT.'; errEl.style.display = 'block'; return; }
    if (dupEmail) { errEl.textContent = 'Ya existe una cuenta con ese correo.'; errEl.style.display = 'block'; return; }
    errEl.style.display = 'none';

    const cargo = U.$('#pe-cargo').value;
    const datos = { nombre: U.$('#pe-nombre').value, rut, cargo, sectorId: cargo === 'administrador' ? null : (U.$('#pe-sector').value || null), activo: U.$('#pe-activo').checked };

    if (id) {
      const emp = db.empleados.find((x) => x.id === id);
      Object.assign(emp, datos);
      const userEmp = db.usuarios.find((u) => u.id === emp.userId);
      if (userEmp) { userEmp.nombre = datos.nombre; userEmp.email = email; userEmp.rol = cargo; }
      U.toast('Integrante actualizado.', 'success');
    } else {
      const nuevoId = U.uid('emp');
      const nuevoUserId = U.uid('u');
      db.empleados.push({ id: nuevoId, userId: nuevoUserId, ...datos });
      db.usuarios.push({ id: nuevoUserId, nombre: datos.nombre, email, password: cargo + '123', rol: cargo, refId: nuevoId });
      U.toast(`Integrante creado. Contraseña inicial: ${cargo}123`, 'success');
    }
    App.DB.guardar(db);
    U.modalCerrar('modal-personal');
    renderPersonal();
  });

  // ---------------------------------------------------------------------
  // Turnos
  // ---------------------------------------------------------------------
  function renderTurnos() {
    U.$('#tbody-turnos').innerHTML = db.turnos.map((t) => `
      <tr>
        <td>${nombreEmpleado(t.empleadoId)}</td>
        <td>${sectorNombre(t.sectorId)}</td>
        <td>${U.formatDateEs(t.fechaInicio)}</td>
        <td>${U.formatDateEs(t.fechaFin)}</td>
        <td>${U.capitalize(t.estacion || '-')}</td>
        <td><button class="btn btn-danger btn-sm" data-eliminar-turno="${t.id}">Eliminar</button></td>
      </tr>`).join('') || '<tr><td colspan="6" class="empty-state">Sin turnos asignados.</td></tr>';

    U.$all('[data-eliminar-turno]').forEach((b) => b.addEventListener('click', () => {
      if (!confirm('¿Eliminar este turno?')) return;
      db = App.DB.cargar();
      const t = db.turnos.find((x) => x.id === b.dataset.eliminarTurno);
      db.turnos = db.turnos.filter((x) => x.id !== t.id);
      db.auditLog.unshift(crearAudit('Eliminación de turno', 'Turno', t.id, `Turno de ${nombreEmpleado(t.empleadoId)} en ${sectorNombre(t.sectorId)} eliminado`));
      App.DB.guardar(db);
      renderTurnos();
    }));
  }

  function abrirModalTurno() {
    db = App.DB.cargar();
    const selEmp = U.$('#tu-empleado');
    selEmp.innerHTML = db.empleados.filter((e) => e.cargo !== 'administrador').map((e) => `<option value="${e.id}">${e.nombre} (${U.capitalize(e.cargo)})</option>`).join('');
    poblarSelectSectores(U.$('#tu-sector'), false);
    U.$('#tu-desde').value = U.toISODate(new Date());
    U.$('#tu-hasta').value = U.toISODate(U.addDays(new Date(), 90));
    U.$('#tu-error').style.display = 'none';
    U.modalAbrir('modal-turno');
  }

  U.$('#btn-nuevo-turno').addEventListener('click', abrirModalTurno);
  U.$('#form-turno').addEventListener('submit', (e) => {
    e.preventDefault();
    db = App.DB.cargar();
    const empleadoId = U.$('#tu-empleado').value;
    const desde = U.$('#tu-desde').value;
    const hasta = U.$('#tu-hasta').value;
    const errEl = U.$('#tu-error');
    if (hasta < desde) { errEl.textContent = 'La fecha de término no puede ser anterior a la de inicio.'; errEl.style.display = 'block'; return; }

    const conflicto = db.turnos.find((t) => t.empleadoId === empleadoId && !(hasta < t.fechaInicio || desde > t.fechaFin));
    if (conflicto) {
      errEl.textContent = `Conflicto: ${nombreEmpleado(empleadoId)} ya tiene un turno en ${sectorNombre(conflicto.sectorId)} entre ${U.formatDateEs(conflicto.fechaInicio)} y ${U.formatDateEs(conflicto.fechaFin)}.`;
      errEl.style.display = 'block';
      return;
    }
    errEl.style.display = 'none';

    const nuevo = { id: U.uid('tur'), empleadoId, sectorId: U.$('#tu-sector').value, fechaInicio: desde, fechaFin: hasta, estacion: U.$('#tu-estacion').value };
    db.turnos.push(nuevo);
    db.auditLog.unshift(crearAudit('Asignación de turno', 'Turno', nuevo.id, `${nombreEmpleado(empleadoId)} asignado a ${sectorNombre(nuevo.sectorId)}`));
    App.DB.guardar(db);
    U.toast('Turno asignado.', 'success');
    U.modalCerrar('modal-turno');
    renderTurnos();
  });

  // ---------------------------------------------------------------------
  // Facturación
  // ---------------------------------------------------------------------
  function renderFacturacion() {
    const ordenadas = db.facturas.slice().sort((a, b) => (b.anio - a.anio) || (b.mes - a.mes));
    U.$('#tbody-facturas').innerHTML = ordenadas.map((f) => `
      <tr>
        <td>${String(f.mes).padStart(2, '0')}/${f.anio}</td>
        <td>${nombreCliente(f.clienteId)}</td>
        <td>${U.formatCLP(f.montoTotal)}</td>
        <td><span class="badge ${f.estado === 'pagada' ? 'badge-activo' : f.estado === 'anulada' ? 'badge-inactivo' : 'badge-en-curso'}">${U.capitalize(f.estado)}</span></td>
        <td class="flex gap-8">
          <button class="btn btn-outline btn-sm" data-ver-factura="${f.id}">Ver boleta</button>
          ${f.estado !== 'pagada' ? `<button class="btn btn-secondary btn-sm" data-pagar-factura="${f.id}">Marcar pagada</button>` : ''}
        </td>
      </tr>`).join('') || '<tr><td colspan="5" class="empty-state">Aún no se ha generado facturación.</td></tr>';

    U.$all('[data-ver-factura]').forEach((b) => b.addEventListener('click', () => verBoleta(b.dataset.verFactura)));
    U.$all('[data-pagar-factura]').forEach((b) => b.addEventListener('click', () => {
      db = App.DB.cargar();
      const f = db.facturas.find((x) => x.id === b.dataset.pagarFactura);
      f.estado = 'pagada';
      App.DB.guardar(db);
      U.toast('Factura marcada como pagada.', 'success');
      renderFacturacion();
    }));
  }

  function verBoleta(facturaId) {
    db = App.DB.cargar();
    const f = db.facturas.find((x) => x.id === facturaId);
    const cliente = db.clientes.find((c) => c.id === f.clienteId);
    const detalles = db.facturaDetalles.filter((d) => d.facturaId === f.id);
    const filasHtml = detalles.map((d) => `<tr><td>${d.descripcion}</td><td>${U.formatCLP(d.monto)}</td></tr>`).join('');
    abrirImpresion('Boleta', `
      <h2>Piscinas Verano Perfecto</h2>
      <p class="text-suave">Boleta de servicios de mantención — Periodo ${String(f.mes).padStart(2, '0')}/${f.anio}</p>
      <div class="divider"></div>
      <p><strong>${cliente.nombre}</strong><br>RUT: ${cliente.rut}<br>${cliente.direccion}, ${cliente.comuna}</p>
      <div class="divider"></div>
      <table class="tabla"><thead><tr><th>Detalle</th><th>Monto</th></tr></thead><tbody>${filasHtml}</tbody></table>
      <div class="divider"></div>
      <p style="font-size:1.2rem;font-weight:800;text-align:right;">Total: ${U.formatCLP(f.montoTotal)}</p>
      <p class="text-sm text-suave">Estado: ${U.capitalize(f.estado)} · Generada ${U.formatDateTimeEs(f.generadaEn)}</p>`);
  }

  U.$('#btn-generar-facturacion').addEventListener('click', () => {
    db = App.DB.cargar();
    const hoy = new Date();
    const mes = hoy.getMonth() + 1, anio = hoy.getFullYear();
    let generadas = 0;
    db.contratos.filter((c) => c.estado === 'activo').forEach((contrato) => {
      if (db.facturas.some((f) => f.contratoId === contrato.id && f.mes === mes && f.anio === anio)) return;
      const visitasPeriodo = db.visitas.filter((v) => {
        if (v.contratoId !== contrato.id || v.estado !== 'efectuada') return false;
        const f = new Date(v.fechaProgramada);
        return f.getMonth() + 1 === mes && f.getFullYear() === anio;
      });
      if (visitasPeriodo.length === 0) return;
      const montoTotal = visitasPeriodo.reduce((a, v) => a + v.precioVisita, 0);
      const factura = { id: U.uid('fac'), contratoId: contrato.id, clienteId: contrato.clienteId, mes, anio, montoTotal, estado: 'emitida', generadaEn: new Date().toISOString() };
      db.facturas.push(factura);
      visitasPeriodo.forEach((v) => db.facturaDetalles.push({ id: U.uid('fd'), facturaId: factura.id, visitaId: v.id, monto: v.precioVisita, descripcion: 'Visita de mantención ' + U.formatDateEs(v.fechaProgramada) }));
      generadas++;
    });
    App.DB.guardar(db);
    U.toast(generadas > 0 ? `Se generaron ${generadas} factura(s) del mes actual.` : 'No hay facturas nuevas que generar (ya emitidas o sin visitas efectuadas este mes).', generadas > 0 ? 'success' : 'info');
    renderFacturacion();
  });

  // ---------------------------------------------------------------------
  // Incidencias
  // ---------------------------------------------------------------------
  function renderIncidencias() {
    let lista = db.incidencias.slice();
    if (esSupervisor) {
      lista = lista.filter((i) => {
        const v = db.visitas.find((v) => v.id === i.visitaId);
        return v && visitaEnSectorPermitido(v);
      });
    }
    U.$('#tbody-incidencias').innerHTML = lista.map((i) => `
      <tr>
        <td>${i.fotoDataUrl ? `<img src="${i.fotoDataUrl}" style="width:46px;height:46px;object-fit:cover;border-radius:8px;">` : '📷'}</td>
        <td class="text-sm">${visitaResumen(i.visitaId)}</td>
        <td>${nombreEmpleado(i.empleadoId)}</td>
        <td class="text-sm">${i.descripcion}</td>
        <td class="text-sm">${U.formatDateTimeEs(i.creada)}</td>
        <td><span class="badge ${i.estado === 'resuelta' ? 'badge-activo' : i.estado === 'en_gestion' ? 'badge-en-curso' : 'badge-inactivo'}">${etiquetaIncidencia(i.estado)}</span></td>
        <td><button class="btn btn-outline btn-sm" data-ver-incidencia="${i.id}">Ver</button></td>
      </tr>`).join('') || '<tr><td colspan="7" class="empty-state">No hay incidencias registradas.</td></tr>';

    U.$all('[data-ver-incidencia]').forEach((b) => b.addEventListener('click', () => abrirIncidencia(b.dataset.verIncidencia)));
  }

  function visitaResumen(visitaId) {
    const v = db.visitas.find((v) => v.id === visitaId);
    if (!v) return '—';
    const p = piscina(v.piscinaId);
    return `${p ? p.alias : ''} · ${U.formatDateEs(v.fechaProgramada)}`;
  }
  function etiquetaIncidencia(estado) {
    return { reportada: 'Reportada', en_gestion: 'En gestión', resuelta: 'Resuelta' }[estado] || estado;
  }

  function abrirIncidencia(id) {
    db = App.DB.cargar();
    const inc = db.incidencias.find((x) => x.id === id);
    U.$('#incidencia-cuerpo').innerHTML = `
      <p><strong>${visitaResumen(inc.visitaId)}</strong></p>
      <p class="text-sm text-suave">Reportada por ${nombreEmpleado(inc.empleadoId)} · ${U.formatDateTimeEs(inc.creada)}</p>
      <p class="mt-12">${inc.descripcion}</p>
      ${inc.fotoDataUrl ? `<img src="${inc.fotoDataUrl}" class="upload-preview">` : '<p class="text-sm text-suave">Sin foto adjunta.</p>'}
      <div class="form-group mt-16">
        <label>Estado</label>
        <select class="input" id="inc-estado">
          <option value="reportada" ${inc.estado === 'reportada' ? 'selected' : ''}>Reportada</option>
          <option value="en_gestion" ${inc.estado === 'en_gestion' ? 'selected' : ''}>En gestión</option>
          <option value="resuelta" ${inc.estado === 'resuelta' ? 'selected' : ''}>Resuelta</option>
        </select>
      </div>
      <button class="btn btn-primary btn-block" id="btn-guardar-incidencia">Guardar estado</button>`;
    U.modalAbrir('modal-incidencia');
    document.getElementById('btn-guardar-incidencia').addEventListener('click', () => {
      db = App.DB.cargar();
      const incidencia = db.incidencias.find((x) => x.id === id);
      incidencia.estado = document.getElementById('inc-estado').value;
      App.DB.guardar(db);
      U.toast('Incidencia actualizada.', 'success');
      U.modalCerrar('modal-incidencia');
      renderIncidencias();
    });
  }

  // ---------------------------------------------------------------------
  // Notificaciones (consumo del patrón Observer)
  // ---------------------------------------------------------------------
  function actualizarNotificaciones() {
    db = App.DB.cargar();
    const propias = db.notificaciones.filter((n) => (
      esSupervisor ? (n.destinatarioRol === 'supervisor' && n.destinatarioEmpleadoId === (empleadoActual && empleadoActual.id))
        : n.destinatarioRol === 'administrador'
    ));
    const sinLeer = propias.filter((n) => !n.leida).length;
    U.$('#notif-dot').style.display = sinLeer > 0 ? 'block' : 'none';
    U.$('#panel-notif').innerHTML = propias.slice(0, 15).map((n) => `
      <div class="notif-item ${n.leida ? 'leida' : ''}">${n.mensaje}<br><span class="text-suave">${U.formatDateTimeEs(n.creada)}</span></div>
    `).join('') || '<div class="notif-item">Sin notificaciones.</div>';
  }

  U.$('#btn-notif').addEventListener('click', (e) => {
    e.stopPropagation();
    const panel = U.$('#panel-notif');
    const abrir = panel.style.display === 'none';
    panel.style.display = abrir ? 'block' : 'none';
    if (abrir) {
      db = App.DB.cargar();
      db.notificaciones.forEach((n) => {
        if (esSupervisor ? (n.destinatarioRol === 'supervisor' && n.destinatarioEmpleadoId === (empleadoActual && empleadoActual.id)) : n.destinatarioRol === 'administrador') n.leida = true;
      });
      App.DB.guardar(db);
      actualizarNotificaciones();
    }
  });
  // Cierra el panel de notificaciones al hacer clic fuera de él, como
  // cualquier dropdown estándar (si no, queda flotando y tapa la página).
  document.addEventListener('click', (e) => {
    const panel = U.$('#panel-notif');
    if (panel.style.display !== 'none' && !panel.contains(e.target) && e.target.id !== 'btn-notif') {
      panel.style.display = 'none';
    }
  });

  // ---------------------------------------------------------------------
  // Arranque + actualización en vivo (simula wire:poll / Echo)
  // ---------------------------------------------------------------------
  aplicarVisibilidadNav();
  mostrarSeccion('dashboard');

  window.addEventListener('storage', () => renderSeccion(seccionActual));
  window.addEventListener('pvp:db-actualizada', () => renderSeccion(seccionActual));
  setInterval(() => renderSeccion(seccionActual), 8000);
})();
