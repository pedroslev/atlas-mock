"use client";

import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ActionTooltip } from "@/components/layout/action-tooltip";
import { useT } from "@/lib/i18n";
import { useCampanias } from "@/lib/campanias-store";

// Un proyecto solo se puede eliminar cuando ya no tiene campañas: mientras
// tenga, el botón queda bloqueado y el tooltip dice cuántas hay que mover o
// eliminar primero (mismo criterio que el eliminar de un agente, que exige
// deshabilitarlo antes).
//
// Al borrarlo se pierde el histórico de todas las campañas que ese proyecto
// tuvo alguna vez, no solo el de las que tiene hoy — por eso la advertencia
// está en el diálogo y no solo en el botón. No hay persistencia, es un mock
// (ver PRODUCT.md).
export function ProyectoEliminar({
  nombre,
  proyectoId,
}: {
  nombre: string;
  proyectoId: string;
}) {
  const [open, setOpen] = useState(false);
  const t = useT();
  // Se cuenta contra el estado de la sesión: al eliminar las campañas desde
  // Campañas, el botón se habilita sin recargar.
  const { contarPorProyecto } = useCampanias();
  const campaniasActivas = contarPorProyecto(proyectoId);
  const bloqueado = campaniasActivas > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-destructive">
          {t("proyectos.eliminar.titulo")}
        </CardTitle>
        <CardDescription>
          {bloqueado
            ? t("proyectos.eliminar.descripcionBloqueado", {
                n: campaniasActivas,
              })
            : t("proyectos.eliminar.descripcion")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ActionTooltip
          label={
            bloqueado
              ? t("proyectos.eliminar.tooltipBloqueado", { n: campaniasActivas })
              : t("proyectos.eliminar.tooltip")
          }
        >
          <Button
            variant="destructive"
            disabled={bloqueado}
            onClick={() => setOpen(true)}
          >
            <Trash2 />
            {t("proyectos.eliminar.boton")}
          </Button>
        </ActionTooltip>

        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("proyectos.eliminar.dialogoTitulo", { nombre })}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("proyectos.eliminar.dialogoDescripcion")}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <p className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
              <span>
                <span className="font-medium">
                  {t("proyectos.eliminar.avisoTitulo")}
                </span>{" "}
                {t("proyectos.eliminar.aviso")}
              </span>
            </p>

            <AlertDialogFooter>
              <AlertDialogCancel>
                {t("common.acciones.cancelar")}
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => setOpen(false)}
              >
                {t("proyectos.eliminar.confirmar")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
