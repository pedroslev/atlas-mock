// Sincroniza el modo básico (filtros de la cabecera) con el avanzado
// (consulta escrita). ATLAS-1186, a validar con Pedro.
//
// Básico → avanzado: siempre se puede (cada filtro tiene su forma escrita).
// Avanzado → básico: solo si la consulta son condiciones unidas con Y y cada
// campo se puede mostrar en su filtro de cabecera. Si no, se avisa (como
// Jira con "la consulta es demasiado compleja para el modo básico").

import type { MRT_ColumnFiltersState, MRT_SortingState } from "material-react-table";
import type { TranslateFn } from "@/lib/i18n";
import { etiquetasCatalogo } from "@/lib/mock-clientes";
import {
  CAMPOS_CONSULTA,
  aFecha,
  escribirCampo,
  escribirValor,
  type Condicion,
  type Consulta,
  type Nodo,
} from "@/lib/consulta-clientes";
import {
  conTexto,
  textoEtiquetas,
  textoFecha,
  textoLista,
  textoRango,
  type ValorEtiquetas,
  type ValorFecha,
  type ValorRango,
} from "./filtros-cabecera";

const campoPorId = (id: string) => CAMPOS_CONSULTA.find((c) => c.id === id);

// ── Básico → avanzado ──────────────────────────────────────────────────────

export function filtrosAConsulta(
  filtros: MRT_ColumnFiltersState,
  orden: MRT_SortingState
): string {
  const partes: string[] = [];
  for (const f of filtros) {
    const campo = campoPorId(f.id);
    if (!campo) continue;
    const n = escribirCampo(campo);
    const v = f.value;
    switch (campo.tipo) {
      case "etiquetas": {
        const e = v as ValorEtiquetas;
        const nombres = e.ids.map((id) => etiquetasCatalogo.find((x) => x.id === id)?.nombre ?? id);
        partes.push(`${n} ${e.modo === "tiene" ? "EN" : "NO EN"} (${nombres.map(escribirValor).join(", ")})`);
        break;
      }
      case "numero":
      case "moneda": {
        const r = v as ValorRango;
        if (r.min) partes.push(`${n} >= ${r.min}`);
        if (r.max) partes.push(`${n} <= ${r.max}`);
        break;
      }
      case "fecha": {
        const d = v as ValorFecha;
        if (d.modo === "proximos") partes.push(`${n} >= hoy Y ${n} <= +${d.dias}d`);
        else if (d.modo === "hace") partes.push(`${n} <= -${d.dias}d`);
        else {
          if (d.desde) partes.push(`${n} >= ${d.desde}`);
          if (d.hasta) partes.push(`${n} <= ${d.hasta}`);
        }
        break;
      }
      case "lista": {
        const l = v as string[];
        partes.push(l.length === 1 ? `${n} = ${escribirValor(l[0])}` : `${n} EN (${l.map(escribirValor).join(", ")})`);
        break;
      }
      case "booleano":
        partes.push(`${n} = ${escribirValor(String(v))}`);
        break;
      default:
        partes.push(`${n} CONTIENE ${escribirValor(String(v))}`);
    }
  }
  let texto = partes.join(" Y ");
  const o = orden[0];
  const campoOrden = o && campoPorId(o.id);
  if (campoOrden) texto += `${texto ? " " : ""}ORDENAR POR ${escribirCampo(campoOrden)} ${o.desc ? "DESC" : "ASC"}`;
  return texto;
}

// ── Avanzado → básico ──────────────────────────────────────────────────────

export type ResultadoBasico =
  | { ok: true; filtros: MRT_ColumnFiltersState; orden: MRT_SortingState }
  | { ok: false; motivo: string };

