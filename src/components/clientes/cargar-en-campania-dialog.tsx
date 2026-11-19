"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useT } from "@/lib/i18n";
import { campanias } from "@/lib/mock-data";
import { enCursoPorCampania, estrategiasPorCampania } from "@/lib/mock-estrategias";
import type { Cliente } from "@/lib/mock-clientes";

export type ResultadoCarga = { campania: string; cargados: number; omitidos: number };

// Carga manual (propuesta 2026-11-13, ATLAS-1186, a validar con Pedro): los
// clientes que quedaron en el listado filtrado entran a una campaña como
// objetivos de contacto y siguen su estrategia de salida. Queda registrado
// como carga manual, con el filtro que se usó. Solo "hasta" (opcional): el
// "desde" ya lo da el "Cuándo arranca" del paso 1 (Tomás, 2026-11-18).
export function CargarEnCampaniaDialog({
  open,
  onOpenChange,
  seleccion,
  onCargar,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seleccion: Cliente[];
  onCargar: (resultado: ResultadoCarga) => void;
}) {
  const t = useT();
  const hoy = new Date().toISOString().slice(0, 10);
  const [campaniaId, setCampaniaId] = useState("");
  const [hasta, setHasta] = useState("");
  const [siEnCurso, setSiEnCurso] = useState<"dejar" | "reiniciar">("dejar");

  const campania = campanias.find((c) => c.id === campaniaId);
  const enCurso = seleccion.filter((c) =>
    (enCursoPorCampania[campaniaId] ?? []).includes(c.id)
  ).length;
  const omitidos = siEnCurso === "dejar" ? enCurso : 0;
  const hastaInvalido = !!hasta && hasta < hoy;

  function confirmar() {
    if (!campania) return;
    onCargar({
      campania: campania.nombre,
      cargados: seleccion.length - omitidos,
      omitidos,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("clientes.cargar.titulo")}</DialogTitle>
          <DialogDescription>
            {t("clientes.cargar.desc", { n: seleccion.length })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>{t("clientes.cargar.campania")}</Label>
            <Select value={campaniaId} onValueChange={setCampaniaId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("clientes.cargar.elegirCampania")} />
              </SelectTrigger>
              <SelectContent>
                {campanias.map((c) => {
                  const sinEstrategia = !(estrategiasPorCampania[c.id]?.length);
                  return (
                    <SelectItem key={c.id} value={c.id} disabled={sinEstrategia}>
                      {c.nombre}
                      {sinEstrategia && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          {t("clientes.cargar.sinEstrategia")}
                        </span>
                      )}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t("clientes.cargar.campaniaAyuda")}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t("clientes.cargar.ventana")}</Label>
            <Input
              type="date"
              className="w-44"
              min={hoy}
              aria-label={t("clientes.cargar.ventana")}
              aria-invalid={hastaInvalido || undefined}
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
            />
            <p className={hastaInvalido ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
              {hastaInvalido ? t("clientes.cargar.hastaInvalido") : t("clientes.cargar.ventanaAyuda")}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t("clientes.cargar.siEnCurso")}</Label>
            <Select value={siEnCurso} onValueChange={(v) => setSiEnCurso(v as typeof siEnCurso)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dejar">{t("clientes.cargar.siEnCurso.dejar")}</SelectItem>
                <SelectItem value="reiniciar">{t("clientes.cargar.siEnCurso.reiniciar")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {campania && (
            <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
              <p>
                {t("clientes.cargar.resumen", {
                  n: seleccion.length - omitidos,
                  campania: campania.nombre,
                })}
              </p>
              {enCurso > 0 && (
                <p className="text-muted-foreground">
                  {siEnCurso === "dejar"
                    ? t("clientes.cargar.resumenDejar", { n: enCurso })
                    : t("clientes.cargar.resumenReiniciar", { n: enCurso })}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {t("clientes.cargar.origen")}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.acciones.cancelar")}
          </Button>
          <Button
            disabled={!campania || hastaInvalido || seleccion.length - omitidos === 0}
            onClick={confirmar}
          >
            {t("clientes.cargar.confirmar")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
