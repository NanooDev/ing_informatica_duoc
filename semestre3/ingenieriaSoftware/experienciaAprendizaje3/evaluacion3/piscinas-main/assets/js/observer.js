/*
 * Patrón Observer aplicado a los cambios de estado de una Visita.
 *
 * `visitaSubject` es el "sujeto observable": cuando una visita pasa a
 * Efectuada o Reagendada, alguien la notifica (`notificar`) y todos los
 * observadores suscritos reaccionan sin que el código que originó el
 * cambio (el formulario del técnico) conozca quiénes son ni qué hacen.
 *
 * Aquí se suscriben dos observadores: uno que registra una notificación
 * para Administración y otro para el Supervisor de la zona. Agregar un
 * tercer observador (p.ej. enviar un correo) no requiere tocar el resto.
 */
window.App = window.App || {};

App.Observer = (function () {
  function Sujeto() {
    this.observadores = [];
  }
  Sujeto.prototype.suscribir = function (fn) {
    this.observadores.push(fn);
  };
  Sujeto.prototype.notificar = function (evento) {
    this.observadores.forEach((fn) => fn(evento));
  };

  const visitaSubject = new Sujeto();

  // Observador 1: deja una notificación visible para Administración.
  visitaSubject.suscribir(function notificarAdministracion(evento) {
    const db = App.DB.cargar();
    db.notificaciones.unshift({
      id: App.Utils.uid('not'),
      destinatarioRol: 'administrador',
      tipo: evento.tipo,
      mensaje: evento.mensaje,
      visitaId: evento.visita.id,
      leida: false,
      creada: new Date().toISOString(),
    });
    db.notificaciones = db.notificaciones.slice(0, 80);
    App.DB.guardar(db);
  });

  // Observador 2: notificación dirigida al supervisor del sector de la visita.
  visitaSubject.suscribir(function notificarSupervisorZona(evento) {
    const db = App.DB.cargar();
    const piscina = db.piscinas.find((p) => p.id === evento.visita.piscinaId);
    const supervisor = piscina
      ? db.empleados.find((e) => e.cargo === 'supervisor' && e.sectorId === piscina.sectorId)
      : null;
    if (!supervisor) return;
    db.notificaciones.unshift({
      id: App.Utils.uid('not'),
      destinatarioRol: 'supervisor',
      destinatarioEmpleadoId: supervisor.id,
      tipo: evento.tipo,
      mensaje: evento.mensaje,
      visitaId: evento.visita.id,
      leida: false,
      creada: new Date().toISOString(),
    });
    db.notificaciones = db.notificaciones.slice(0, 80);
    App.DB.guardar(db);
  });

  return { Sujeto, visitaSubject };
})();
