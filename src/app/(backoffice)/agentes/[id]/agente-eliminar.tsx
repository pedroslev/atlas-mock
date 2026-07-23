"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
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
import { ActionTooltip } from "@/components/layout/action-tooltip";
import { useT } from "@/lib/i18n";

// Eliminar es una acción separada y más final que deshabilitar: solo queda
// alcanzable una vez que el usuario ya está deshabilitado (feedback: "el
// deshabilitar que hace? luego me deja eliminarlo?"). No hay persistencia,
// es un mock (ver PRODUCT.md).
export function AgenteEliminar({
  nombre,
  habilitado,
}: {
  nombre: string;
  habilitado: boolean;
}) {
  const [open, setOpen] = useState(false);
  const t = useT();

  return (
    <>
      <ActionTooltip
        label={
          habilitado
            ? t("usuarios.eliminar.tooltipBloqueado")
            : t("usuarios.eliminar.tooltip")
        }
      >
        <Button
          variant="destructive"
          disabled={habilitado}
          onClick={() => setOpen(true)}
        >
          <Trash2 />
          {t("usuarios.eliminar.boton")}
        </Button>
      </ActionTooltip>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("usuarios.eliminar.titulo", { nombre })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("usuarios.eliminar.descripcion")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("common.acciones.cancelar")}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => setOpen(false)}
            >
              {t("common.acciones.eliminar")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
