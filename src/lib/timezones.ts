// Catálogo de husos para el selector del cliente. El valor es el nombre IANA;
// el texto es el lugar, para quien usa la pantalla. Mismo catálogo que zeus-front.
export type Huso = { id: string; nombre: string };

export const husos: Huso[] = [
  { id: "America/Argentina/Buenos_Aires", nombre: "Buenos Aires" },
  { id: "America/Argentina/Cordoba", nombre: "Córdoba" },
  { id: "America/Montevideo", nombre: "Montevideo" },
  { id: "America/Asuncion", nombre: "Asunción" },
  { id: "America/Santiago", nombre: "Santiago" },
  { id: "America/La_Paz", nombre: "La Paz" },
  { id: "America/Lima", nombre: "Lima" },
  { id: "America/Bogota", nombre: "Bogotá" },
  { id: "America/Guayaquil", nombre: "Guayaquil" },
  { id: "America/Caracas", nombre: "Caracas" },
  { id: "America/Mexico_City", nombre: "Ciudad de México" },
  { id: "America/Sao_Paulo", nombre: "San Pablo" },
  { id: "America/New_York", nombre: "Nueva York" },
  { id: "America/Los_Angeles", nombre: "Los Ángeles" },
  { id: "Europe/Madrid", nombre: "Madrid" },
  { id: "UTC", nombre: "UTC" },
];
