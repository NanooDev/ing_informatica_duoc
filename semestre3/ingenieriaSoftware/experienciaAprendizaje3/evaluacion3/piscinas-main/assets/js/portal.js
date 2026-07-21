/*
 * Lógica del Portal de Cliente.
 */
(function () {
  const usuario = App.Auth.requerirRol(['cliente']);
  if (!usuario) return;

  const U = App.Utils;
  let db = App.DB.cargar();
  const cliente = db.clientes.find((c) => c.id === usuario.refId);
  let paginaHistorial = 1;
  const FILAS_POR_PAGINA = 8;
  let estrellasSeleccionadas = 5;

  U.$('#pf-cliente-nombre').textContent = cliente.nombre;
  U.$('#pf-saludo').textContent = `¡Bienvenido, ${cliente.nombre.split(' ')[0] || cliente.nombre}! 👋`;
  U.$('#pf-avatar').textContent = U.inicialesNombre(cliente.nombre);
  U.$('#pf-avatar').classList.add(...U.claseAvatar(cliente.nombre).split(' ').slice(1));
  U.$('#btn-logout-portal').addEventListener('click', (e) => { e.preventDefault(); App.Auth.cerrarSesion(); window.location.href = 'index.html'; });

  function piscina(id) { return db.piscinas.find((p) => p.id === id); }
  function misContratos() { return db.contratos.filter((c) => c.clienteId === cliente.id); }
  function misVisitas() {
    const ids = misContratos().map((c) => c.id);
    return db.visitas.filter((v) => ids.includes(v.contratoId));
  }

  function renderTodo() {
    db = App.DB.cargar();
    renderEstadoPago();
    renderProximaVisita();
    renderPlan();
    renderHistorial();
    renderFacturas();
  }

  // ---------------- Estado de pago ----------------
  function renderEstadoPago() {
    const misFacturas = db.facturas.filter((f) => f.clienteId === cliente.id);
    const pendiente = misFacturas.some((f) => f.estado === 'pendiente');
    U.$('#pf-badge-pago').textContent = pendiente ? 'Pago pendiente' : 'Pagos al día';
    U.$('#pf-badge-pago').className = 'badge ' + (pendiente ? 'badge-inactivo' : 'badge-activo');
    U.$('#pf-estado-pago').textContent = pendiente
      ? 'Tienes una boleta pendiente de pago. Revisa la sección de boletas más abajo.'
      : 'Todo en orden, no tienes pagos pendientes.';
  }

  // ---------------- Próxima visita ----------------
  function renderProximaVisita() {
    const hoyIso = U.toISODate(new Date());
    const proximas = misVisitas()
      .filter((v) => v.estado === 'pendiente' && v.fechaProgramada >= hoyIso)
      .sort((a, b) => a.fechaProgramada.localeCompare(b.fechaProgramada) || a.horaProgramada.localeCompare(b.horaProgramada));
    const v = proximas[0];
    if (!v) {
      U.$('#pf-proxima-visita').innerHTML = '<p class="text-suave">No tienes visitas programadas próximamente.</p>';
      return;
    }
    const p = piscina(v.piscinaId);
    U.$('#pf-proxima-visita').innerHTML = `
      <p style="font-size:1.3rem;font-weight:800;color:var(--azul-700);">${U.formatDateEs(v.fechaProgramada)}</p>
      <p>${v.horaProgramada} hrs · ${p ? p.alias : ''}</p>
      <p class="text-sm text-suave">${p ? p.direccion + ', ' + p.comuna : ''}</p>
      ${v.solicitudReagendamiento
        ? '<p class="badge badge-info mt-8">Solicitud de reagendamiento enviada</p>'
        : `<button class="btn btn-outline btn-sm mt-12" id="btn-solicitar-reagendar" data-visita="${v.id}">📅 Solicitar reagendamiento</button>`}`;

    const btn = document.getElementById('btn-solicitar-reagendar');
    if (btn) btn.addEventListener('click', () => abrirReagendar(v.id));
  }

  function abrirReagendar(visitaId) {
    const v = db.visitas.find((x) => x.id === visitaId);
    const p = piscina(v.piscinaId);
    U.$('#rp-visita-id').value = visitaId;
    U.$('#rp-visita-resumen').textContent = `${U.formatDateEs(v.fechaProgramada)} · ${p ? p.alias : ''}`;
    U.$('#rp-motivo').value = '';
    U.modalAbrir('modal-reagendar-portal');
  }

  U.$('#form-reagendar-portal').addEventListener('submit', (e) => {
    e.preventDefault();
    const motivo = U.$('#rp-motivo').value.trim();
    if (!motivo) return;
    db = App.DB.cargar();
    const v = db.visitas.find((x) => x.id === U.$('#rp-visita-id').value);
    v.solicitudReagendamiento = { motivo, fecha: new Date().toISOString() };
    db.notificaciones.unshift({
      id: U.uid('not'), destinatarioRol: 'administrador', tipo: 'SOLICITUD_REAGENDAMIENTO',
      mensaje: `${cliente.nombre} solicitó reagendar su visita del ${U.formatDateEs(v.fechaProgramada)}. Motivo: ${motivo}`,
      visitaId: v.id, leida: false, creada: new Date().toISOString(),
    });
    App.DB.guardar(db);
    U.modalCerrar('modal-reagendar-portal');
    U.toast('Solicitud enviada a administración.', 'success');
    renderTodo();
  });

  // ---------------- Plan contratado ----------------
  function renderPlan() {
    const contratosActivos = misContratos().filter((c) => c.estado === 'activo');
    if (contratosActivos.length === 0) {
      U.$('#pf-plan').innerHTML = '<p class="text-suave">No tienes contratos activos.</p>';
      return;
    }
    U.$('#pf-plan').innerHTML = contratosActivos.map((c) => {
      const tm = db.tiposMantencion.find((t) => t.id === c.tipoMantencionId);
      const precio = App.Pricing.precioVigente(c, c.piscinaIds.length);
      const piscinasNombres = c.piscinaIds.map((id) => piscina(id)).filter(Boolean).map((p) => p.alias).join(', ');
      return `<div class="mb-12">
        <p><strong>${tm ? tm.nombre : ''}</strong> · ${U.capitalize(c.frecuencia)}</p>
        <p class="text-sm text-suave">${piscinasNombres}</p>
        <p class="text-sm">${U.formatCLP(precio)} por visita</p>
      </div>`;
    }).join('<div class="divider"></div>');
  }

  // ---------------- Historial ----------------
  function renderHistorial() {
    const desde = U.$('#filtro-desde').value;
    const hasta = U.$('#filtro-hasta').value;
    let visitas = misVisitas()
      .filter((v) => v.estado !== 'pendiente')
      .filter((v) => (!desde || v.fechaProgramada >= desde) && (!hasta || v.fechaProgramada <= hasta))
      .sort((a, b) => b.fechaProgramada.localeCompare(a.fechaProgramada));

    const totalPaginas = Math.max(1, Math.ceil(visitas.length / FILAS_POR_PAGINA));
    paginaHistorial = Math.min(paginaHistorial, totalPaginas);
    const inicio = (paginaHistorial - 1) * FILAS_POR_PAGINA;
    const pagina = visitas.slice(inicio, inicio + FILAS_POR_PAGINA);

    U.$('#tbody-historial').innerHTML = pagina.map((v) => {
      const p = piscina(v.piscinaId);
      const tecnico = db.empleados.find((e) => e.id === v.empleadoId);
      const cal = v.calificacionId ? db.calificaciones.find((c) => c.id === v.calificacionId) : null;
      let colCalificacion = '—';
      if (v.estado === 'efectuada') {
        colCalificacion = cal
          ? `<span class="estrellas">${U.estrellas(cal.estrellas)}</span>`
          : `<button class="btn btn-secondary btn-sm" data-calificar="${v.id}">Calificar</button>`;
      }
      const tecnicoCelda = tecnico
        ? `<div class="flex-center gap-8"><div class="${U.claseAvatar(tecnico.nombre)} avatar-xs">${U.inicialesNombre(tecnico.nombre)}</div>${tecnico.nombre}</div>`
        : '—';
      return `<tr>
        <td>${U.formatDateEs(v.fechaProgramada)}</td>
        <td>${p ? p.alias : '—'}</td>
        <td>${tecnicoCelda}</td>
        <td>${v.parametrosQuimicos ? `pH ${v.parametrosQuimicos.ph} / ${v.parametrosQuimicos.cloro} ppm` : '—'}</td>
        <td><span class="${U.badgeEstadoVisita(v.estado)}">${U.labelEstadoVisita(v.estado)}</span></td>
        <td>${colCalificacion}</td>
      </tr>`;
    }).join('') || '<tr><td colspan="6" class="empty-state">No hay mantenciones en el rango seleccionado.</td></tr>';

    U.$('#pag-historial').innerHTML = `Página ${paginaHistorial} de ${totalPaginas} (${visitas.length} registros)
      <button class="btn btn-outline btn-sm" id="btn-pag-prev" ${paginaHistorial <= 1 ? 'disabled' : ''}>←</button>
      <button class="btn btn-outline btn-sm" id="btn-pag-next" ${paginaHistorial >= totalPaginas ? 'disabled' : ''}>→</button>`;

    document.getElementById('btn-pag-prev').addEventListener('click', () => { paginaHistorial--; renderHistorial(); });
    document.getElementById('btn-pag-next').addEventListener('click', () => { paginaHistorial++; renderHistorial(); });
    U.$all('[data-calificar]').forEach((b) => b.addEventListener('click', () => abrirCalificar(b.dataset.calificar)));
  }

  U.$('#filtro-desde').addEventListener('change', () => { paginaHistorial = 1; renderHistorial(); });
  U.$('#filtro-hasta').addEventListener('change', () => { paginaHistorial = 1; renderHistorial(); });
  U.$('#btn-limpiar-filtro').addEventListener('click', () => {
    U.$('#filtro-desde').value = ''; U.$('#filtro-hasta').value = ''; paginaHistorial = 1; renderHistorial();
  });

  // ---------------- Calificación ----------------
  function abrirCalificar(visitaId) {
    const v = db.visitas.find((x) => x.id === visitaId);
    const p = piscina(v.piscinaId);
    U.$('#cal-visita-id').value = visitaId;
    U.$('#cal-visita-resumen').textContent = `${U.formatDateEs(v.fechaProgramada)} · ${p ? p.alias : ''}`;
    U.$('#cal-comentario').value = '';
    estrellasSeleccionadas = 5;
    pintarEstrellas();
    U.modalAbrir('modal-calificar');
  }

  function pintarEstrellas() {
    U.$all('#selector-estrellas span').forEach((sp) => {
      sp.classList.toggle('activa', parseInt(sp.dataset.v, 10) <= estrellasSeleccionadas);
    });
  }
  U.$all('#selector-estrellas span').forEach((sp) => {
    sp.addEventListener('click', () => { estrellasSeleccionadas = parseInt(sp.dataset.v, 10); pintarEstrellas(); });
  });

  U.$('#form-calificar').addEventListener('submit', (e) => {
    e.preventDefault();
    db = App.DB.cargar();
    const visitaId = U.$('#cal-visita-id').value;
    const v = db.visitas.find((x) => x.id === visitaId);
    const cal = {
      id: U.uid('cal'), visitaId, clienteId: cliente.id, estrellas: estrellasSeleccionadas,
      comentario: U.$('#cal-comentario').value.trim(), creada: new Date().toISOString(),
    };
    db.calificaciones.push(cal);
    v.calificacionId = cal.id;
    App.DB.guardar(db);
    U.modalCerrar('modal-calificar');
    U.toast('¡Gracias por tu calificación!', 'success');
    renderHistorial();
  });

  // ---------------- Facturas ----------------
  function renderFacturas() {
    const misFacturas = db.facturas.filter((f) => f.clienteId === cliente.id)
      .sort((a, b) => (b.anio - a.anio) || (b.mes - a.mes));
    U.$('#tbody-facturas-cliente').innerHTML = misFacturas.map((f) => `
      <tr>
        <td>${String(f.mes).padStart(2, '0')}/${f.anio}</td>
        <td>${U.formatCLP(f.montoTotal)}</td>
        <td><span class="badge ${f.estado === 'pagada' ? 'badge-activo' : f.estado === 'anulada' ? 'badge-inactivo' : 'badge-en-curso'}">${U.capitalize(f.estado)}</span></td>
        <td><button class="btn btn-outline btn-sm" data-ver-factura="${f.id}">📄 Descargar PDF</button></td>
      </tr>`).join('') || '<tr><td colspan="4" class="empty-state">Aún no tienes boletas generadas.</td></tr>';

    U.$all('[data-ver-factura]').forEach((b) => b.addEventListener('click', () => verBoleta(b.dataset.verFactura)));
  }

  function verBoleta(facturaId) {
    db = App.DB.cargar();
    const f = db.facturas.find((x) => x.id === facturaId);
    const detalles = db.facturaDetalles.filter((d) => d.facturaId === f.id);
    const filasHtml = detalles.map((d) => `<tr><td>${d.descripcion}</td><td>${U.formatCLP(d.monto)}</td></tr>`).join('');
    U.$('#boleta-cliente-cuerpo').innerHTML = `
      <h2>Piscinas Verano Perfecto</h2>
      <p class="text-suave">Boleta de servicios de mantención — Periodo ${String(f.mes).padStart(2, '0')}/${f.anio}</p>
      <div class="divider"></div>
      <p><strong>${cliente.nombre}</strong><br>RUT: ${cliente.rut}<br>${cliente.direccion}, ${cliente.comuna}</p>
      <div class="divider"></div>
      <table class="tabla"><thead><tr><th>Detalle</th><th>Monto</th></tr></thead><tbody>${filasHtml}</tbody></table>
      <div class="divider"></div>
      <p style="font-size:1.2rem;font-weight:800;text-align:right;">Total: ${U.formatCLP(f.montoTotal)}</p>
      <p class="text-sm text-suave">Estado: ${U.capitalize(f.estado)}</p>`;
    U.modalAbrir('modal-boleta-cliente');
  }

  U.$('#btn-pagar-pendiente').addEventListener('click', () => {
    db = App.DB.cargar();
    const pendiente = db.facturas.find((f) => f.clienteId === cliente.id && f.estado !== 'pagada');
    if (!pendiente) { U.toast('No tienes facturas pendientes de pago. ¡Estás al día!', 'success'); return; }
    verBoleta(pendiente.id);
  });

  U.$all('[data-close]').forEach((btn) => btn.addEventListener('click', () => U.modalCerrar(btn.dataset.close)));
  U.$all('.modal-overlay').forEach((m) => m.addEventListener('click', (e) => { if (e.target === m) U.modalCerrar(m.id); }));

  renderTodo();
  window.addEventListener('storage', renderTodo);
  window.addEventListener('pvp:db-actualizada', renderTodo);
})();
