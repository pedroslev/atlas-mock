// Contenido de la documentación de Olimpo (/documentacion/<pagina>).
//
// Cada página vive en `src/lib/docs/contenido/<pagina>.ts` y exporta su
// contenido por idioma. Los textos largos van acá y no en el diccionario de
// traducciones (`src/lib/i18n/dict`), que está pensado para rótulos cortos. Un
// idioma sin traducción cae a español (ver `contenidoDe` en paginas.ts).

// Un bloque de contenido dentro de una sección.
export type Bloque =
  // Párrafo. Un "\n" adentro es un salto de línea simple (viñetas con "•").
  | { tipo: "p"; texto: string }
  // Subtítulo dentro de la sección (por ejemplo "Opciones" o "Salidas").
  | { tipo: "sub"; texto: string }
  // Lista de definiciones: cada ítem es "Nombre — descripción".
  | { tipo: "lista"; items: string[] }
  // Lista numerada de pasos.
  | { tipo: "pasos"; items: string[] }
  // Ejemplos de código o de expresiones, uno por ítem.
  | { tipo: "codigo"; items: string[] }
  // Aviso destacado: una regla que sorprende o un cuidado.
  | { tipo: "nota"; texto: string };

export type Seccion = {
  // Ancla de la sección (/documentacion/<pagina>#<id>): minúsculas, sin
  // tildes, con guiones; única dentro de la página.
  id: string;
  titulo: string;
  bloques: Bloque[];
};

export type Pagina = {
  titulo: string;
  // Una o dos frases: para qué sirve la sección de Olimpo que documenta.
  resumen: string;
  secciones: Seccion[];
};

// Español obligatorio; el resto de los idiomas es opcional y cae a español.
export type ContenidoPagina = { es: Pagina; en?: Pagina; pt?: Pagina; ca?: Pagina };
