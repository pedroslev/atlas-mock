"use client";

import { useState } from "react";

// Filtros de cabecera de la tabla de Clientes (ATLAS-1186). Copian la idea de
// la tabla de Usuarios de la asignación masiva (ATLAS-1353): cada columna se
// filtra desde su cabecera y los filtros se combinan. Acá el filtro depende
// del TIPO del campo de información adicional (el que se define al importar):
//   número / moneda → entre un mínimo y un máximo
//   fecha           → dentro de los próximos N días, hace más de N días, entre fechas
//   lista           → es uno de (varios valores)
//   texto           → contiene
//   sí / no         → sí o no
//   etiquetas       → tiene / no tiene (una o varias)
// En fechas solo hay rangos (nunca "exactamente en N días"), igual que en la
// entrada de la estrategia de salida.
//
// El valor de cada filtro trae su propio texto (toString), así el aviso del
// ícono de filtro de la cabecera dice "entre 1 y 30" en vez de un objeto.

import type { MRT_Column, MRT_RowData } from "material-react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useT, type TranslateFn } from "@/lib/i18n";
import { etiquetasCatalogo } from "@/lib/mock-clientes";

// ── Valores ──────────────────────────────────────────────────────────────────

export type ValorRango = { min: string; max: string };
export type ValorFecha =
  | { modo: "proximos"; dias: string }
  | { modo: "hace"; dias: string }
  | { modo: "entre"; desde: string; hasta: string };
export type ValorLista = string[];
export type ValorEtiquetas = { modo: "tiene" | "noTiene"; ids: string[] };

const DIA = 24 * 60 * 60 * 1000;

export function aNumero(v: string): number {
  return Number(v.replace(/[^\d,-]/g, "").replace(",", "."));
}

function hoy() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Le da al valor un texto legible sin cambiar lo que se guarda. */
export function conTexto<V extends object>(valor: V, texto: string): V {
  Object.defineProperty(valor, "toString", { value: () => texto, enumerable: false });
  return valor;
}

// ── Cumple / no cumple (filterFn) ──────────────────────────────────────────

export function cumpleRango(dato: string | undefined, v: ValorRango | undefined) {
  if (!v || (!v.min && !v.max)) return true;
  if (!dato) return false;
  const n = aNumero(dato);
  return (!v.min || n >= aNumero(v.min)) && (!v.max || n <= aNumero(v.max));
}

/**
 * `sinDatoEsAntiguo`: para fechas como "Último contacto", el cliente sin
 * fecha (nunca contactado) cuenta como "hace más de N días" (2026-11-17).
 */
export function cumpleFecha(
  dato: string | undefined,
  v: ValorFecha | undefined,
  sinDatoEsAntiguo = false
) {
  if (!v) return true;
  if (!dato) return sinDatoEsAntiguo && v.modo === "hace";
  const fecha = new Date(`${dato}T00:00:00`).getTime();
  const dias = (fecha - hoy().getTime()) / DIA;
  switch (v.modo) {
    case "proximos":
      return !v.dias || (dias >= 0 && dias <= Number(v.dias));
    case "hace":
      return !v.dias || -dias >= Number(v.dias);
    case "entre":
      return (!v.desde || dato >= v.desde) && (!v.hasta || dato <= v.hasta);
  }
}

export function cumpleLista(dato: string | undefined, v: ValorLista | undefined) {
  if (!v || v.length === 0) return true;
  return !!dato && v.includes(dato);
}

export function cumpleEtiquetas(ids: string[], v: ValorEtiquetas | undefined) {
  if (!v || v.ids.length === 0) return true;
  const tiene = ids.some((id) => v.ids.includes(id));
  return v.modo === "tiene" ? tiene : !tiene;
}

// ── Editores (Filter de cada columna) ─────────────────────────────────────

type Props<T extends MRT_RowData> = { column: MRT_Column<T> };

function Contenedor({ children }: { children: React.ReactNode }) {
  return <div className="flex w-64 flex-col gap-2 p-1">{children}</div>;
}

