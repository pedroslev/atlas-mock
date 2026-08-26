"use client";

import { Fragment, useState } from "react";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export type RowAction = {
  label: string;
  onSelect?: () => void;
  href?: string;
  destructive?: boolean;
  /** Bloqueado con aviso (ej. "tiene campañas activas") — se ve como acción disponible pero no ejecuta nada. */
  disabled?: boolean;
  separatorBefore?: boolean;
  /** Copy de la confirmación para acciones destructivas. Lo traduce la pantalla que lo pasa; si no se pasa, se usa el genérico de `common`. */
  confirmDescription?: string;
};

// Ancla siempre sobre el ícono que lo dispara (Radix Popper) — nunca al costado de
// la pantalla. Ver regla general de fronted/README.md sobre el menú de acciones.
// Toda acción destructiva pasa por un AlertDialog de confirmación (fronted/README.md:
// "siempre en rojo, con confirmación") — no hace falta pedirlo por pantalla.
export function RowActions({ actions }: { actions: RowAction[] }) {
  const [confirming, setConfirming] = useState<RowAction | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  // Los `label` de cada acción los traduce la pantalla que arma el array; acá
  // sólo se traducen los textos propios del componente.
  const t = useT();

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <ActionTooltip label={t("inicio.tabla.masAcciones")}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={t("inicio.tabla.masAcciones")}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={(event) => event.stopPropagation()}
            >
              <MoreVertical className="size-4" />
            </button>
          </DropdownMenuTrigger>
        </ActionTooltip>
        <DropdownMenuContent align="end">
          {actions.map((action) => (
            <Fragment key={action.label}>
              {action.separatorBefore && <DropdownMenuSeparator />}
              <DropdownMenuItem
                variant={action.destructive ? "destructive" : "default"}
                disabled={action.disabled}
                asChild={!!action.href && !action.destructive}
                onSelect={(event) => {
                  if (action.destructive) {
                    event.preventDefault();
                    setMenuOpen(false);
                    setConfirming(action);
                    return;
                  }
                  action.onSelect?.();
                }}
              >
                {action.href && !action.destructive ? (
                  <a href={action.href}>{action.label}</a>
                ) : (
                  action.label
                )}
              </DropdownMenuItem>
            </Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={confirming !== null}
        onOpenChange={(open) => !open && setConfirming(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("common.comunes.eliminarTitulo")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirming?.confirmDescription ??
                t("common.comunes.eliminarDescripcion")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.acciones.cancelar")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                confirming?.onSelect?.();
                setConfirming(null);
              }}
            >
              {confirming?.label ?? t("common.acciones.confirmar")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
