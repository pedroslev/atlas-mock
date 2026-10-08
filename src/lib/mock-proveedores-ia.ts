// Claves de los proveedores de IA por región (cluster) — ADR-DATOS-003.
// Una clave por cuenta de proveedor y por cluster: se carga y se rota desde
// Zeus, que la propaga al OpenBao del cluster. Zeus nunca la vuelve a mostrar:
// de cada clave solo se conocen los últimos 4 caracteres y cuándo se rotó.

export type ProveedorIa = {
  id: string;
  nombre: string;
};

// Proveedores que consume la plataforma hoy.
export const proveedoresIa: ProveedorIa[] = [
  { id: "deepgram", nombre: "Deepgram" },
  { id: "elevenlabs", nombre: "ElevenLabs" },
  { id: "google", nombre: "Google" },
  { id: "openai", nombre: "OpenAI" },
];

// Clave cargada de un proveedor en una región.
export type ClaveProveedorIa = {
  regionId: string;
  proveedorId: string;
  /** Últimos 4 caracteres, lo único que Zeus guarda para reconocerla. */
  finalizacion: string;
  /** Última carga o rotación (ISO-8601). */
  rotadaEl: string;
};

export const clavesProveedoresIa: ClaveProveedorIa[] = [
  { regionId: "region-ar", proveedorId: "deepgram", finalizacion: "a91f", rotadaEl: "2026-09-02T13:20:00Z" },
  { regionId: "region-ar", proveedorId: "elevenlabs", finalizacion: "7c2e", rotadaEl: "2026-08-14T10:05:00Z" },
  { regionId: "region-ar", proveedorId: "openai", finalizacion: "Qx4m", rotadaEl: "2026-07-30T18:42:00Z" },
  { regionId: "region-mx", proveedorId: "deepgram", finalizacion: "e03b", rotadaEl: "2026-09-21T09:10:00Z" },
  { regionId: "region-mx", proveedorId: "google", finalizacion: "kP9z", rotadaEl: "2026-09-21T09:12:00Z" },
];

// Claves de una región, indexadas por proveedor.
export function clavesDeRegion(regionId: string): Record<string, ClaveProveedorIa> {
  return Object.fromEntries(
    clavesProveedoresIa
      .filter((c) => c.regionId === regionId)
      .map((c) => [c.proveedorId, c])
  );
}