function Limpiar<T extends MRT_RowData>({ column }: Props<T>) {
  const t = useT();
  if (column.getFilterValue() === undefined) return null;
  return (
    <Button
      variant="ghost"
      size="sm"
      className="self-start"
      onClick={() => column.setFilterValue(undefined)}
    >
      {t("clientes.filtroCol.limpiar")}
    </Button>
  );
}

export function FiltroRango<T extends MRT_RowData>({ column }: Props<T>) {
  const t = useT();
  const v = (column.getFilterValue() as ValorRango | undefined) ?? { min: "", max: "" };
  function cambiar(nuevo: ValorRango) {
    column.setFilterValue(
      !nuevo.min && !nuevo.max ? undefined : conTexto(nuevo, textoRango(nuevo, t))
    );
  }
  return (
    <Contenedor>
      <p className="text-xs text-muted-foreground">{t("clientes.filtroCol.entre")}</p>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          placeholder={t("clientes.filtroCol.min")}
          aria-label={t("clientes.filtroCol.min")}
          value={v.min}
          onChange={(e) => cambiar({ ...v, min: e.target.value })}
        />
        <span className="text-sm text-muted-foreground">{t("filtro.y")}</span>
        <Input
          type="number"
          placeholder={t("clientes.filtroCol.max")}
          aria-label={t("clientes.filtroCol.max")}
          value={v.max}
          onChange={(e) => cambiar({ ...v, max: e.target.value })}
        />
      </div>
      <Limpiar column={column} />
    </Contenedor>
  );
}

export function textoRango(v: ValorRango, t: TranslateFn) {
  if (v.min && v.max) return t("clientes.filtroCol.textoEntre", { min: v.min, max: v.max });
  if (v.min) return t("clientes.filtroCol.textoDesde", { min: v.min });
  return t("clientes.filtroCol.textoHasta", { max: v.max });
}

