/*
 * Patrón Strategy aplicado al cálculo de precios.
 *
 * `CalculadoraPrecioStrategy` (interfaz implícita en JS) define el contrato
 * que debe cumplir cualquier regla de precio: calcular(precio, contexto).
 * Cada regla de negocio (descuento por volumen, reajuste anual, etc.) se
 * implementa por separado y es intercambiable: agregar una regla nueva no
 * obliga a tocar las demás ni el motor que las combina.
 *
 * `CalculadoraPrecio` es el "contexto" del patrón: recibe una lista de
 * estrategias y las aplica en cadena sobre el precio base del contrato.
 */
window.App = window.App || {};

App.Pricing = (function () {
  // --- Estrategias concretas ---

  const EstrategiaDescuentoVolumen = {
    nombre: 'Descuento por volumen',
    // Más piscinas en el mismo contrato -> mejor precio por visita.
    calcular(precio, contexto) {
      const n = contexto.cantidadPiscinas || 1;
      if (n >= 5) return precio * 0.85;
      if (n >= 3) return precio * 0.90;
      if (n >= 2) return precio * 0.95;
      return precio;
    },
  };

  const EstrategiaReajusteAnual = {
    nombre: 'Reajuste anual',
    // Reajuste compuesto por cada año transcurrido desde el último reajuste.
    calcular(precio, contexto) {
      const PORC_REAJUSTE_ANUAL = 0.04; // referencial, ~IPC
      const anios = Math.floor(contexto.aniosDesdeUltimoReajuste || 0);
      if (anios < 1) return precio;
      return precio * Math.pow(1 + PORC_REAJUSTE_ANUAL, anios);
    },
  };

  // Ejemplo de una tercera estrategia, lista para enchufarse sin modificar
  // las anteriores: recargo por mantención Premium fuera de horario punta.
  const EstrategiaSinAjuste = {
    nombre: 'Sin ajuste adicional',
    calcular(precio) { return precio; },
  };

  // --- Motor / contexto del patrón ---
  function CalculadoraPrecio(estrategias) {
    this.estrategias = estrategias || [];
  }
  CalculadoraPrecio.prototype.calcular = function (precioBase, contexto) {
    return this.estrategias.reduce(
      (precio, estrategia) => estrategia.calcular(precio, contexto),
      precioBase
    );
  };

  const calculadoraEstandar = new CalculadoraPrecio([
    EstrategiaDescuentoVolumen,
    EstrategiaReajusteAnual,
  ]);

  // Precio vigente por visita para un contrato dado.
  function precioVigente(contrato, cantidadPiscinas, hoy) {
    const contexto = {
      cantidadPiscinas: cantidadPiscinas || (contrato.piscinaIds || []).length || 1,
      aniosDesdeUltimoReajuste: App.Utils.diffInYears(contrato.fechaUltimoReajuste, hoy || new Date()),
    };
    return Math.round(calculadoraEstandar.calcular(contrato.precioBase, contexto));
  }

  return {
    EstrategiaDescuentoVolumen,
    EstrategiaReajusteAnual,
    EstrategiaSinAjuste,
    CalculadoraPrecio,
    calculadoraEstandar,
    precioVigente,
  };
})();
