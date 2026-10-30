import type { CanalPlantilla } from "@/lib/mock-data";

// Límites de largo de mensaje por canal, para el contador del editor de
// plantillas y la validación del redactor de Hermes.
//
// Fuente (decisión del Architect, ATLAS-1191):
//   - Chat de Atlas, WhatsApp y Telegram: 4096 caracteres.
//   - Instagram: 1000 BYTES en UTF-8 (un acento ocupa 2 bytes, un emoji 4).
//   - Facebook 2000, TikTok 6000, X 10000, LinkedIn 10000 caracteres.
//   - SMS: por segmentos (GSM-7: 160, o 153 por segmento si hay más de uno;
//     UCS-2: 70, o 67), con tope de 10 segmentos (1530 GSM-7 / 670 UCS-2).
//   - Email: sin tope, no lleva contador.

export type UnidadLimite = "caracteres" | "bytes";

/** Canales con tope fijo (todos menos SMS por segmentos y email sin tope). */
const LIMITES_FIJOS: Partial<Record<CanalPlantilla, { unidad: UnidadLimite; max: number }>> = {
  chat: { unidad: "caracteres", max: 4096 },
  whatsapp: { unidad: "caracteres", max: 4096 },
  telegram: { unidad: "caracteres", max: 4096 },
  instagram: { unidad: "bytes", max: 1000 },
  facebook: { unidad: "caracteres", max: 2000 },
  tiktok: { unidad: "caracteres", max: 6000 },
  x: { unidad: "caracteres", max: 10000 },
  linkedin: { unidad: "caracteres", max: 10000 },
};

export const MAX_SEGMENTOS_SMS = 10;

// Alfabeto básico GSM 03.38 (1 septeto por carácter). Notar que "é" está pero
// "á", "í", "ó" y "ú" no: un solo carácter así obliga a usar UCS-2.
const GSM_BASICO = new Set(
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà"
);
// Extensión GSM 03.38: cada carácter ocupa 2 septetos (escape + carácter).
const GSM_EXTENSION = new Set("^{}\\[~]|€\f");

export type ConteoCanal =
  | {
      tipo: "limite";
      unidad: UnidadLimite;
      usado: number;
      max: number;
      excedido: boolean;
      exceso: number;
    }
  | {
      tipo: "sms";
      codificacion: "GSM-7" | "UCS-2";
      /** Septetos (GSM-7) o unidades UTF-16 (UCS-2). */
      caracteres: number;
      segmentos: number;
      maxCaracteres: number;
      excedido: boolean;
      exceso: number;
    };

/** Cuenta el texto para un canal. Email no tiene tope: devuelve null. */
export function contarParaCanal(canal: CanalPlantilla, texto: string): ConteoCanal | null {
  if (canal === "email") return null;
  if (canal === "sms") return contarSms(texto);
  const limite = LIMITES_FIJOS[canal];
  if (!limite) return null;
  const usado =
    limite.unidad === "bytes"
      ? new TextEncoder().encode(texto).length
      : Array.from(texto).length; // por carácter visible: un emoji cuenta 1
  const exceso = Math.max(0, usado - limite.max);
  return { tipo: "limite", unidad: limite.unidad, usado, max: limite.max, excedido: exceso > 0, exceso };
}

/** Límite en caracteres del canal (para mostrarlo), o null si no tiene. */
export function limiteDeCanal(canal: CanalPlantilla) {
  return LIMITES_FIJOS[canal] ?? null;
}

function contarSms(texto: string): ConteoCanal {
  let septetos = 0;
  let esGsm = true;
  for (const c of texto) {
    if (GSM_BASICO.has(c)) septetos += 1;
    else if (GSM_EXTENSION.has(c)) septetos += 2;
    else {
      esGsm = false;
      break;
    }
  }
  const codificacion = esGsm ? "GSM-7" : "UCS-2";
  // UCS-2 cuenta unidades UTF-16: un emoji ocupa 2.
  const caracteres = esGsm ? septetos : texto.length;
  const [unico, porSegmento] = esGsm ? [160, 153] : [70, 67];
  const segmentos = caracteres === 0 ? 0 : caracteres <= unico ? 1 : Math.ceil(caracteres / porSegmento);
  const maxCaracteres = MAX_SEGMENTOS_SMS * porSegmento;
  const exceso = Math.max(0, caracteres - maxCaracteres);
  return { tipo: "sms", codificacion, caracteres, segmentos, maxCaracteres, excedido: segmentos > MAX_SEGMENTOS_SMS, exceso };
}
