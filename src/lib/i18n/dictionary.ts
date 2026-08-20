import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
import type { NamespaceDict } from "@/lib/i18n/dict/types";

import { common } from "@/lib/i18n/dict/common";
import { campanias } from "@/lib/i18n/dict/campanias";
import { cuentas } from "@/lib/i18n/dict/cuentas";
import { clasificaciones } from "@/lib/i18n/dict/clasificaciones";
import { marcas } from "@/lib/i18n/dict/marcas";
import { feriados } from "@/lib/i18n/dict/feriados";
import { listas } from "@/lib/i18n/dict/listas";
import { usuarios } from "@/lib/i18n/dict/usuarios";
import { grupos } from "@/lib/i18n/dict/grupos";
import { estados } from "@/lib/i18n/dict/estados";
import { proyectos } from "@/lib/i18n/dict/proyectos";
import { padMock } from "@/lib/i18n/dict/pad-mock";
import { admin } from "@/lib/i18n/dict/admin";
import { perfil } from "@/lib/i18n/dict/perfil";
import { login } from "@/lib/i18n/dict/login";
import { inicio } from "@/lib/i18n/dict/inicio";
import { tour } from "@/lib/i18n/dict/tour";

// Registro de diccionarios. La clave del objeto es el PREFIJO de la clave de
// traducción: `t("campanias.titulo")` busca "titulo" dentro de `campanias`.
const NAMESPACES: Record<string, NamespaceDict> = {
  common,
  campanias,
  cuentas,
  clasificaciones,
  marcas,
  feriados,
  listas,
  usuarios,
  grupos,
  estados,
  proyectos,
  padMock,
  admin,
  perfil,
  login,
  inicio,
  tour,
};

/**
 * Resuelve una clave `"<namespace>.<clave>"` al idioma pedido.
 *
 * Cadena de fallback: idioma pedido → español → la clave misma. Devolver la
 * clave (y no vacío) hace que una traducción faltante se vea en pantalla en vez
 * de dejar un hueco silencioso.
 *
 * Interpolación: los `{placeholder}` del texto se reemplazan con `vars`.
 */
export function translate(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>
): string {
  const dot = key.indexOf(".");
  if (dot === -1) return key;
  const ns = NAMESPACES[key.slice(0, dot)];
  if (!ns) return key;
  const rest = key.slice(dot + 1);

  const raw = ns[locale]?.[rest] ?? ns[DEFAULT_LOCALE]?.[rest] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match
  );
}
