"use client";

import { useMemo, useState } from "react";
import type { Locale as DateFnsLocale } from "date-fns";
import { es } from "date-fns/locale/es";
import { enUS } from "date-fns/locale/en-US";
import { ptBR } from "date-fns/locale/pt-BR";
import { ca } from "date-fns/locale/ca";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActionTooltip } from "@/components/layout/action-tooltip";
import { useLocale, useT, type Locale } from "@/lib/i18n";
import type { FechaFeriado } from "@/lib/mock-data";

// Nombres de meses y días NO se traducen a mano: los pone el locale de
// date-fns (que react-day-picker consume tal cual) y, para el listado lateral,
// Intl con el tag BCP-47 equivalente. Español = es-AR (producto rioplatense).
const DATE_FNS_LOCALE: Record<Locale, DateFnsLocale> = {
  es,
  en: enUS,
  pt: ptBR,
  ca,
};

const INTL_TAG: Record<Locale, string> = {
  es: "es-AR",
  en: "en-US",
  pt: "pt-BR",
  ca: "ca-ES",
};

// Parseo/formateo SIEMPRE en horario local: `new Date("2026-01-01")` parsea a
// medianoche UTC y en UTC-3 cae al día anterior — bug clásico de feriados.
function parseFecha(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toIso(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatFecha(iso: string, locale: Locale) {
  return parseFecha(iso).toLocaleDateString(INTL_TAG[locale], {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

// Editor anual de un grupo de feriados, estilo argentina.gob.ar/feriados:
// los 12 meses en grilla (3 por fila en desktop), click en un día para
// marcarlo con su motivo, click en un día marcado para editar o quitar.
// Estado local únicamente — sin persistencia (ver PRODUCT.md).
export function FeriadoCalendario({
  initialHolidays,
}: {
  initialHolidays: FechaFeriado[];
}) {
  const t = useT();
  const { locale } = useLocale();
  const [holidays, setHolidays] = useState<FechaFeriado[]>(initialHolidays);
  // El calendario arranca en el año en curso y se puede elegir otro dentro de
  // un rango razonable (feedback 2026-07-16: antes sólo dejaba elegir 2026).
  const [anio, setAnio] = useState(() => new Date().getFullYear());
  // Rango de años elegibles: actual -1 hasta actual +3.
  const anios = useMemo(() => {
    const actual = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => actual - 1 + i);
  }, []);
  const [editing, setEditing] = useState<{
    iso: string;
    description: string;
    existing: boolean;
  } | null>(null);

  const fechasMarcadas = useMemo(
    () => holidays.map((h) => parseFecha(h.date)),
    [holidays]
  );

  const meses = useMemo(
    () => Array.from({ length: 12 }, (_, i) => new Date(anio, i, 1)),
    [anio]
  );

  const ordenados = useMemo(
    () => [...holidays].sort((a, b) => a.date.localeCompare(b.date)),
    [holidays]
  );

  function onDayClick(date: Date) {
    const iso = toIso(date);
    const existente = holidays.find((h) => h.date === iso);
    setEditing({
      iso,
      description: existente?.description ?? "",
      existing: !!existente,
    });
  }

  function guardar() {
    if (!editing || !editing.description.trim()) return;
    setHolidays((prev) => [
      ...prev.filter((h) => h.date !== editing.iso),
      { date: editing.iso, description: editing.description.trim() },
    ]);
    setEditing(null);
  }

  function quitar(iso: string) {
    setHolidays((prev) => prev.filter((h) => h.date !== iso));
    setEditing(null);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <Card className="min-w-0">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>{t("feriados.calendario.titulo", { anio })}</CardTitle>
            {/* Selector de año: dropdown con rango acotado, default año actual. */}
            <Select
              value={String(anio)}
              onValueChange={(v) => setAnio(Number(v))}
            >
              <SelectTrigger
                aria-label={t("feriados.calendario.anio")}
                className="w-28 tabular-nums"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {anios.map((a) => (
                  <SelectItem key={a} value={String(a)} className="tabular-nums">
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("feriados.calendario.ayuda")}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {meses.map((mes) => (
              <div
                key={mes.getMonth()}
                className="rounded-lg ring-1 ring-foreground/10"
              >
                <Calendar
                  locale={DATE_FNS_LOCALE[locale]}
                  month={mes}
                  disableNavigation
                  classNames={{ nav: "hidden" }}
                  onDayClick={onDayClick}
                  modifiers={{ feriado: fechasMarcadas }}
                  modifiersClassNames={{
                    feriado:
                      "bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/80",
                  }}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>
            {t("feriados.calendario.fechasMarcadas")}{" "}
            <span className="font-normal text-muted-foreground">
              ({holidays.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ordenados.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("feriados.calendario.sinFechas")}
            </p>
          ) : (
            <div className="flex max-h-[32rem] flex-col gap-1.5 overflow-y-auto overscroll-contain pr-1">
              {ordenados.map((h) => (
                <div
                  key={h.date}
                  className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-sm ring-1 ring-foreground/10"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="font-medium capitalize">
                      {formatFecha(h.date, locale)}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {h.description}
                    </span>
                  </div>
                  <ActionTooltip label={t("feriados.calendario.quitarFecha")}>
                    <button
                      type="button"
                      aria-label={t("feriados.calendario.quitarFechaAria", {
                        fecha: formatFecha(h.date, locale),
                      })}
                      onClick={() => quitar(h.date)}
                      className="flex size-7 shrink-0 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </ActionTooltip>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize">
              {editing ? formatFecha(editing.iso, locale) : ""}
            </DialogTitle>
            <DialogDescription>
              {editing?.existing
                ? t("feriados.dialogo.editar")
                : t("feriados.dialogo.marcar")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="feriado-motivo">
              {t("feriados.dialogo.motivo")}
            </Label>
            <Input
              id="feriado-motivo"
              value={editing?.description ?? ""}
              onChange={(e) =>
                setEditing((prev) =>
                  prev ? { ...prev, description: e.target.value } : prev
                )
              }
              placeholder={t("feriados.dialogo.motivoPlaceholder")}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") guardar();
              }}
            />
          </div>
          <DialogFooter>
            {editing?.existing && (
              <Button
                variant="destructive"
                onClick={() => editing && quitar(editing.iso)}
              >
                <Trash2 />
                {t("feriados.calendario.quitarFecha")}
              </Button>
            )}
            <Button variant="outline" onClick={() => setEditing(null)}>
              {t("common.acciones.cancelar")}
            </Button>
            <Button onClick={guardar} disabled={!editing?.description.trim()}>
              {editing?.existing
                ? t("common.acciones.guardar")
                : t("feriados.dialogo.marcarFeriado")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
