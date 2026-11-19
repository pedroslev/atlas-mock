"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/lib/i18n";
import { campanias } from "@/lib/mock-data";
import { enCursoPorCampania, entradaPorCampania } from "@/lib/mock-estrategias";
import type { Cliente } from "@/lib/mock-clientes";

export type ResultadoRetiro = { campanias: number; retiros: number };

// Retiro manual (Tomás, 2026-11-18, ATLAS-1186, a validar con Pedro): lo
// contrario de "Cargar en campaña", de una o varias campañas a la vez. Los
// seleccionados que están en curso en cada campaña elegida salen de su
// estrategia: el objetivo se cierra como cancelado, igual que la Salida por
// dato. Los que no están en curso en una campaña no cambian en esa.
export function RetirarDeCampaniaDialog({
  open,
  onOpenChange,
  seleccion,
  onRetirar,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seleccion: Cliente[];
  onRetirar: (resultado: ResultadoRetiro) => void;
}) {
  const t = useT();
  const [elegidas, setElegidas] = useState<string[]>([]);

  const enCursoEn = (id: string) =>
    seleccion.filter((c) => (enCursoPorCampania[id] ?? []).includes(c.id)).length;

  // Solo se listan las campañas donde hay alguno de los seleccionados en curso.
  const conEnCurso = campanias.filter((c) => enCursoEn(c.id) > 0);
  const marcadas = conEnCurso.filter((c) => elegidas.includes(c.id));
  const retiros = marcadas.reduce((n, c) => n + enCursoEn(c.id), 0);
  const todas = conEnCurso.length > 0 && marcadas.length === conEnCurso.length;

  function alternar(id: string, si: boolean) {
    setElegidas((prev) => (si ? [...prev, id] : prev.filter((x) => x !== id)));
  }

  function cerrar(abierto: boolean) {
    if (!abierto) setElegidas([]);
    onOpenChange(abierto);
  }

  function confirmar() {
    onRetirar({ campanias: marcadas.length, retiros });
    cerrar(false);
  }

  return (
    <Dialog open={open} onOpenChange={cerrar}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("clientes.retirar.titulo")}</DialogTitle>
          <DialogDescription>{t("clientes.retirar.desc", { n: seleccion.length })}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <Label>{t("clientes.retirar.campanias")}</Label>
              {conEnCurso.length > 1 && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0"
                  onClick={() => setElegidas(todas ? [] : conEnCurso.map((c) => c.id))}
                >
                  {todas ? t("clientes.retirar.ninguna") : t("clientes.retirar.todas")}
                </Button>
              )}
            </div>
            {conEnCurso.length === 0 ? (
              <p className="rounded-lg border border-dashed px-3 py-3 text-sm text-muted-foreground">
                {t("clientes.retirar.sinCampanias")}
              </p>
            ) : (
              <ul className="flex flex-col divide-y rounded-lg border">
                {conEnCurso.map((c) => {
                  const id = `retirar-${c.id}`;
                  return (
                    <li key={c.id} className="flex items-center gap-3 px-3 py-2">
                      <Checkbox
                        id={id}
                        checked={elegidas.includes(c.id)}
                        onCheckedChange={(v) => alternar(c.id, v === true)}
                      />
                      <Label htmlFor={id} className="flex-1 font-normal">
                        {c.nombre}
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        {t("clientes.retirar.enCurso", { n: enCursoEn(c.id) })}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="text-xs text-muted-foreground">{t("clientes.retirar.campaniaAyuda")}</p>
          </div>

          {marcadas.length > 0 && (
            <div className="flex flex-col gap-1 rounded-lg border bg-muted/40 px-4 py-3 text-sm">
              <p>{t("clientes.retirar.resumen", { n: retiros, c: marcadas.length })}</p>
              {marcadas.map((c) => {
                const entrada = entradaPorCampania[c.id];
                if (!entrada?.automatica) return null;
                return (
                  <p key={c.id} className="text-muted-foreground">
                    {entrada.reingreso === "nunca"
                      ? t("clientes.retirar.reingresoNunca", { campania: c.nombre })
                      : t("clientes.retirar.reingresoDespues", {
                          campania: c.nombre,
                          n: entrada.reingresoDias,
                        })}
                  </p>
                );
              })}
              <p className="mt-1 text-xs text-muted-foreground">{t("clientes.retirar.origen")}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => cerrar(false)}>
            {t("common.acciones.cancelar")}
          </Button>
          <Button variant="destructive" disabled={retiros === 0} onClick={confirmar}>
            {t("clientes.retirar.confirmar")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
