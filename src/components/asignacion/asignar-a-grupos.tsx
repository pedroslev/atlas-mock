"use client";

// Acciones masivas desde un catálogo (clasificaciones, marcas, plantillas):
// con varios elementos seleccionados en la tabla, "Agregar a grupos" o
// "Quitar de grupos" (ATLAS-1353). Mismos pasos que en Usuarios: elegir los
// grupos → resumen antes de confirmar → resultado.
//
// MOCK: el cambio se aplica a la lista de grupos de la pantalla (estado local
// del listado); la ficha de cada grupo, que se arma en el servidor, no lo ve.
// REAL: una sola operación por grupo contra olimpo-api, que devuelve qué se
// aplicó y qué falló.

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/lib/i18n";
import { ancestros, descendientes, ListaSeleccionable } from "./lista-seleccionable";

export type GrupoDeCatalogo = { id: string; nombre: string; ids: string[] };

export function AsignarAGruposDialog({
  modo,
  elementoIds,
  nombreDe,
  todosLosIds,
  grupos,
  padreDe,
  onAplicar,
  onClose,
}: {
  modo: "agregar" | "quitar";
  elementoIds: string[];
  nombreDe: (id: string) => string;
  /** Todo el catálogo: hace falta para encontrar padres e hijas. */
  todosLosIds: string[];
  grupos: GrupoDeCatalogo[];
  /** Solo clasificaciones: agregar trae a los padres y quitar se lleva a las hijas. */
  padreDe?: (id: string) => string | undefined;
  onAplicar: (grupos: GrupoDeCatalogo[]) => void;
  onClose: () => void;
}) {
  const t = useT();
  const [paso, setPaso] = useState<"elegir" | "resumen" | "resultado">("elegir");
  const [elegidos, setElegidos] = useState<string[]>([]);
  const [actualizados, setActualizados] = useState(0);

  // Agregar una hija trae a su padre; quitar un padre se lleva a sus hijas.
  const extra = padreDe
    ? [
        ...new Set(
          elementoIds.flatMap((id) =>
            modo === "agregar" ? ancestros(id, padreDe) : descendientes(id, todosLosIds, padreDe)
          )
        ),
      ].filter((id) => !elementoIds.includes(id))
    : [];
  const afectados = [...elementoIds, ...extra];
  const gruposElegidos = grupos.filter((g) => elegidos.includes(g.id));

  const sinCambio = elementoIds.filter((id) =>
    modo === "agregar"
      ? gruposElegidos.every((g) => g.ids.includes(id))
      : gruposElegidos.every((g) => !g.ids.includes(id))
  );

  function confirmar() {
    let n = 0;
    const nuevos = grupos.map((g) => {
      if (!elegidos.includes(g.id)) return g;
      const ids =
        modo === "agregar"
          ? [...new Set([...g.ids, ...afectados])]
          : g.ids.filter((id) => !afectados.includes(id));
      if (ids.length !== g.ids.length) n += 1;
      return { ...g, ids };
    });
    onAplicar(nuevos);
    setActualizados(n);
    setPaso("resultado");
  }

  const quita = modo === "quitar";
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t(quita ? "asignacion.quitarDeGrupos" : "asignacion.agregarAGrupos")}</DialogTitle>
          <DialogDescription>{t("asignacion.seleccionados", { n: elementoIds.length })}</DialogDescription>
        </DialogHeader>

        {paso === "elegir" && (
          <ListaSeleccionable
            opciones={grupos.map((g) => ({ id: g.id, nombre: g.nombre }))}
            elegidos={elegidos}
            onChange={setElegidos}
            placeholder={t("asignacion.buscarGrupo")}
            vacio={t("asignacion.sinResultados")}
          />
        )}

        {paso === "resumen" && (
          <div className="flex flex-col gap-3 text-sm">
            <p className={quita ? "text-destructive" : undefined}>
              {t(quita ? "asignacion.resumenQuitar" : "asignacion.resumenAgregar", {
                n: elementoIds.length,
                m: gruposElegidos.length,
                nombres: gruposElegidos.map((g) => g.nombre).join(", "),
              })}
            </p>
            <p className="text-muted-foreground">{elementoIds.map(nombreDe).join(", ")}</p>
            {extra.length > 0 && (
              <p className={`rounded-md p-2 ${quita ? "bg-destructive/10 text-destructive" : "bg-muted"}`}>
                {t(quita ? "asignacion.resumenHijas" : "asignacion.resumenPadres", {
                  nombres: extra.map(nombreDe).join(", "),
                })}
              </p>
            )}
            {sinCambio.length > 0 && (
              <p className="rounded-md bg-muted p-2 text-muted-foreground">
                {t(quita ? "asignacion.sinCambioQuitar" : "asignacion.sinCambioAgregar", { n: sinCambio.length })}{" "}
                {sinCambio.map(nombreDe).join(", ")}
              </p>
            )}
          </div>
        )}

        {paso === "resultado" && (
          <p className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="size-4 text-emerald-600" />
            {t("asignacion.resultado", { n: actualizados })}
          </p>
        )}

        <DialogFooter>
          {paso === "elegir" && (
            <>
              <Button variant="outline" onClick={onClose}>{t("common.acciones.cancelar")}</Button>
              <Button disabled={elegidos.length === 0} onClick={() => setPaso("resumen")}>
                {t("asignacion.continuar")}
              </Button>
            </>
          )}
          {paso === "resumen" && (
            <>
              <Button variant="outline" onClick={() => setPaso("elegir")}>{t("asignacion.volver")}</Button>
              <Button
                variant={quita ? "destructive" : "default"}
                disabled={sinCambio.length === elementoIds.length && extra.length === 0}
                onClick={confirmar}
              >
                {t("common.acciones.confirmar")}
              </Button>
            </>
          )}
          {paso === "resultado" && <Button onClick={onClose}>{t("asignacion.cerrar")}</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
