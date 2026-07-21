/*
 * Lógica de la vista Técnico (mobile-first).
 * Pendiente -> En Curso -> Efectuada / Reagendada, con motivo obligatorio
 * al reagendar y parámetros químicos + checklist obligatorios antes de
 * poder marcar Efectuada.
 */
(function () {
  const usuario = App.Auth.requerirRol(['tecnico']);
  if (!usuario) return;

  const U = App.Utils;
  let db = App.DB.cargar();
  const empleado = db.empleados.find((e) => e.id === usuario.refId);
  let visitaActualId = null;
  let fotoDataUrl = null;

  function sectorNombre() {
    const s = db.sectores.find((s) => s.id === empleado.sectorId);
    return s ? s.nombre : '';
  }
  function piscina(id) { return db.piscinas.find((p) => p.id === id); }
  function contratoDe(id) { return db.contratos.find((c) => c.id === id); }
  function clienteDe(contratoId) {
    const ct = contratoDe(contratoId);
    return ct ? db.clientes.find((c) => c.id === ct.clienteId) : null;
  }

  U.$('#tec-saludo').textContent = `Hola, ${empleado.nombre.split(' ')[0]} 👋`;
  U.$('#tec-fecha').textContent = U.formatDateEs(U.toISODate(new Date())) + ' · ' + sectorNombre();
  U.$('#btn-logout-tec').addEventListener('click', () => { App.Auth.cerrarSesion(); window.location.href = 'index.html'; });

  function misVisitasHoy() {
    const hoyIso = U.toISODate(new Date());
    return db.visitas.filter((v) => v.empleadoId === empleado.id && v.fechaProgramada === hoyIso)
      .sort((a, b) => {
        const pa = piscina(a.piscinaId), pb = piscina(b.piscinaId);
        const c = (pa ? pa.comuna : '').localeCompare(pb ? pb.comuna : '');
        return c !== 0 ? c : (a.horaProgramada || '').localeCompare(b.horaProgramada || '');
      });
  }

  function renderLista() {
    db = App.DB.cargar();
    const visitas = misVisitasHoy();
    U.$('#contador-ruta').textContent = visitas.length + ' visita' + (visitas.length === 1 ? '' : 's');

    const efectuadas = visitas.filter((v) => v.estado === 'efectuada').length;
    const pct = visitas.length ? Math.round((efectuadas / visitas.length) * 100) : 0;
    U.$('#ruta-progreso-bar').style.width = pct + '%';
    U.$('#ruta-progreso-texto').textContent = `${efectuadas} de ${visitas.length} efectuadas`;

    U.$('#lista-visitas').innerHTML = visitas.map((v) => {
      const p = piscina(v.piscinaId);
      const cliente = clienteDe(v.contratoId);
      return `<div class="visita-card visita-card--${v.estado} pointer" data-visita="${v.id}">
        <div class="flex-between">
          <span class="hora">🕒 ${v.horaProgramada}</span>
          <span class="${U.badgeEstadoVisita(v.estado)}">${U.labelEstadoVisita(v.estado)}</span>
        </div>
        <div class="direccion mt-8">${p ? p.alias : ''}</div>
        <div class="comuna"><span class="pin-icon">📍</span> ${p ? p.direccion + ', ' + p.comuna : ''}</div>
        <div class="text-sm text-suave mt-8">👤 ${cliente ? cliente.nombre : ''}</div>
      </div>`;
    }).join('') || '<div class="empty-state">🎉 No tienes visitas programadas para hoy.</div>';

    U.$all('[data-visita]').forEach((el) => el.addEventListener('click', () => abrirDetalle(el.dataset.visita)));
  }

  function mostrarSync(transitorio) {
    const el = U.$('#tec-sync');
    if (!transitorio) return;
    el.innerHTML = '🔄 Guardando...';
    setTimeout(() => { el.innerHTML = '🟢 Sincronizado'; }, 700);
  }

  function abrirDetalle(visitaId) {
    db = App.DB.cargar();
    visitaActualId = visitaId;
    fotoDataUrl = null;
    U.$('#vista-lista').style.display = 'none';
    U.$('#vista-detalle').style.display = 'flex';
    renderDetalle();
  }

  function volverLista() {
    visitaActualId = null;
    U.$('#vista-detalle').style.display = 'none';
    U.$('#vista-lista').style.display = 'flex';
    actualizarBarraInferior(null);
    renderLista();
  }

  function ocultarBloques() {
    ['bloque-form-visita', 'bloque-acciones', 'bloque-reagendar', 'bloque-incidencia', 'resumen-efectuada']
      .forEach((id) => { document.getElementById(id).style.display = 'none'; });
  }

  function mostrarBloque(idVisible) {
    ['bloque-reagendar', 'bloque-incidencia'].forEach((b) => {
      document.getElementById(b).style.display = (b === idVisible ? 'block' : 'none');
    });
  }

  // Barra inferior fija: muestra la acción principal según el estado de la
  // visita, para que el botón sea siempre alcanzable sin hacer scroll dentro
  // de un checklist largo (el plan Premium tiene 9 tareas).
  function actualizarBarraInferior(estado) {
    const mostrarIniciar = estado === 'pendiente';
    const mostrarMarcar = estado === 'en_curso';
    document.getElementById('btn-iniciar-visita').style.display = mostrarIniciar ? 'block' : 'none';
    document.getElementById('btn-marcar-efectuada').style.display = mostrarMarcar ? 'block' : 'none';
    document.getElementById('tec-bottomnav-label').style.display = (mostrarIniciar || mostrarMarcar) ? 'none' : 'block';
  }

  function renderChecklist(v) {
    document.getElementById('checklist-tareas').innerHTML = v.checklist.map((item, i) => `
      <label class="${item.completado ? 'completado' : ''}"><input type="checkbox" data-idx="${i}" ${item.completado ? 'checked' : ''}> <span>${item.tarea}</span></label>`).join('');
    actualizarProgresoChecklist();
  }

  function actualizarProgresoChecklist() {
    const checks = U.$all('#checklist-tareas input[type=checkbox]');
    const total = checks.length;
    const hechas = checks.filter((c) => c.checked).length;
    const pct = total ? Math.round((hechas / total) * 100) : 0;
    const barra = document.getElementById('checklist-progreso-bar');
    if (barra) barra.style.width = pct + '%';
    const texto = document.getElementById('checklist-progreso-texto');
    if (texto) texto.textContent = `${hechas}/${total} tareas completas`;
  }

  document.getElementById('checklist-tareas').addEventListener('change', (e) => {
    if (!e.target.matches('input[type=checkbox]')) return;
    e.target.closest('label').classList.toggle('completado', e.target.checked);
    actualizarProgresoChecklist();
  });

  function renderDetalle() {
    const v = db.visitas.find((x) => x.id === visitaActualId);
    const p = piscina(v.piscinaId);
    const ct = contratoDe(v.contratoId);
    const cliente = clienteDe(v.contratoId);
    const tm = ct ? db.tiposMantencion.find((t) => t.id === ct.tipoMantencionId) : null;

    U.$('#detalle-info').innerHTML = `
      <div class="tec-hero-img">🏊</div>
      <h3 style="margin-bottom:4px;">${p ? p.alias : ''}</h3>
      <p class="text-suave text-sm"><span class="pin-icon">📍</span> ${p ? p.direccion + ', ' + p.comuna : ''}</p>
      <p class="mt-8"><strong>👤 ${cliente ? cliente.nombre : ''}</strong></p>
      <p class="text-sm">🕒 Hora programada: <strong>${v.horaProgramada}</strong> · Plan: ${tm ? tm.nombre : ''}</p>
      <p class="mt-8"><span class="${U.badgeEstadoVisita(v.estado)}">${U.labelEstadoVisita(v.estado)}</span></p>`;

    ocultarBloques();
    actualizarBarraInferior(v.estado);

    if (v.estado === 'efectuada') {
      const cal = v.calificacionId ? db.calificaciones.find((c) => c.id === v.calificacionId) : null;
      const cont = document.getElementById('resumen-efectuada');
      cont.style.display = 'block';
      cont.innerHTML = `
        <h3>Visita efectuada ✅</h3>
        <p>pH ${v.parametrosQuimicos ? v.parametrosQuimicos.ph : '-'} · Cloro ${v.parametrosQuimicos ? v.parametrosQuimicos.cloro : '-'} ppm</p>
        <p class="text-sm text-suave">${U.formatDateTimeEs(v.fechaEfectuada)}</p>
        ${cal ? `<p class="mt-8 estrellas">${U.estrellas(cal.estrellas)}</p>` : '<p class="text-sm text-suave">Aún sin calificación del cliente.</p>'}
        <div class="divider"></div>
        <button class="btn btn-outline btn-block" id="btn-mostrar-incidencia-2">⚠️ Reportar incidencia</button>`;
      document.getElementById('btn-mostrar-incidencia-2').addEventListener('click', () => mostrarBloque('bloque-incidencia'));
      return;
    }
    if (v.estado === 'reagendada' || v.estado === 'cancelada') {
      const cont = document.getElementById('resumen-efectuada');
      cont.style.display = 'block';
      cont.innerHTML = v.estado === 'reagendada'
        ? `<h3>Reagendada 📅</h3><p>Motivo: ${v.motivoReagendamiento}</p>`
        : `<h3>Cancelada</h3>`;
      return;
    }

    if (v.estado === 'en_curso') {
      document.getElementById('bloque-form-visita').style.display = 'block';
      renderChecklist(v);
      document.getElementById('in-ph').value = v.parametrosQuimicos ? v.parametrosQuimicos.ph : '';
      document.getElementById('in-cloro').value = v.parametrosQuimicos ? v.parametrosQuimicos.cloro : '';
      document.getElementById('in-observaciones').value = v.parametrosQuimicos ? v.parametrosQuimicos.observaciones : '';
    }
    document.getElementById('bloque-acciones').style.display = 'block';
  }

  document.getElementById('btn-volver').addEventListener('click', volverLista);

  document.getElementById('btn-iniciar-visita').addEventListener('click', () => {
    db = App.DB.cargar();
    const v = db.visitas.find((x) => x.id === visitaActualId);
    v.estado = 'en_curso';
    v.historialEstados.push({ estado: 'en_curso', fecha: new Date().toISOString(), usuario: empleado.nombre });
    App.DB.guardar(db);
    mostrarSync(true);
    renderDetalle();
  });

  document.getElementById('btn-marcar-efectuada').addEventListener('click', () => {
    const ph = document.getElementById('in-ph').value;
    const cloro = document.getElementById('in-cloro').value;
    const checks = U.$all('#checklist-tareas input[type=checkbox]');
    const todasCompletas = checks.length > 0 && checks.every((c) => c.checked);

    if (!ph || !cloro) { U.toast('Ingresa pH y cloro antes de marcar Efectuada.', 'error'); return; }
    if (!todasCompletas) { U.toast('Completa todas las tareas del checklist antes de marcar Efectuada.', 'error'); return; }

    db = App.DB.cargar();
    const v = db.visitas.find((x) => x.id === visitaActualId);
    v.parametrosQuimicos = { ph, cloro, observaciones: document.getElementById('in-observaciones').value };
    v.checklist = v.checklist.map((item, i) => ({ ...item, completado: checks[i].checked }));
    v.estado = 'efectuada';
    v.fechaEfectuada = new Date().toISOString();
    v.historialEstados.push({ estado: 'efectuada', fecha: v.fechaEfectuada, usuario: empleado.nombre });
    App.DB.guardar(db);

    // Patrón Observer: este formulario solo "notifica" -- no sabe (ni le
    // importa) quién reacciona a una visita Efectuada. Ver assets/js/observer.js.
    const p = piscina(v.piscinaId);
    const cliente = clienteDe(v.contratoId);
    App.Observer.visitaSubject.notificar({
      tipo: 'EFECTUADA',
      visita: v,
      mensaje: `${empleado.nombre} marcó como Efectuada la visita en ${p ? p.alias : ''} (${cliente ? cliente.nombre : ''}).`,
    });

    mostrarSync(true);
    U.toast('Visita marcada como Efectuada.', 'success');
    renderDetalle();
  });

  document.getElementById('btn-mostrar-reagendar').addEventListener('click', () => mostrarBloque('bloque-reagendar'));
  document.getElementById('btn-mostrar-incidencia').addEventListener('click', () => mostrarBloque('bloque-incidencia'));

  document.getElementById('btn-confirmar-reagendar').addEventListener('click', () => {
    const motivo = document.getElementById('in-motivo-reagendar').value.trim();
    if (!motivo) { document.getElementById('err-reagendar').style.display = 'block'; return; }
    document.getElementById('err-reagendar').style.display = 'none';

    db = App.DB.cargar();
    const v = db.visitas.find((x) => x.id === visitaActualId);
    v.estado = 'reagendada';
    v.motivoReagendamiento = motivo;
    v.historialEstados.push({ estado: 'reagendada', fecha: new Date().toISOString(), usuario: empleado.nombre, motivo });
    App.DB.guardar(db);

    const p = piscina(v.piscinaId);
    const cliente = clienteDe(v.contratoId);
    App.Observer.visitaSubject.notificar({
      tipo: 'REAGENDADA',
      visita: v,
      mensaje: `${empleado.nombre} reagendó la visita en ${p ? p.alias : ''} (${cliente ? cliente.nombre : ''}). Motivo: ${motivo}`,
    });

    mostrarSync(true);
    U.toast('Visita reagendada.', 'success');
    document.getElementById('in-motivo-reagendar').value = '';
    volverLista();
  });

  document.getElementById('in-foto-incidencia').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      fotoDataUrl = reader.result;
      const img = document.getElementById('preview-foto-incidencia');
      img.src = fotoDataUrl;
      img.style.display = 'block';
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('btn-confirmar-incidencia').addEventListener('click', () => {
    const desc = document.getElementById('in-desc-incidencia').value.trim();
    if (!desc) { document.getElementById('err-incidencia').style.display = 'block'; return; }
    document.getElementById('err-incidencia').style.display = 'none';

    db = App.DB.cargar();
    db.incidencias.push({
      id: U.uid('inc'), visitaId: visitaActualId, empleadoId: empleado.id,
      descripcion: desc, fotoDataUrl, estado: 'reportada', creada: new Date().toISOString(),
    });
    App.DB.guardar(db);
    mostrarSync(true);
    U.toast('Incidencia reportada.', 'success');
    document.getElementById('in-desc-incidencia').value = '';
    document.getElementById('preview-foto-incidencia').style.display = 'none';
    fotoDataUrl = null;
    mostrarBloque('');
  });

  renderLista();
  window.addEventListener('storage', () => { if (!visitaActualId) renderLista(); });
})();
