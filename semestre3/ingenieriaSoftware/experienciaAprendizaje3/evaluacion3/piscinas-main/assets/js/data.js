/*
 * Capa de datos del prototipo: todo vive en localStorage (clave pvp_db_v1).
 * No hay backend real -- esto simula lo que en la versión Laravel del
 * proyecto serían las tablas de la base de datos (ver README.md).
 *
 * App.DB.cargar()      -> lee (y siembra si es la primera vez) la "BD".
 * App.DB.guardar(db)   -> persiste el objeto completo de vuelta.
 * App.DB.restablecer() -> vuelve a generar el dataset de demostración.
 */
window.App = window.App || {};

App.DB = (function () {
  const STORAGE_KEY = 'pvp_db_v1';
  const U = App.Utils;

  function cargar() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = construirSeed();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return restablecer();
    }
  }

  function guardar(db) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    // Permite que otras pestañas abiertas (admin/tecnico/portal) reaccionen
    // sin recargar, escuchando el evento "storage" del navegador.
    window.dispatchEvent(new CustomEvent('pvp:db-actualizada'));
  }

  function restablecer() {
    const fresh = construirSeed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    window.dispatchEvent(new CustomEvent('pvp:db-actualizada'));
    return fresh;
  }

  // ---------------------------------------------------------------------
  // Construcción del dataset de demostración
  // ---------------------------------------------------------------------
  function construirSeed() {
    const rng = U.crearRng(20260622); // semilla fija -> demo reproducible
    const hoy = U.startOfDay(new Date());

    const sectores = [
      { id: 'sec1', nombre: 'Sector Oriente', comunas: ['Las Condes', 'Vitacura', 'Lo Barnechea', 'Providencia'] },
      { id: 'sec2', nombre: 'Sector Centro', comunas: ['Santiago Centro', 'Ñuñoa', 'San Miguel'] },
      { id: 'sec3', nombre: 'Sector Sur', comunas: ['La Florida', 'Puente Alto', 'La Reina'] },
      { id: 'sec4', nombre: 'Sector Poniente', comunas: ['Maipú', 'Pudahuel', 'Cerrillos'] },
      { id: 'sec5', nombre: 'Sector Norte', comunas: ['Huechuraba', 'Quilicura', 'Colina'] },
    ];

    const tiposMantencion = [
      { id: 'tm1', nombre: 'Básica', tareas: ['Medir pH y cloro', 'Limpieza de superficie con malla', 'Revisión visual de filtro'] },
      { id: 'tm2', nombre: 'Completa', tareas: ['Medir pH y cloro', 'Limpieza de superficie con malla', 'Revisión visual de filtro', 'Aspirado de fondo', 'Limpieza de bordes y línea de agua', 'Retrolavado de filtro'] },
      { id: 'tm3', nombre: 'Premium', tareas: ['Medir pH y cloro', 'Limpieza de superficie con malla', 'Revisión visual de filtro', 'Aspirado de fondo', 'Limpieza de bordes y línea de agua', 'Retrolavado de filtro', 'Revisión de bomba y motor', 'Limpieza de skimmer y rejillas', 'Balance químico avanzado (alguicida)'] },
    ];

    const empleados = [
      { id: 'emp_admin', userId: 'u_admin', nombre: 'Francisca Muñoz', rut: '15.234.567-8', cargo: 'administrador', sectorId: null, activo: true },
      { id: 'emp_sup1', userId: 'u_sup1', nombre: 'Camila Soto', rut: '14.876.234-1', cargo: 'supervisor', sectorId: 'sec1', activo: true },
      { id: 'emp_sup2', userId: 'u_sup2', nombre: 'Andrea Vega', rut: '13.654.321-9', cargo: 'supervisor', sectorId: 'sec3', activo: true },
      { id: 'emp_tec1', userId: 'u_tec1', nombre: 'Pedro Salinas', rut: '18.111.222-3', cargo: 'tecnico', sectorId: 'sec1', activo: true },
      { id: 'emp_tec2', userId: 'u_tec2', nombre: 'Marco Reyes', rut: '17.222.333-4', cargo: 'tecnico', sectorId: 'sec2', activo: true },
      { id: 'emp_tec3', userId: 'u_tec3', nombre: 'Ignacio Fuentes', rut: '16.333.444-5', cargo: 'tecnico', sectorId: 'sec3', activo: true },
      { id: 'emp_tec4', userId: 'u_tec4', nombre: 'Diego Morales', rut: '19.444.555-6', cargo: 'tecnico', sectorId: 'sec4', activo: true },
      { id: 'emp_tec5', userId: 'u_tec5', nombre: 'Felipe Castro', rut: '20.555.666-7', cargo: 'tecnico', sectorId: 'sec5', activo: true },
      { id: 'emp_tec6', userId: 'u_tec6', nombre: 'Rodrigo Pizarro', rut: '12.666.777-8', cargo: 'tecnico', sectorId: 'sec1', activo: true },
    ];

    const clientes = [
      { id: 'cli1', userId: 'u_cli1', nombre: 'Condominio Central', tipo: 'Condominio', tamano: 'Grande', rut: '76.111.222-3', email: 'contacto@condominiocentral.cl', telefono: '+56 9 1111 2222', direccion: 'Av. Apoquindo 4500', comuna: 'Las Condes', activo: true },
      { id: 'cli2', userId: 'u_cli2', nombre: 'Hotel Las Brisas', tipo: 'Hotel', tamano: 'Grande', rut: '77.222.333-4', email: 'reservas@lasbrisas.cl', telefono: '+56 9 2222 3333', direccion: 'Av. Vitacura 3200', comuna: 'Vitacura', activo: true },
      { id: 'cli3', userId: 'u_cli3', nombre: 'Juan Pérez Iturra', tipo: 'Particular', tamano: 'Pequeña', rut: '11.333.444-5', email: 'juan.perez@gmail.com', telefono: '+56 9 3333 4444', direccion: 'Los Militares 5800', comuna: 'Providencia', activo: true },
      { id: 'cli4', userId: 'u_cli4', nombre: 'María Soledad Contreras', tipo: 'Particular', tamano: 'Mediana', rut: '12.444.555-6', email: 'msoledad.contreras@gmail.com', telefono: '+56 9 4444 5555', direccion: 'Pedro de Valdivia 1200', comuna: 'Ñuñoa', activo: true },
      { id: 'cli5', userId: 'u_cli5', nombre: 'Edificio Mirador del Parque', tipo: 'Edificio', tamano: 'Mediana', rut: '78.333.444-5', email: 'administracion@miradordelparque.cl', telefono: '+56 9 5555 6666', direccion: 'Príncipe de Gales 8200', comuna: 'La Reina', activo: true },
      { id: 'cli6', userId: 'u_cli6', nombre: 'Gimnasio Aqua Fitness', tipo: 'Comercial', tamano: 'Mediana', rut: '79.444.555-6', email: 'contacto@aquafitness.cl', telefono: '+56 9 6666 7777', direccion: 'Av. Pajaritos 3000', comuna: 'Maipú', activo: true },
      { id: 'cli7', userId: 'u_cli7', nombre: 'Carlos Bravo Núñez', tipo: 'Particular', tamano: 'Pequeña', rut: '13.555.666-7', email: 'carlos.bravo@gmail.com', telefono: '+56 9 7777 8888', direccion: 'Las Torcazas 450', comuna: 'Pudahuel', activo: true },
      { id: 'cli8', userId: 'u_cli8', nombre: 'Condominio Las Palmas', tipo: 'Condominio', tamano: 'Grande', rut: '80.555.666-7', email: 'contacto@laspalmas.cl', telefono: '+56 9 8888 9999', direccion: 'Camino Las Palmas 200', comuna: 'Puente Alto', activo: true },
      { id: 'cli9', userId: 'u_cli9', nombre: 'Spa Urbano Relax', tipo: 'Comercial', tamano: 'Pequeña', rut: '81.666.777-8', email: 'reservas@urbanorelax.cl', telefono: '+56 9 9999 0000', direccion: 'Bandera 150', comuna: 'Santiago Centro', activo: false },
      { id: 'cli10', userId: 'u_cli10', nombre: 'Familia Rojas Espinoza', tipo: 'Particular', tamano: 'Pequeña', rut: '14.666.777-8', email: 'rojas.espinoza@gmail.com', telefono: '+56 9 1010 2020', direccion: 'Vicuña Mackenna 9800', comuna: 'La Florida', activo: true },
    ];

    const piscinas = [
      { id: 'pis1', alias: 'Piscina Torre A', direccion: 'Av. Apoquindo 4500', comuna: 'Las Condes', sectorId: 'sec1', volumenM3: 80 },
      { id: 'pis2', alias: 'Piscina Torre B', direccion: 'Av. Apoquindo 4500', comuna: 'Las Condes', sectorId: 'sec1', volumenM3: 80 },
      { id: 'pis3', alias: 'Piscina Torre C', direccion: 'Av. Apoquindo 4500', comuna: 'Las Condes', sectorId: 'sec1', volumenM3: 60 },
      { id: 'pis4', alias: 'Piscina Hotel - Cubierta', direccion: 'Av. Vitacura 3200', comuna: 'Vitacura', sectorId: 'sec1', volumenM3: 150 },
      { id: 'pis5', alias: 'Piscina Hotel - Exterior', direccion: 'Av. Vitacura 3200', comuna: 'Vitacura', sectorId: 'sec1', volumenM3: 200 },
      { id: 'pis6', alias: 'Piscina particular', direccion: 'Los Militares 5800', comuna: 'Providencia', sectorId: 'sec1', volumenM3: 35 },
      { id: 'pis7', alias: 'Piscina particular', direccion: 'Pedro de Valdivia 1200', comuna: 'Ñuñoa', sectorId: 'sec2', volumenM3: 28 },
      { id: 'pis8', alias: 'Piscina Edificio', direccion: 'Príncipe de Gales 8200', comuna: 'La Reina', sectorId: 'sec3', volumenM3: 90 },
      { id: 'pis9', alias: 'Piscina Gimnasio', direccion: 'Av. Pajaritos 3000', comuna: 'Maipú', sectorId: 'sec4', volumenM3: 110 },
      { id: 'pis10', alias: 'Piscina particular', direccion: 'Las Torcazas 450', comuna: 'Pudahuel', sectorId: 'sec4', volumenM3: 30 },
      { id: 'pis11', alias: 'Piscina Torre 1', direccion: 'Camino Las Palmas 200', comuna: 'Puente Alto', sectorId: 'sec3', volumenM3: 100 },
      { id: 'pis12', alias: 'Piscina Torre 2', direccion: 'Camino Las Palmas 200', comuna: 'Puente Alto', sectorId: 'sec3', volumenM3: 100 },
      { id: 'pis13', alias: 'Piscina Spa', direccion: 'Bandera 150', comuna: 'Santiago Centro', sectorId: 'sec2', volumenM3: 40 },
      { id: 'pis14', alias: 'Piscina particular', direccion: 'Vicuña Mackenna 9800', comuna: 'La Florida', sectorId: 'sec3', volumenM3: 32 },
    ];

    // IMPORTANTE: piscinas NO tiene clienteId. El cliente siempre se llega
    // a través de contrato.clienteId -> contrato.piscinaIds.
    const contratos = [
      { id: 'ct1', clienteId: 'cli1', piscinaIds: ['pis1', 'pis2', 'pis3'], frecuencia: 'semanal', tipoMantencionId: 'tm3', precioBase: 45000, fechaInicio: '2023-03-01', fechaUltimoReajuste: '2025-03-01', estado: 'activo' },
      { id: 'ct2', clienteId: 'cli2', piscinaIds: ['pis4', 'pis5'], frecuencia: 'semanal', tipoMantencionId: 'tm3', precioBase: 60000, fechaInicio: '2022-11-15', fechaUltimoReajuste: '2024-11-15', estado: 'activo' },
      { id: 'ct3', clienteId: 'cli3', piscinaIds: ['pis6'], frecuencia: 'quincenal', tipoMantencionId: 'tm1', precioBase: 28000, fechaInicio: '2024-01-10', fechaUltimoReajuste: '2024-01-10', estado: 'activo' },
      { id: 'ct4', clienteId: 'cli4', piscinaIds: ['pis7'], frecuencia: 'mensual', tipoMantencionId: 'tm2', precioBase: 32000, fechaInicio: '2023-06-01', fechaUltimoReajuste: '2024-06-01', estado: 'activo' },
      { id: 'ct5', clienteId: 'cli5', piscinaIds: ['pis8'], frecuencia: 'quincenal', tipoMantencionId: 'tm2', precioBase: 35000, fechaInicio: '2023-09-20', fechaUltimoReajuste: '2024-09-20', estado: 'activo' },
      { id: 'ct6', clienteId: 'cli6', piscinaIds: ['pis9'], frecuencia: 'semanal', tipoMantencionId: 'tm3', precioBase: 50000, fechaInicio: '2022-05-05', fechaUltimoReajuste: '2025-05-05', estado: 'activo' },
      { id: 'ct7', clienteId: 'cli7', piscinaIds: ['pis10'], frecuencia: 'mensual', tipoMantencionId: 'tm1', precioBase: 25000, fechaInicio: '2024-02-14', fechaUltimoReajuste: '2024-02-14', estado: 'activo' },
      { id: 'ct8', clienteId: 'cli8', piscinaIds: ['pis11', 'pis12'], frecuencia: 'semanal', tipoMantencionId: 'tm2', precioBase: 42000, fechaInicio: '2021-08-01', fechaUltimoReajuste: '2025-08-01', estado: 'activo' },
      { id: 'ct9', clienteId: 'cli9', piscinaIds: ['pis13'], frecuencia: 'quincenal', tipoMantencionId: 'tm2', precioBase: 30000, fechaInicio: '2023-01-01', fechaUltimoReajuste: '2024-01-01', estado: 'finalizado' },
      { id: 'ct10', clienteId: 'cli10', piscinaIds: ['pis14'], frecuencia: 'mensual', tipoMantencionId: 'tm1', precioBase: 24000, fechaInicio: '2024-04-01', fechaUltimoReajuste: '2024-04-01', estado: 'activo' },
    ];

    const usuarios = [
      { id: 'u_admin', nombre: 'Francisca Muñoz', email: 'admin@veranoperfecto.cl', password: 'admin123', rol: 'administrador', refId: 'emp_admin' },
      { id: 'u_sup1', nombre: 'Camila Soto', email: 'camila.soto@veranoperfecto.cl', password: 'super123', rol: 'supervisor', refId: 'emp_sup1' },
      { id: 'u_sup2', nombre: 'Andrea Vega', email: 'andrea.vega@veranoperfecto.cl', password: 'super123', rol: 'supervisor', refId: 'emp_sup2' },
      { id: 'u_tec1', nombre: 'Pedro Salinas', email: 'pedro.salinas@veranoperfecto.cl', password: 'tecnico123', rol: 'tecnico', refId: 'emp_tec1' },
      { id: 'u_tec2', nombre: 'Marco Reyes', email: 'marco.reyes@veranoperfecto.cl', password: 'tecnico123', rol: 'tecnico', refId: 'emp_tec2' },
      { id: 'u_tec3', nombre: 'Ignacio Fuentes', email: 'ignacio.fuentes@veranoperfecto.cl', password: 'tecnico123', rol: 'tecnico', refId: 'emp_tec3' },
      { id: 'u_tec4', nombre: 'Diego Morales', email: 'diego.morales@veranoperfecto.cl', password: 'tecnico123', rol: 'tecnico', refId: 'emp_tec4' },
      { id: 'u_tec5', nombre: 'Felipe Castro', email: 'felipe.castro@veranoperfecto.cl', password: 'tecnico123', rol: 'tecnico', refId: 'emp_tec5' },
      { id: 'u_tec6', nombre: 'Rodrigo Pizarro', email: 'rodrigo.pizarro@veranoperfecto.cl', password: 'tecnico123', rol: 'tecnico', refId: 'emp_tec6' },
      { id: 'u_cli1', nombre: 'Condominio Central', email: 'contacto@condominiocentral.cl', password: 'cliente123', rol: 'cliente', refId: 'cli1' },
      { id: 'u_cli2', nombre: 'Hotel Las Brisas', email: 'reservas@lasbrisas.cl', password: 'cliente123', rol: 'cliente', refId: 'cli2' },
      { id: 'u_cli3', nombre: 'Juan Pérez Iturra', email: 'juan.perez@gmail.com', password: 'cliente123', rol: 'cliente', refId: 'cli3' },
      { id: 'u_cli4', nombre: 'María Soledad Contreras', email: 'msoledad.contreras@gmail.com', password: 'cliente123', rol: 'cliente', refId: 'cli4' },
      { id: 'u_cli5', nombre: 'Edificio Mirador del Parque', email: 'administracion@miradordelparque.cl', password: 'cliente123', rol: 'cliente', refId: 'cli5' },
      { id: 'u_cli6', nombre: 'Gimnasio Aqua Fitness', email: 'contacto@aquafitness.cl', password: 'cliente123', rol: 'cliente', refId: 'cli6' },
      { id: 'u_cli7', nombre: 'Carlos Bravo Núñez', email: 'carlos.bravo@gmail.com', password: 'cliente123', rol: 'cliente', refId: 'cli7' },
      { id: 'u_cli8', nombre: 'Condominio Las Palmas', email: 'contacto@laspalmas.cl', password: 'cliente123', rol: 'cliente', refId: 'cli8' },
      { id: 'u_cli9', nombre: 'Spa Urbano Relax', email: 'reservas@urbanorelax.cl', password: 'cliente123', rol: 'cliente', refId: 'cli9' },
      { id: 'u_cli10', nombre: 'Familia Rojas Espinoza', email: 'rojas.espinoza@gmail.com', password: 'cliente123', rol: 'cliente', refId: 'cli10' },
    ];

    const visitas = [];
    const incidencias = [];
    const calificaciones = [];
    const auditLog = [
      {
        id: U.uid('aud'), userId: 'u_admin', usuarioNombre: 'Francisca Muñoz', accion: 'Reajuste de precio',
        entidad: 'Contrato', entidadId: 'ct1', detalle: 'Reajuste anual aplicado al contrato de Condominio Central',
        creada: U.toISODate(U.addDays(hoy, -40)) + 'T09:12:00',
      },
      {
        id: U.uid('aud'), userId: 'u_admin', usuarioNombre: 'Francisca Muñoz', accion: 'Reasignación de turno',
        entidad: 'Turno', entidadId: 'tur1', detalle: 'Se reasignó el turno de invierno de Rodrigo Pizarro al Sector Oriente',
        creada: U.toISODate(U.addDays(hoy, -12)) + 'T15:40:00',
      },
    ];

    const FREQ_DIAS = { semanal: 7, quincenal: 14, mensual: 30 };
    const tecnicosPorSector = {};
    empleados.filter((e) => e.cargo === 'tecnico').forEach((t) => {
      tecnicosPorSector[t.sectorId] = tecnicosPorSector[t.sectorId] || [];
      tecnicosPorSector[t.sectorId].push(t);
    });

    function tecnicoParaPiscina(piscina, indice) {
      const lista = tecnicosPorSector[piscina.sectorId] || empleados.filter((e) => e.cargo === 'tecnico');
      return lista[indice % lista.length];
    }

    // Genera el historial de visitas de cada contrato activo: pasado
    // (mayormente Efectuadas), algunas de "hoy" y un par a futuro próximo.
    contratos.forEach((contrato, ci) => {
      if (contrato.estado !== 'activo') return;
      const intervalo = FREQ_DIAS[contrato.frecuencia];
      const piscinasContrato = piscinas.filter((p) => contrato.piscinaIds.includes(p.id));

      piscinasContrato.forEach((piscina, pi) => {
        const tecnico = tecnicoParaPiscina(piscina, ci + pi);
        const cantidadPiscinas = contrato.piscinaIds.length;
        const precio = App.Pricing.precioVigente(contrato, cantidadPiscinas, hoy);
        const tipoMant = tiposMantencion.find((t) => t.id === contrato.tipoMantencionId);

        // Offset pequeño (-1, 0 o 1 día) para que las visitas se agrupen cerca
        // de "hoy" sin caer todas el mismo día; el ajuste de más abajo
        // garantiza que cada técnico tenga al menos una visita hoy.
        const offsetHoy = ((ci * 3 + pi) % 3) - 1;
        const nOcurrenciasPasadas = 7;

        for (let k = -nOcurrenciasPasadas; k <= 2; k++) {
          const fecha = U.addDays(hoy, offsetHoy + k * intervalo);
          const fechaISO = U.toISODate(fecha);
          const esFuturo = fecha > hoy;
          const esHoy = U.toISODate(fecha) === U.toISODate(hoy);

          let estado;
          let motivoReagendamiento = null;
          if (esFuturo) {
            estado = 'pendiente';
          } else if (esHoy) {
            // Variedad para la demo: algunas en curso, otras ya efectuadas hoy.
            const r = rng();
            estado = r < 0.4 ? 'pendiente' : r < 0.65 ? 'en_curso' : 'efectuada';
          } else {
            const r = rng();
            if (r < 0.08) {
              estado = 'reagendada';
              motivoReagendamiento = ['Cliente solicitó cambio de horario', 'Acceso cerrado en la visita', 'Lluvia / condiciones climáticas'][Math.floor(rng() * 3)];
            } else if (r < 0.1) {
              estado = 'cancelada';
            } else {
              estado = 'efectuada';
            }
          }

          const horaProgramada = ['09:00', '10:30', '12:00', '14:00', '15:30', '17:00'][Math.floor(rng() * 6)];

          const visita = {
            id: U.uid('vis'),
            contratoId: contrato.id,
            piscinaId: piscina.id,
            empleadoId: tecnico ? tecnico.id : null,
            estado,
            fechaProgramada: fechaISO,
            horaProgramada,
            fechaEfectuada: null,
            motivoReagendamiento,
            precioVisita: precio,
            parametrosQuimicos: null,
            checklist: tipoMant.tareas.map((t) => ({ tarea: t, completado: false })),
            calificacionId: null,
            solicitudReagendamiento: null,
            historialEstados: [
              { estado: 'pendiente', fecha: fechaISO + 'T08:00:00', usuario: 'Sistema' },
            ],
          };

          if (estado === 'efectuada') {
            visita.fechaEfectuada = fechaISO + 'T' + horaProgramada + ':00';
            visita.parametrosQuimicos = {
              ph: (7.0 + rng() * 0.8).toFixed(1),
              cloro: (1.0 + rng() * 2.5).toFixed(1),
              observaciones: rng() < 0.15 ? 'Se detectó leve turbidez, se reforzó dosificación de cloro.' : '',
            };
            visita.checklist = visita.checklist.map((item) => ({ ...item, completado: true }));
            visita.historialEstados.push({ estado: 'efectuada', fecha: visita.fechaEfectuada, usuario: tecnico ? tecnico.nombre : 'Técnico' });

            // Calificación: la mayoría son buenas, pero el técnico Diego
            // Morales (emp_tec4) acumula varias bajo 3 estrellas a propósito,
            // para poder mostrar la alerta visual del admin.
            const probabilidadCalifica = 0.65;
            if (rng() < probabilidadCalifica && !esFuturo) {
              let estrellas;
              if (tecnico && tecnico.id === 'emp_tec4') {
                estrellas = [1, 2, 2, 3][Math.floor(rng() * 4)];
              } else {
                estrellas = [3, 4, 4, 5, 5, 5][Math.floor(rng() * 6)];
              }
              const cal = {
                id: U.uid('cal'),
                visitaId: visita.id,
                clienteId: contrato.clienteId,
                estrellas,
                comentario: estrellas <= 2 ? 'El servicio no cumplió lo esperado, faltó prolijidad.' : 'Buen trabajo, todo quedó impecable.',
                creada: visita.fechaEfectuada,
              };
              calificaciones.push(cal);
              visita.calificacionId = cal.id;
            }
          } else if (estado === 'reagendada') {
            visita.historialEstados.push({ estado: 'reagendada', fecha: fechaISO + 'T09:00:00', usuario: tecnico ? tecnico.nombre : 'Técnico', motivo: motivoReagendamiento });
          }

          visitas.push(visita);
        }
      });
    });

    // Garantiza que cada técnico tenga al menos una visita "hoy" en su ruta:
    // sin esto, la distribución de fechas por contrato/piscina podía dejar a
    // algún técnico sin nada que mostrar en /tecnico el día que se abra la demo.
    const hoyISO = U.toISODate(hoy);
    empleados.filter((e) => e.cargo === 'tecnico').forEach((t) => {
      const tieneVisitaHoy = visitas.some((v) => v.empleadoId === t.id && v.fechaProgramada === hoyISO);
      if (tieneVisitaHoy) return;
      const candidatas = visitas.filter((v) => v.empleadoId === t.id && v.fechaProgramada > hoyISO)
        .sort((a, b) => a.fechaProgramada.localeCompare(b.fechaProgramada));
      if (candidatas[0]) {
        candidatas[0].fechaProgramada = hoyISO;
        candidatas[0].estado = 'pendiente';
      }
    });

    // Un par de incidencias de ejemplo, ligadas a visitas efectuadas reales.
    const visitasParaIncidencia = visitas.filter((v) => v.estado === 'efectuada').slice(0, 5);
    const ejemplosIncidencia = [
      { desc: 'Revisión de bomba: ruido extraño al encender, se recomienda mantención preventiva.', estado: 'en_gestion' },
      { desc: 'Fuga menor detectada en cañería de retorno.', estado: 'reportada' },
      { desc: 'Reja de seguridad con bisagra suelta, riesgo para menores.', estado: 'resuelta' },
      { desc: 'Filtro con desgaste visible en empaquetadura.', estado: 'reportada' },
    ];
    ejemplosIncidencia.forEach((ej, i) => {
      const visita = visitasParaIncidencia[i];
      if (!visita) return;
      incidencias.push({
        id: U.uid('inc'),
        visitaId: visita.id,
        empleadoId: visita.empleadoId,
        descripcion: ej.desc,
        fotoDataUrl: null,
        estado: ej.estado,
        creada: visita.fechaEfectuada || (visita.fechaProgramada + 'T12:00:00'),
      });
    });

    const turnos = [
      { id: 'tur1', empleadoId: 'emp_tec1', sectorId: 'sec1', fechaInicio: U.toISODate(U.addDays(hoy, -10)), fechaFin: U.toISODate(U.addDays(hoy, 80)), estacion: 'invierno' },
      { id: 'tur2', empleadoId: 'emp_tec6', sectorId: 'sec1', fechaInicio: U.toISODate(U.addDays(hoy, -10)), fechaFin: U.toISODate(U.addDays(hoy, 80)), estacion: 'invierno' },
      { id: 'tur3', empleadoId: 'emp_tec2', sectorId: 'sec2', fechaInicio: U.toISODate(U.addDays(hoy, -10)), fechaFin: U.toISODate(U.addDays(hoy, 80)), estacion: 'invierno' },
      { id: 'tur4', empleadoId: 'emp_tec3', sectorId: 'sec3', fechaInicio: U.toISODate(U.addDays(hoy, -10)), fechaFin: U.toISODate(U.addDays(hoy, 80)), estacion: 'invierno' },
      { id: 'tur5', empleadoId: 'emp_tec4', sectorId: 'sec4', fechaInicio: U.toISODate(U.addDays(hoy, -10)), fechaFin: U.toISODate(U.addDays(hoy, 80)), estacion: 'invierno' },
      { id: 'tur6', empleadoId: 'emp_tec5', sectorId: 'sec5', fechaInicio: U.toISODate(U.addDays(hoy, -10)), fechaFin: U.toISODate(U.addDays(hoy, 80)), estacion: 'invierno' },
    ];

    // Facturación de los 2 meses anteriores, en base a visitas Efectuadas.
    const facturas = [];
    const facturaDetalles = [];
    for (let mesAtras = 2; mesAtras >= 1; mesAtras--) {
      const refFecha = U.addDays(hoy, -mesAtras * 30);
      const mes = refFecha.getMonth() + 1;
      const anio = refFecha.getFullYear();
      contratos.filter((c) => c.estado !== 'cancelado').forEach((contrato) => {
        const visitasPeriodo = visitas.filter((v) => {
          if (v.contratoId !== contrato.id || v.estado !== 'efectuada') return false;
          const f = new Date(v.fechaProgramada);
          return f.getMonth() + 1 === mes && f.getFullYear() === anio;
        });
        if (visitasPeriodo.length === 0) return;
        const montoTotal = visitasPeriodo.reduce((acc, v) => acc + v.precioVisita, 0);
        const factura = {
          id: U.uid('fac'),
          contratoId: contrato.id,
          clienteId: contrato.clienteId,
          mes,
          anio,
          montoTotal,
          estado: mesAtras === 2 ? 'pagada' : (rng() < 0.8 ? 'pagada' : 'pendiente'),
          generadaEn: U.toISODate(U.addDays(refFecha, 30)) + 'T08:00:00',
        };
        facturas.push(factura);
        visitasPeriodo.forEach((v) => {
          facturaDetalles.push({
            id: U.uid('fd'), facturaId: factura.id, visitaId: v.id, monto: v.precioVisita,
            descripcion: 'Visita de mantención ' + U.formatDateEs(v.fechaProgramada),
          });
        });
      });
    }

    return {
      version: 1,
      sectores, tiposMantencion, empleados, clientes, piscinas, contratos, usuarios,
      visitas, incidencias, calificaciones, turnos, facturas, facturaDetalles,
      auditLog, notificaciones: [],
    };
  }

  return { cargar, guardar, restablecer };
})();
