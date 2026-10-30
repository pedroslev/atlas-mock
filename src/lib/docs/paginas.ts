import type { Locale } from "@/lib/i18n";
import type { ContenidoPagina, Pagina } from "@/lib/docs/tipos";
import { contenido as inicio } from "@/lib/docs/contenido/inicio";
import { contenido as campanias } from "@/lib/docs/contenido/campanias";
import { contenido as clientes } from "@/lib/docs/contenido/clientes";
import { contenido as cuentas } from "@/lib/docs/contenido/cuentas";
import { contenido as clasificaciones } from "@/lib/docs/contenido/clasificaciones";
import { contenido as marcas } from "@/lib/docs/contenido/marcas";
import { contenido as plantillas } from "@/lib/docs/contenido/plantillas";
import { contenido as feriados } from "@/lib/docs/contenido/feriados";
import { contenido as listasDeExclusion } from "@/lib/docs/contenido/listas-de-exclusion";
import { contenido as usuarios } from "@/lib/docs/contenido/usuarios";
import { contenido as gruposYRoles } from "@/lib/docs/contenido/grupos-y-roles";
import { contenido as estadosAuxiliares } from "@/lib/docs/contenido/estados-auxiliares";
import { contenido as clavesApi } from "@/lib/docs/contenido/claves-api";
import { contenido as workflows } from "@/lib/docs/contenido/workflows";

// Páginas de la documentación, por slug (/documentacion/<slug>).
export const PAGINAS: Record<string, ContenidoPagina> = {
  inicio,
  campanias,
  clientes,
  cuentas,
  workflows,
  clasificaciones,
  marcas,
  plantillas,
  feriados,
  "listas-de-exclusion": listasDeExclusion,
  usuarios,
  "grupos-y-roles": gruposYRoles,
  "estados-auxiliares": estadosAuxiliares,
  "claves-api": clavesApi,
};

// Categorías del menú de la documentación, en orden. Cada una lista los slugs
// de sus páginas; el título de la categoría sale del diccionario
// `documentacion` (clave `categoria.<id>`).
export const CATEGORIAS: { id: string; paginas: string[] }[] = [
  { id: "primeros-pasos", paginas: ["inicio"] },
  { id: "operacion", paginas: ["campanias", "clientes", "cuentas", "workflows"] },
  { id: "clasificacion", paginas: ["clasificaciones", "marcas", "plantillas"] },
  { id: "calendario", paginas: ["feriados", "listas-de-exclusion"] },
  { id: "personas", paginas: ["usuarios", "grupos-y-roles", "estados-auxiliares"] },
  { id: "configuracion", paginas: ["claves-api"] },
];

// Todos los slugs en el orden del menú: sirve para "anterior" y "siguiente".
export const ORDEN: string[] = CATEGORIAS.flatMap((c) => c.paginas);

// Contenido de una página en el idioma pedido; si no está traducida, en español.
export function contenidoDe(slug: string, locale: Locale): Pagina | undefined {
  const pagina = PAGINAS[slug];
  if (!pagina) return undefined;
  return pagina[locale as keyof ContenidoPagina] ?? pagina.es;
}
