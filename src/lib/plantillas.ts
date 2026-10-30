import {
  agentes,
  gruposTrabajo,
  tipoRenderDeCanal,
  type CanalPlantilla,
  type Plantilla,
} from "@/lib/mock-data";
import { camposCliente, clientes, permisoCampo } from "@/lib/mock-clientes";

// Plantillas de mensajes (ATLAS-1191): el contenido se escribe una vez con
// formato básico, variables y archivos, y acá se traduce a lo que soporta
// cada canal.
//
// Formato aceptado en el contenido (el mínimo común de WhatsApp, chat web y
// email; ver propuesta §2.7):
//   **negrita**   _cursiva_   ~~tachado~~
//   líneas que empiezan con "- " (lista) o "1. " (lista numerada)
//   [texto](url)  enlace: con texto en chat web y email; en WhatsApp y los
//                 canales planos sale "texto (url)"
//   {{cliente.campo}} {{campania.nombre}} {{asesor.nombre}}  variables (ver
//                 variablesPlantilla más abajo); los datos del cliente siempre
//                 empiezan con "cliente."
//   emojis: se escriben tal cual, funcionan en todos los canales
//   [[archivo:nombre.pdf]]  un archivo de la plantilla, en su propia línea.
//     En chat/WhatsApp se envía como mensaje aparte en ese punto (texto,
//     archivo, texto); en email el texto es el cuerpo y el archivo va
//     adjunto; SMS no admite archivos y se envía solo el texto.

// Las claves admiten letras, números, guion bajo y punto (cliente.nombre).
const RE_VARIABLE = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;

/** Prefijo canónico de toda variable con dato de cliente. */
export const PREFIJO_CLIENTE = "cliente.";

// --- Catálogo de variables ---------------------------------------------------
//
// Las variables del cliente son los campos de la ficha del cliente (datos
// básicos, formas de contacto e información adicional, módulo Clientes). A
// quien arma la plantilla se le ofrecen solo los campos que su grupo de
// trabajo puede VER en la ficha (solapa "Ficha del cliente" del grupo); si
// está en varios grupos, la unión. Las etiquetas y las redes no son texto y
// quedan afuera. Campaña y asesor se ofrecen siempre.

export type OrigenVariable =
  | "clienteBasicos"
  | "clienteContacto"
  | "clienteAdicional"
  | "campania"
  | "asesor";

export type VariablePlantilla = {
  clave: string;
  origen: OrigenVariable;
  /** Etiqueta visible para los campos del cliente (la misma de la ficha). */
  nombre?: string;
  /** Valor con el que se arma la vista previa. */
  ejemplo: string;
  /** Campo de la ficha del cliente del que sale (para el permiso por grupo). */
  campoId?: string;
};

// Clave (sin el prefijo "cliente.") de cada campo de la ficha. Los campos de
// información adicional usan un nombre corto en vez de su id interno.
const CLAVE_POR_CAMPO: Record<string, string> = {
  tipoDoc: "tipo_identificacion",
  nroDoc: "numero_identificacion",
  idExterno: "id_externo",
  "campo-producto": "producto",
  "campo-cuenta": "cuenta",
  "campo-deuda": "deuda",
  "campo-mora": "mora",
  "campo-vto": "vencimiento",
  "campo-sucursal": "sucursal",
};

const ORIGEN_POR_GRUPO: Record<string, OrigenVariable> = {
  basicos: "clienteBasicos",
  contacto: "clienteContacto",
  adicional: "clienteAdicional",
};

function ejemploDeCampo(campoId: string, nombre: string): string {
  const c = clientes[0];
  switch (campoId) {
    case "nombre": return c.nombre;
    case "apellido": return c.apellido;
    case "tipoDoc": return c.tipoDoc;
    case "nroDoc": return c.nroDoc;
    case "idExterno": return c.idExterno ?? "";
    case "telefono": return c.formasContacto.find((f) => f.tipo === "telefono" && f.principal)?.valor ?? c.formasContacto.find((f) => f.tipo === "telefono")?.valor ?? "";
    case "email": return c.formasContacto.find((f) => f.tipo === "email")?.valor ?? "";
    default: return c.infoAdicional[nombre] ?? "";
  }
}