export function FiltroFecha<T extends MRT_RowData>({ column }: Props<T>) {
  const t = useT();
  // Borrador: la opción elegida se mantiene aunque todavía no tenga valor
  // (si no, al elegir «está entre las fechas» volvía a la opción por defecto).
  const [borrador, setBorrador] = useState<ValorFecha>({ modo: "proximos", dias: "" });
  const v = (column.getFilterValue() as ValorFecha | undefined) ?? borrador;
  function cambiar(nuevo: ValorFecha) {
    setBorrador(nuevo);
    const vacio =
      nuevo.modo === "entre" ? !nuevo.desde && !nuevo.hasta : !nuevo.dias;
    column.setFilterValue(vacio ? undefined : conTexto(nuevo, textoFecha(nuevo, t)));
  }
  return (
    <Contenedor>
      <Select
        value={v.modo}
        onValueChange={(modo) =>
          cambiar(
            modo === "entre"
              ? { modo: "entre", desde: "", hasta: "" }
              : { modo: modo as "proximos" | "hace", dias: "dias" in v ? v.dias : "" }
          )
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="proximos">{t("filtro.op.proximosDias")}</SelectItem>
          <SelectItem value="hace">{t("filtro.op.haceMasDias")}</SelectItem>
          <SelectItem value="entre">{t("clientes.filtroCol.entreFechas")}</SelectItem>
        </SelectContent>
      </Select>
      {v.modo === "entre" ? (
        <div className="flex flex-col gap-2">
          <Input
            type="date"
            aria-label={t("clientes.filtro.desde")}
            value={v.desde}
            onChange={(e) => cambiar({ ...v, desde: e.target.value })}
          />
          <Input
            type="date"
            aria-label={t("clientes.filtro.hasta")}
            value={v.hasta}
            onChange={(e) => cambiar({ ...v, hasta: e.target.value })}
          />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            className="w-24"
            aria-label={t("filtro.dias")}
            value={v.dias}
            onChange={(e) => cambiar({ ...v, dias: e.target.value })}
          />
          <span className="text-sm text-muted-foreground">{t("filtro.dias")}</span>
        </div>
      )}
      <Limpiar column={column} />
    </Contenedor>
  );
}

export function textoFecha(v: ValorFecha, t: TranslateFn) {
  if (v.modo === "entre") {
    return t("clientes.filtroCol.textoEntre", { min: v.desde || "…", max: v.hasta || "…" });
  }
  return `${t(v.modo === "proximos" ? "filtro.op.proximosDias" : "filtro.op.haceMasDias")} ${v.dias} ${t("filtro.dias")}`;
}

export function textoLista(ids: string[], t: TranslateFn) {
  return `${t("clientes.filtroCol.esUnoDe")} ${ids.join(", ")}`;
}

export function textoEtiquetas(v: ValorEtiquetas, t: TranslateFn) {
  const nombres = v.ids
    .map((id) => etiquetasCatalogo.find((e) => e.id === id)?.nombre ?? id)
    .join(", ");
  return `${t(`filtro.op.${v.modo}`)} ${nombres}`;
}

/** Lista de casillas (listas cortas en el mock). */
function Casillas({
  opciones,
  elegidos,
  onChange,
}: {
  opciones: { id: string; nombre: string }[];
  elegidos: string[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <div className="flex max-h-56 flex-col gap-1 overflow-y-auto">
      {opciones.map((o) => {
        const marcado = elegidos.includes(o.id);
        return (
          <label key={o.id} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-muted">
            <Checkbox
              checked={marcado}
              onCheckedChange={(v) =>
                onChange(v === true ? [...elegidos, o.id] : elegidos.filter((id) => id !== o.id))
              }
            />
            {o.nombre}
          </label>
        );
      })}
    </div>
  );
}

export function FiltroLista<T extends MRT_RowData>({
  column,
  valores,
}: Props<T> & { valores: string[] }) {
  const t = useT();
  const v = (column.getFilterValue() as ValorLista | undefined) ?? [];
  return (
    <Contenedor>
      <p className="text-xs text-muted-foreground">{t("clientes.filtroCol.esUnoDe")}</p>
      <Casillas
        opciones={valores.map((x) => ({ id: x, nombre: x }))}
        elegidos={v}
        onChange={(ids) =>
          column.setFilterValue(
            ids.length === 0 ? undefined : conTexto([...ids], textoLista(ids, t))
          )
        }
      />
      <Limpiar column={column} />
    </Contenedor>
  );
}

export function FiltroEtiquetas<T extends MRT_RowData>({ column }: Props<T>) {
  const t = useT();
  const guardado = column.getFilterValue() as ValorEtiquetas | undefined;
  const [borrador, setBorrador] = useState<ValorEtiquetas>({ modo: "tiene", ids: [] });
  const v: ValorEtiquetas = guardado ?? borrador;
  function cambiar(nuevo: ValorEtiquetas) {
    setBorrador(nuevo);
    column.setFilterValue(
      nuevo.ids.length === 0 ? undefined : conTexto(nuevo, textoEtiquetas(nuevo, t))
    );
  }
  return (
    <Contenedor>
      <div className="flex gap-1 rounded-md bg-muted p-0.5">
        {(["tiene", "noTiene"] as const).map((m) => (
          <Button
            key={m}
            type="button"
            size="sm"
            variant={v.modo === m ? "default" : "ghost"}
            className="flex-1"
            onClick={() => cambiar({ ...v, modo: m })}
          >
            {t(`filtro.op.${m}`)}
          </Button>
        ))}
      </div>
      <Casillas
        opciones={etiquetasCatalogo.map((e) => ({ id: e.id, nombre: e.nombre }))}
        elegidos={v.ids}
        onChange={(ids) => cambiar({ ...v, ids })}
      />
      <Limpiar column={column} />
    </Contenedor>
  );
}

export function FiltroSiNo<T extends MRT_RowData>({ column }: Props<T>) {
  const t = useT();
  const v = column.getFilterValue() as string | undefined;
  return (
    <Contenedor>
      <Select value={v ?? ""} onValueChange={(x) => column.setFilterValue(x)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t("filtro.elegir")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Sí">{t("clientes.filtroCol.si")}</SelectItem>
          <SelectItem value="No">{t("clientes.filtroCol.no")}</SelectItem>
        </SelectContent>
      </Select>
      <Limpiar column={column} />
    </Contenedor>
  );
}
