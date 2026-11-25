"use client";

// Acciones masivas desde un catálogo (clasificaciones, marcas, plantillas):
// con varios elementos seleccionados en la tabla, "Agregar a grupos" o
// "Quitar de grupos" (ATLAS-1353). Mismos pasos que en Usuarios: elegir los
// grupos → resumen antes de confirmar → resultado.
//
// MOCK: el cambio se aplica a la lista de grupos de la pantalla (estado local
// del listado); la ficha de cada grupo, que se arma en el servidor, no lo ve.
// En el primer intento de cada acción falla un grupo por catálogo, para ver la
// lista de fallidos y "Reintentar los que fallaron": "Atención al cliente"
// (cg-atencion) en clasificaciones, "General" (bg-general) en marcas y
// "Atención al cliente" (pg-atencion) en plantillas. El reintento se aplica.
// REAL: olimpo-front llama a olimpo-api una vez por cada grupo elegido:
// POST /api/classification-groups/{group_id}/classifications/add (o /remove),
// POST /api/bookmark-groups/{group_id}/bookmarks/add (o /remove) y
// POST /api/message-template-groups/{group_id}/message-templates/add (o
// /remove), con el cuerpo { "ids": [...] }. Igual que en Usuarios: son
// idempotentes, validan los ids contra el catálogo del tenant (uno desconocido
// responde 400 y no se guarda nada), devuelven el grupo actualizado y, si algo
// cambió, publican el mismo evento que el PUT del grupo. El grupo que falla se
// informa con su motivo y se reintenta solo.
// Regla de padres (clasificaciones), REAL: la aplica olimpo-api. Al guardar un
// grupo (PUT) o al agregarle clasificaciones, suma el padre (y los padres del
// padre) de toda hija que llega sin él; quitar un padre quita a sus hijas del
// grupo. El front aplica la misma regla para que se vea antes de confirmar.

import { useState } from "react";
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
import {
  fallaLaPrimeraVez,
  MOTIVO_FALLO,
  type Fallido,
} from "@/lib/asignacion-masiva";
import { ancestros, descendientes, ListaSeleccionable } from "./lista-seleccionable";
import { ResultadoAsignacion } from "./resultado-asignacion";

// MOCK: un grupo por catálogo que falla en el primer intento (ver arriba).
const GRUPOS_QUE_FALLAN = ["cg-atencion", "bg-general", "pg-atencion"] as const;

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
  const [fallidos, setFallidos] = useState<Fallido[]>([]);

  const gruposElegidos = grupos.filter((g) => elegidos.includes(g.id));
  // Agregar una hija trae a su padre; quitar un padre se lleva a sus hijas,
  // pero solo las que están en alguno de los grupos elegidos.
  const enGruposElegidos = new Set(gruposElegidos.flatMap((g) => g.ids));
  const extra = padreDe
    ? [
        ...new Set(
          elementoIds.flatMap((id) =>
            modo === "agregar"
              ? ancestros(id, padreDe)
              : descendientes(id, todosLosIds, padreDe).filter((h) => enGruposElegidos.has(h))
          )
        ),
      ].filter((id) => !elementoIds.includes(id))
    : [];
  const afectados = [...elementoIds, ...extra];

  const sinCambio = elementoIds.filter((id) =>
    modo === "agregar"
      ? gruposElegidos.every((g) => g.ids.includes(id))
      : gruposElegidos.every((g) => !g.ids.includes(id))
  );

  // Aplica la acción grupo por grupo (un pedido por grupo, como olimpo-api).
  // Los grupos que fallan quedan sin tocar y se listan para el reintento; el
  // conteo de actualizados se suma al de los intentos anteriores.
  function aplicarEn(grupoIds: string[]) {
    let n = 0;
    const nuevosFallidos: Fallido[] = [];
    const nuevos = grupos.map((g) => {
      if (!grupoIds.includes(g.id)) return g;
      if (fallaLaPrimeraVez(`catalogo-${modo}`, g.id, GRUPOS_QUE_FALLAN)) {
        nuevosFallidos.push({ id: g.id, nombre: g.nombre, motivo: MOTIVO_FALLO });
        return g;
      }
      const ids =
        modo === "agregar"
          ? [...new Set([...g.ids, ...afectados])]
          : g.ids.filter((id) => !afectados.includes(id));
      if (ids.length !== g.ids.length) n += 1;
      return { ...g, ids };
    });
    onAplicar(nuevos);
    setActualizados((prev) => prev + n);
    setFallidos(nuevosFallidos);
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
          <ResultadoAsignacion
            exito={actualizados > 0 ? t("asignacion.resultado", { n: actualizados }) : undefined}
            tituloFallidos={t("asignacion.fallidosEn", { n: fallidos.length })}
            fallidos={fallidos}
            onReintentar={() => aplicarEn(fallidos.map((f) => f.id))}
          />
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
                onClick={() => aplicarEn(elegidos)}
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