/** Todas las variables del tenant (para etiquetas y vista previa). */
export const variablesPlantilla: VariablePlantilla[] = [
  ...camposCliente
    .filter((c) => c.grupo !== "etiquetas" && c.tipo !== "redes")
    .map((c) => ({
      clave: PREFIJO_CLIENTE + (CLAVE_POR_CAMPO[c.id] ?? c.id),
      origen: ORIGEN_POR_GRUPO[c.grupo],
      nombre: c.nombre,
      ejemplo: ejemploDeCampo(c.id, c.nombre),
      campoId: c.id,
    })),
  { clave: "campania.nombre", origen: "campania", ejemplo: "Cobranzas Activa PCP" },
  { clave: "asesor.nombre", origen: "asesor", ejemplo: "Ana" },
];

/** Las variables que puede usar un usuario: lo que su grupo ve en la ficha. */
export function variablesVisiblesPara(usuarioId: string): VariablePlantilla[] {
  const grupos = gruposTrabajo.filter((g) => g.usuarioIds.includes(usuarioId));
  return variablesPlantilla.filter(
    (v) => !v.campoId || grupos.some((g) => permisoCampo(g.id, v.campoId!).ver)
  );
}

/** Usuario logueado del mock (el mismo que muestra el header). */
export const usuarioActualId = agentes[0].id;

/** Etiqueta visible de una variable: la de la ficha para el cliente, traducida para el resto. */
export function nombreVariable(clave: string, t: (k: string) => string): string {
  const v = variablesPlantilla.find((x) => x.clave === clave);
  if (!v) return clave;
  return v.nombre ?? t(`plantillas.variable.${clave}`);
}
const RE_ARCHIVO = /^\s*\[\[archivo:([^\]]+)\]\]\s*$/gm;

/** Marca que se inserta en el texto para un archivo. */
export function marcaArchivo(nombre: string) {
  return `[[archivo:${nombre}]]`;
}

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

/**
 * Reemplaza las variables por el dato real. Si el dato falta, la variable
 * queda visible tal cual ({{cliente.nombre}}), igual que en el editor, y se devuelve
 * en `sinDato`: nunca se envía un mensaje con una variable sin resolver, así
 * que el redactor avisa y el asesor la completa a mano.
 */
export function resolverVariables(
  texto: string,
  datos: DatosVariables,
  opciones: {
    /** Transforma cada dato antes de insertarlo (p. ej. escapar HTML). */
    transformar?: (dato: string) => string;
    /** Qué poner cuando falta el dato (por defecto, la marca tal cual). */
    faltante?: (clave: string, marca: string) => string;
  } = {}
): { texto: string; sinDato: string[] } {
  const sinDato: string[] = [];
  const resultado = texto.replace(RE_VARIABLE, (marca, clave: string) => {
    const dato = datos[clave];
    if (dato !== undefined && dato !== "") return opciones.transformar ? opciones.transformar(dato) : dato;
    if (!sinDato.includes(clave)) sinDato.push(clave);
    return opciones.faltante ? opciones.faltante(clave, marca) : marca;
  });
  return { texto: resultado, sinDato };
}

/**
 * Marcador que reemplaza a una variable que no se pudo resolver en Hermes:
 * el nombre del campo en mayúsculas y sin acentos, entre corchetes
 * ([NOMBRE], [NUMERO DE IDENTIFICACION]). Los datos del cliente salen sin el
 * prefijo "cliente."; campaña y asesor conservan su grupo ([CAMPANIA NOMBRE]).
 */
export function marcadorFaltante(clave: string): string {
  const campo = variablesPlantilla.find((v) => v.clave === clave)?.nombre;
  const base = campo ?? (clave.startsWith(PREFIJO_CLIENTE) ? clave.slice(PREFIJO_CLIENTE.length) : clave);
  const limpio = base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_.]+/g, " ")
    .trim()
    .toUpperCase();
  return `[${limpio}]`;
}

/**
 * Variables que siguen pendientes en un texto de Hermes: las que `datos` no
 * puede resolver y cuyo marcador ([NOMBRE]) todavía está literal en el texto.
 * Al reemplazarlo a mano, deja de estar pendiente.
 */
export function variablesPendientes(texto: string, datos: DatosVariables): string[] {
  return variablesPlantilla
    .filter((v) => !datos[v.clave] && texto.includes(marcadorFaltante(v.clave)))
    .map((v) => v.clave);
}

/** Quita las marcas de archivo (email y SMS: el archivo no va en el texto). */
export function quitarArchivos(contenido: string) {
  return contenido.replace(RE_ARCHIVO, "").replace(/\n{3,}/g, "\n\n").trim();
}

