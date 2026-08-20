// Agente logueado en el pad (Hermes) — tenant único "Banco Sur". El resto de
// los datos mock del pad (llamada, cola, historial, etc.) vive en
// src/lib/pad-mock/data.ts; esto es lo único que sigue usando el navbar
// compartido (pad-header.tsx) del prototipo anterior.

export const AGENTE_PAD_ID = "ag-1";
export const agentePad = {
  id: AGENTE_PAD_ID,
  nombre: "Marina Acosta",
  iniciales: "MA",
  email: "marina.acosta@bancosur.com",
} as const;
