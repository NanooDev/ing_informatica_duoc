/*
 * Utilidades compartidas por todas las páginas.
 * Namespace global: App.Utils (sin módulos ES para poder abrir los .html
 * con doble clic vía file:// sin que el navegador bloquee la carga por CORS).
 */
window.App = window.App || {};

App.Utils = (function () {
  function uid(prefix) {
    return prefix + '_' + Math.random().toString(36).slice(2, 9);
  }

  // PRNG determinista (mulberry32): los datos de demostración se ven variados
  // pero son reproducibles cada vez que se restablece el dataset.
  function crearRng(semilla) {
    let a = semilla >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  function toISODate(date) {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  function formatDateEs(isoDate) {
    if (!isoDate) return '-';
    const [y, m, d] = isoDate.split('-');
    return `${d} ${MESES[parseInt(m, 10) - 1]} ${y}`;
  }

  function formatDateTimeEs(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${formatDateEs(toISODate(d))}, ${hh}:${mi}`;
  }

  function formatCLP(monto) {
    return '$' + Math.round(monto || 0).toLocaleString('es-CL');
  }

  function diffInYears(fromIso, toDate) {
    const from = new Date(fromIso);
    return (toDate - from) / (1000 * 60 * 60 * 24 * 365.25);
  }

  function capitalize(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }

  function $(selector, root) { return (root || document).querySelector(selector); }
  function $all(selector, root) { return Array.from((root || document).querySelectorAll(selector)); }

  function toast(mensaje, tipo) {
    tipo = tipo || 'info';
    const cont = document.getElementById('toast-container');
    if (!cont) { alert(mensaje); return; }
    const el = document.createElement('div');
    el.className = 'toast toast-' + tipo;
    el.textContent = mensaje;
    cont.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 300);
    }, 3200);
  }

  const ESTADO_VISITA_BADGE = {
    pendiente: 'badge-pendiente',
    en_curso: 'badge-en-curso',
    efectuada: 'badge-efectuada',
    reagendada: 'badge-reagendada',
    cancelada: 'badge-cancelada',
  };
  const ESTADO_VISITA_LABEL = {
    pendiente: 'Pendiente',
    en_curso: 'En Curso',
    efectuada: 'Efectuada',
    reagendada: 'Reagendada',
    cancelada: 'Cancelada',
  };

  function badgeEstadoVisita(estado) {
    return 'badge ' + (ESTADO_VISITA_BADGE[estado] || '');
  }
  function labelEstadoVisita(estado) {
    return ESTADO_VISITA_LABEL[estado] || estado;
  }

  function estrellas(n) {
    const llenas = '★'.repeat(n);
    const vacias = '☆'.repeat(5 - n);
    return llenas + vacias;
  }

  // ---------------------------------------------------------------------
  // Avatares e identidad visual (iniciales + color determinista)
  // ---------------------------------------------------------------------
  function hashStr(s) {
    let h = 0;
    for (let i = 0; i < (s || '').length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  function inicialesNombre(nombre) {
    if (!nombre) return '?';
    const partes = nombre.trim().split(/\s+/);
    const ini = partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : '');
    return ini.toUpperCase();
  }

  const AVATAR_VARIANTES = 6;
  function claseAvatar(seed) {
    return 'avatar avatar-' + (hashStr(String(seed)) % AVATAR_VARIANTES);
  }

  // ---------------------------------------------------------------------
  // Mini gráficos en SVG inline (sin librerías externas: el prototipo debe
  // poder abrirse con doble clic vía file:// sin depender de un CDN).
  // ---------------------------------------------------------------------
  function r1(n) { return Math.round(n * 10) / 10; }

  function graficoLineas(valores, opts) {
    opts = opts || {};
    const w = opts.width || 320, h = opts.height || 110, pad = 10;
    const datos = valores.length ? valores : [0];
    const max = Math.max.apply(null, datos.concat([1]));
    const min = Math.min.apply(null, datos.concat([0]));
    const range = (max - min) || 1;
    const n = datos.length;
    const stepX = n > 1 ? (w - pad * 2) / (n - 1) : 0;
    const pts = datos.map((v, i) => [
      r1(pad + i * stepX),
      r1(h - pad - ((v - min) / range) * (h - pad * 2)),
    ]);
    const linePath = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0] + ',' + p[1]).join(' ');
    const areaPath = linePath + ` L${pts[pts.length - 1][0]},${h - pad} L${pts[0][0]},${h - pad} Z`;
    const color = opts.color || 'var(--turquesa-500)';
    const puntos = pts.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="${color}"></circle>`).join('');
    return `<svg viewBox="0 0 ${w} ${h}" class="mini-chart" preserveAspectRatio="none">
      <path d="${areaPath}" fill="${color}" opacity="0.13"></path>
      <path d="${linePath}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path>
      ${puntos}
    </svg>`;
  }

  function graficoBarras(valores, opts) {
    opts = opts || {};
    const w = opts.width || 320, h = opts.height || 110, pad = 8, gap = 10;
    const datos = valores.length ? valores : [0];
    const n = datos.length;
    const max = Math.max.apply(null, datos.concat([1]));
    const barW = (w - pad * 2 - gap * (n - 1)) / n;
    const color = opts.color || 'var(--azul-600)';
    const barras = datos.map((v, i) => {
      const bh = max > 0 ? (v / max) * (h - pad * 2) : 0;
      const x = r1(pad + i * (barW + gap));
      const y = r1(h - pad - bh);
      return `<rect x="${x}" y="${y}" width="${r1(barW)}" height="${r1(bh)}" rx="4" fill="${color}"></rect>`;
    }).join('');
    return `<svg viewBox="0 0 ${w} ${h}" class="mini-chart" preserveAspectRatio="none">${barras}</svg>`;
  }

  function modalAbrir(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.add('open'); document.body.classList.add('modal-open'); }
  }
  function modalCerrar(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.remove('open'); document.body.classList.remove('modal-open'); }
  }

  function descargarArchivo(nombre, contenido, tipo) {
    const blob = new Blob([contenido], { type: tipo || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportarCSV(nombreArchivo, columnas, filas) {
    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lineas = [columnas.map(escape).join(';')]
      .concat(filas.map((fila) => fila.map(escape).join(';')));
    // BOM para que Excel detecte UTF-8 correctamente
    descargarArchivo(nombreArchivo, '﻿' + lineas.join('\r\n'), 'text/csv;charset=utf-8');
  }

  return {
    uid, crearRng, addDays, toISODate, startOfDay, formatDateEs, formatDateTimeEs,
    formatCLP, diffInYears, capitalize, $, $all, toast, badgeEstadoVisita,
    labelEstadoVisita, estrellas, modalAbrir, modalCerrar, descargarArchivo, exportarCSV,
    hashStr, inicialesNombre, claseAvatar, graficoLineas, graficoBarras,
  };
})();