export type ParteChat =
  | { tipo: "texto"; texto: string }
  | { tipo: "archivo"; nombre: string };

/**
 * Cómo sale por chat/WhatsApp: una secuencia de mensajes. Cada archivo corta
 * el texto y va como mensaje propio en ese punto.
 */
export function partesChat(contenido: string): ParteChat[] {
  const partes: ParteChat[] = [];
  let ultimo = 0;
  for (const m of contenido.matchAll(RE_ARCHIVO)) {
    const antes = contenido.slice(ultimo, m.index).trim();
    if (antes) partes.push({ tipo: "texto", texto: antes });
    partes.push({ tipo: "archivo", nombre: m[1].trim() });
    ultimo = m.index! + m[0].length;
  }
  const resto = contenido.slice(ultimo).trim();
  if (resto) partes.push({ tipo: "texto", texto: resto });
  return partes;
}

/** Quita el formato: lo que recibe un canal de texto plano (SMS y redes). */
export function aTextoPlano(contenido: string) {
  return contenido
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/(^|[^\w])_(.+?)_(?!\w)/g, "$1$2")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/^- /gm, "• ");
}

/** Formato de WhatsApp/chat: *negrita*, _cursiva_, ~tachado~, viñetas con "•", enlace como "texto (url)". */
export function aFormatoChat(contenido: string) {
  return contenido
    .replace(/\*\*(.+?)\*\*/g, "*$1*")
    .replace(/~~(.+?)~~/g, "~$1~")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/^- /gm, "• ");
}

export type Segmento = {
  texto: string;
  negrita?: boolean;
  cursiva?: boolean;
  tachado?: boolean;
  /** Enlace: `texto` es lo visible, `url` el destino. */
  url?: string;
};

/** Parte una línea en segmentos con formato, para dibujarla con énfasis. */
export function segmentar(linea: string): Segmento[] {
  const segmentos: Segmento[] = [];
  const re = /\*\*(.+?)\*\*|~~(.+?)~~|\[([^\]]+)\]\(([^)]+)\)|_(.+?)_/g;
  let ultimo = 0;
  for (const m of linea.matchAll(re)) {
    if (m.index! > ultimo) segmentos.push({ texto: linea.slice(ultimo, m.index) });
    if (m[1] !== undefined) segmentos.push({ texto: m[1], negrita: true });
    else if (m[2] !== undefined) segmentos.push({ texto: m[2], tachado: true });
    else if (m[3] !== undefined) segmentos.push({ texto: m[3], url: m[4] });
    else segmentos.push({ texto: m[5], cursiva: true });
    ultimo = m.index! + m[0].length;
  }
  if (ultimo < linea.length) segmentos.push({ texto: linea.slice(ultimo) });
  return segmentos;
}

/** Línea de lista: "- " (viñeta) o "1. " (numerada). */
export function tipoDeLinea(linea: string): { tipo: "vineta" | "numero" | "texto"; marcador: string; texto: string } {
  const num = linea.match(/^(\d+)\. (.*)$/);
  if (num) return { tipo: "numero", marcador: `${num[1]}.`, texto: num[2] };
  if (linea.startsWith("- ")) return { tipo: "vineta", marcador: "•", texto: linea.slice(2) };
  return { tipo: "texto", marcador: "", texto: linea };
}

/**
 * Texto final que recibe el cliente por un canal dado. En chat (y redes), cada archivo
 * queda como una línea "📎 nombre" (en el redactor de Hermes se ve así y al
 * enviar sale como mensaje aparte); en email y SMS se quita del texto.
 */
export function renderizarParaCanal(
  plantilla: Pick<Plantilla, "contenido">,
  canal: CanalPlantilla,
  datos: DatosVariables
) {
  // En Hermes lo que no se puede resolver queda como [NOMBRE] (ver marcadorFaltante).
  const { texto, sinDato } = resolverVariables(plantilla.contenido, datos, {
    faltante: (clave) => marcadorFaltante(clave),
  });
  const tipo = tipoRenderDeCanal(canal);
  if (tipo === "sms") return { texto: aTextoPlano(quitarArchivos(texto)), sinDato };
  if (tipo === "plano") return { texto: aTextoPlano(texto.replace(RE_ARCHIVO, "📎 $1")), sinDato };
  if (tipo === "chat")
    return { texto: aFormatoChat(texto.replace(RE_ARCHIVO, "📎 $1")), sinDato };
  return { texto: quitarArchivos(texto), sinDato };
}