export function consultaAFiltros(consulta: Consulta, t: TranslateFn): ResultadoBasico {
  const orden: MRT_SortingState = consulta.orden
    ? [{ id: consulta.orden.campo.id, desc: consulta.orden.desc }]
    : [];
  if (!consulta.filtro) return { ok: true, filtros: [], orden };

  // Solo condiciones unidas con Y.
  const condiciones: Condicion[] = [];
  const juntar = (n: Nodo): boolean => {
    if (n.tipo === "condicion") return condiciones.push(n) > 0;
    if (n.tipo === "y") return n.hijos.every(juntar);
    return false;
  };
  if (!juntar(consulta.filtro)) {
    return { ok: false, motivo: t("clientes.consulta.noBasico.compleja") };
  }

  const porCampo = new Map<string, Condicion[]>();
  for (const c of condiciones) porCampo.set(c.campo.id, [...(porCampo.get(c.campo.id) ?? []), c]);

  const filtros: MRT_ColumnFiltersState = [];
  for (const [id, conds] of porCampo) {
    const campo = conds[0].campo;
    const no = { ok: false as const, motivo: t("clientes.consulta.noBasico.campo", { campo: campo.nombre }) };
    switch (campo.tipo) {
      case "etiquetas": {
        if (conds.length !== 1) return no;
        const c = conds[0];
        const ids = c.valores.map(
          (v) => etiquetasCatalogo.find((e) => e.nombre.toLowerCase() === v.toLowerCase())?.id ?? v
        );
        const valor: ValorEtiquetas = { modo: c.operador === "EN" || c.operador === "=" ? "tiene" : "noTiene", ids };
        filtros.push({ id, value: conTexto(valor, textoEtiquetas(valor, t)) });
        break;
      }
      case "numero":
      case "moneda": {
        const r: ValorRango = { min: "", max: "" };
        for (const c of conds) {
          if (c.operador === ">=" && !r.min) r.min = c.valores[0];
          else if (c.operador === "<=" && !r.max) r.max = c.valores[0];
          else if (c.operador === "=" && conds.length === 1) r.min = r.max = c.valores[0];
          else return no;
        }
        filtros.push({ id, value: conTexto(r, textoRango(r, t)) });
        break;
      }
      case "fecha": {
        const ge = conds.find((c) => c.operador === ">=");
        const le = conds.find((c) => c.operador === "<=");
        if (conds.some((c) => c.operador !== ">=" && c.operador !== "<=") || conds.length > 2) return no;
        const rel = (v?: string) => /^([+-])(\d+)d$/i.exec(v ?? "");
        let valor: ValorFecha | null = null;
        const geHoy = ge && ge.valores[0].toLowerCase() === "hoy";
        const leMas = rel(le?.valores[0]);
        const leMenos = rel(le?.valores[0]);
        if (geHoy && leMas && leMas[1] === "+") valor = { modo: "proximos", dias: leMas[2] };
        else if (!ge && leMenos && leMenos[1] === "-") valor = { modo: "hace", dias: leMenos[2] };
        else if ((!ge || !rel(ge.valores[0])) && (!le || !rel(le.valores[0]))) {
          valor = { modo: "entre", desde: ge ? aFecha(ge.valores[0]) ?? "" : "", hasta: le ? aFecha(le.valores[0]) ?? "" : "" };
        }
        if (!valor) return no;
        filtros.push({ id, value: conTexto(valor, textoFecha(valor, t)) });
        break;
      }
      case "lista": {
        if (conds.length !== 1 || (conds[0].operador !== "=" && conds[0].operador !== "EN")) return no;
        const l = [...conds[0].valores];
        filtros.push({ id, value: conTexto(l, textoLista(l, t)) });
        break;
      }
      case "booleano":
        if (conds.length !== 1) return no;
        filtros.push({ id, value: conds[0].valores[0] });
        break;
      default:
        if (conds.length !== 1 || conds[0].operador !== "CONTIENE") return no;
        filtros.push({ id, value: conds[0].valores[0] });
    }
  }
  return { ok: true, filtros, orden };
}
