// Formato de los mensajes del chat — mismo conjunto y misma escritura que
// las plantillas de mensajes (ATLAS-1191, src/lib/plantillas.ts), para que
// una plantilla con formato se vea igual al cargarla en el chat:
//   **negrita**, _cursiva_, ~~tachado~~, [texto](url),
//   "- " al inicio de la línea (viñeta) y "1. " (lista numerada).
// Cuando las dos branches se junten, este archivo y src/lib/plantillas.ts
// pueden quedar en uno solo.

export type Segmento = {
  texto: string;
  negrita?: boolean;
  cursiva?: boolean;
  tachado?: boolean;
  /** Enlace: `texto` es lo visible, `url` el destino. */
  url?: string;
};

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

export function tipoDeLinea(linea: string): { tipo: "vineta" | "numero" | "texto"; marcador: string; texto: string } {
  const num = linea.match(/^(\d+)\. (.*)$/);
  if (num) return { tipo: "numero", marcador: `${num[1]}.`, texto: num[2] };
  if (linea.startsWith("- ")) return { tipo: "vineta", marcador: "•", texto: linea.slice(2) };
  return { tipo: "texto", marcador: "", texto: linea };
}
