import type { NamespaceDict } from "@/lib/i18n/dict/types";

// Filtro de clientes: el mismo en el listado de Clientes y en la Entrada /
// Salida de la estrategia de salida (ATLAS-1186, a validar con Pedro).
export const filtro: NamespaceDict = {
  es: {
    y: "y",
    campo: "Campo",
    operador: "Condición",
    valor: "Valor",
    elegir: "Elegí…",
    dias: "días",
    agregar: "Agregar condición",
    quitar: "Quitar condición",
    "op.tiene": "tiene",
    "op.noTiene": "no tiene",
    "op.es": "es",
    "op.noEs": "no es",
    "op.contiene": "contiene",
    "op.mayorIgual": "es mayor o igual a",
    "op.menorIgual": "es menor o igual a",
    "op.proximosDias": "es dentro de los próximos",
    "op.haceMasDias": "fue hace más de",
    "op.antesDe": "es antes del",
    "op.despuesDe": "es después del",
    cumplenHoy: "Hoy cumplen {n} de {total} clientes.",
  },
  en: {},
  pt: {},
  ca: {},
};
