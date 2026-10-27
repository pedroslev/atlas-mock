import {
  variablesPlantilla,
  type CanalPlantilla,
  type Plantilla,
} from "@/lib/mock-data";

// Plantillas de mensajes (ATLAS-1191): el contenido se escribe una vez con
// formato básico y variables, y acá se traduce a lo que soporta cada canal.
//
// Formato aceptado en el contenido:
//   **negrita**   _cursiva_   líneas que empiezan con "- " (lista)
//   {{clave}}     variable (ver variablesPlantilla en mock-data)

const RE_VARIABLE = /\{\{\s*([a-zA-Z]+)\s*\}\}/g;

/** Claves de variable usadas en el contenido (y el asunto), sin repetir. */
export function variablesUsadas(contenido: string, asunto?: string) {
  const claves = new Set<string>();
  for (const texto of [contenido, asunto ?? ""]) {
    for (const m of texto.matchAll(RE_VARIABLE)) claves.add(m[1]);
  }
  return Array.from(claves);
}

/** Datos del cliente/campaña/asesor con los que se resuelve una plantilla. */
export type DatosVariables = Partial<Record<string, string>>;

export const datosEjemplo: DatosVariables = Object.fromEntries(
  variablesPlantilla.map((v) => [v.clave, v.ejemplo])
);

export type VariableSinDato = { clave: string };

/**
 * Reemplaza las variables por el dato real; si falta, por el valor de
 * respaldo. Devuelve también las variables que quedaron sin dato ni
 * respaldo: nunca se envía un mensaje con una variable sin resolver, así que
 * el redactor avisa antes de enviar.
 */
export function resolverVariables(
  texto: string,
  datos: DatosVariables,
  respaldos: Record<string, string>
): { texto: string; sinDato: string[] } {
  const sinDato: string[] = [];
  const resultado = texto.replace(RE_VARIABLE, (_, clave: string) => {
    const dato = datos[clave];
    if (dato !== undefined && dato !== "") return dato;
    if (clave in respaldos) return respaldos[clave];
    sinDato.push(clave);
    return "";
  });
  // Un respaldo vacío puede dejar dobles espacios ("Hola , ¿cómo") — se limpian.
  return {
    texto: resultado.replace(/[ \t]{2,}/g, " ").replace(/ ,/g, ","),
    sinDato,
  };
}

/** Quita el formato: lo que recibe un canal de texto plano (SMS). */
export function aTextoPlano(contenido: string) {
  return contenido
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/^- /gm, "• ");
}

/** Formato de WhatsApp/chat: *negrita* y _cursiva_, viñetas con "•". */
export function aFormatoChat(contenido: string) {
  return contenido.replace(/\*\*(.+?)\*\*/g, "*$1*").replace(/^- /gm, "• ");
}

export type Segmento = { texto: string; negrita?: boolean; cursiva?: boolean };

/** Parte una línea en segmentos con formato, para dibujarla con énfasis. */
export function segmentar(linea: string): Segmento[] {
  const segmentos: Segmento[] = [];
  const re = /\*\*(.+?)\*\*|_(.+?)_/g;
  let ultimo = 0;
  for (const m of linea.matchAll(re)) {
    if (m.index! > ultimo) segmentos.push({ texto: linea.slice(ultimo, m.index) });
    if (m[1] !== undefined) segmentos.push({ texto: m[1], negrita: true });
    else segmentos.push({ texto: m[2], cursiva: true });
    ultimo = m.index! + m[0].length;
  }
  if (ultimo < linea.length) segmentos.push({ texto: linea.slice(ultimo) });
  return segmentos;
}

/** Texto final que recibe el cliente por un canal dado. */
export function renderizarParaCanal(
  plantilla: Pick<Plantilla, "contenido" | "respaldos">,
  canal: CanalPlantilla,
  datos: DatosVariables
) {
  const { texto, sinDato } = resolverVariables(
    plantilla.contenido,
    datos,
    plantilla.respaldos
  );
  if (canal === "sms") return { texto: aTextoPlano(texto), sinDato };
  if (canal === "chat") return { texto: aFormatoChat(texto), sinDato };
  return { texto, sinDato };
}
