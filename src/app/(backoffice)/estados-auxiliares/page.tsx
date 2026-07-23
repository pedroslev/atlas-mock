"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { RowActions } from "@/components/data-table/row-actions";
import {
  MitrolTable,
  type MRT_ColumnDef,
} from "@/components/data-table/mitrol-table";
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
  estadosAuxiliares as estadosIniciales,
  type EstadoAuxiliar,
} from "@/lib/mock-data";
import { getAuxIcon, auxIconChoices } from "@/lib/aux-icons";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

// Alta y edición como modal sobre la misma lista — un form de 3 campos no
// justifica una pantalla propia (feedback 2026-07-16). Estado local, sin
// persistencia (ver PRODUCT.md).
export default function EstadosAuxiliaresPage() {
  const t = useT();
  const [estados, setEstados] = useState<EstadoAuxiliar[]>(estadosIniciales);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EstadoAuxiliar | null>(null);
  const [nombre, setNombre] = useState("");
  const [color, setColor] = useState("#0074B5");
  // El ícono se guarda como nombre técnico (ej. "graduation-cap") pero se elige
  // desde un selector visual; nunca se tipea el slug (feedback 2026-07-16).
  const [icono, setIcono] = useState("circle");

  function abrir(estado: EstadoAuxiliar | null) {
    setEditing(estado);
    setNombre(estado?.nombre ?? "");
    // Default = --primary (#0074B5); el input nativo de color exige hex literal.
    setColor(estado?.color ?? "#0074B5");
    setIcono(estado?.icono ?? "circle");
    setDialogOpen(true);
  }

  function guardar() {
    if (!nombre.trim()) return;
    if (editing) {
      setEstados((prev) =>
        prev.map((e) =>
          e.id === editing.id
            ? { ...e, nombre: nombre.trim(), color, icono }
            : e
        )
      );
    } else {
      setEstados((prev) => [
        ...prev,
        {
          id: `aux-${nombre.trim().toLowerCase().replace(/\s+/g, "-")}-${prev.length}`,
          nombre: nombre.trim(),
          color,
          icono: icono || "circle",
        },
      ]);
    }
    setDialogOpen(false);
  }

  const columns = useMemo<MRT_ColumnDef<EstadoAuxiliar>[]>(
    () => [
      {
        accessorKey: "nombre",
        header: t("estados.col.estado"),
        Cell: ({ row }) => (
          <span className="flex items-center gap-2 font-medium">
            <span
              className="size-3 rounded-full"
              style={{ backgroundColor: row.original.color }}
              aria-hidden
            />
            {row.original.nombre}
          </span>
        ),
      },
      {
        accessorKey: "color",
        header: t("estados.col.color"),
        enableColumnFilter: false,
        Cell: ({ cell }) => (
          <span className="font-mono text-xs text-muted-foreground uppercase">
            {cell.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "icono",
        header: t("estados.col.icono"),
        Cell: ({ row }) => {
          // Mostramos solo el ícono real, no el slug técnico: al usuario no le
          // dice nada "graduation-cap" (feedback 2026-07-16).
          const Icon = getAuxIcon(row.original.icono);
          return (
            <Icon
              className="size-4"
              style={{ color: row.original.color }}
              aria-label={row.original.icono}
            />
          );
        },
      },
    ],
    [t]
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("common.nav.estadosAuxiliares")}
        description={t("estados.descripcion")}
        actions={
          <Button onClick={() => abrir(null)}>
            <Plus />
            {t("estados.crear")}
          </Button>
        }
      />

      <MitrolTable
        columns={columns}
        data={estados}
        options={{
          enableRowActions: true,
          renderRowActions: ({ row }) => (
            <RowActions
              actions={[
                {
                  label: t("common.acciones.editar"),
                  onSelect: () => abrir(row.original),
                },
                {
                  label: t("common.acciones.eliminar"),
                  destructive: true,
                  separatorBefore: true,
                  onSelect: () =>
                    setEstados((prev) =>
                      prev.filter((e) => e.id !== row.original.id)
                    ),
                },
              ]}
            />
          ),
        }}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? t("estados.dialogo.editar", { nombre: editing.nombre })
                : t("estados.dialogo.nuevo")}
            </DialogTitle>
            <DialogDescription>
              {t("estados.dialogo.descripcion")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="aux-nombre">{t("common.comunes.nombre")}</Label>
              <Input
                id="aux-nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder={t("estados.dialogo.placeholderNombre")}
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="aux-color">{t("estados.col.color")}</Label>
              <input
                id="aux-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-8 w-16 rounded-lg border border-input p-1"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t("estados.col.icono")}</Label>
              {/* Selector visual: el usuario ve y elige el ícono, no tipea el
                  slug. El seleccionado se resalta y se tiñe con el color. */}
              <div
                role="radiogroup"
                aria-label={t("estados.dialogo.iconoAria")}
                className="grid grid-cols-8 gap-1.5 rounded-lg p-2 ring-1 ring-foreground/10"
              >
                {auxIconChoices.map((name) => {
                  const Icon = getAuxIcon(name);
                  const selected = icono === name;
                  return (
                    <button
                      key={name}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      aria-label={name}
                      onClick={() => setIcono(name)}
                      className={cn(
                        "flex size-8 items-center justify-center rounded-md ring-1 transition-colors",
                        selected
                          ? "bg-accent ring-2 ring-primary"
                          : "ring-foreground/10 hover:bg-muted"
                      )}
                    >
                      <Icon
                        className="size-4"
                        style={selected ? { color } : undefined}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("common.acciones.cancelar")}
            </Button>
            <Button onClick={guardar} disabled={!nombre.trim()}>
              {editing ? t("common.acciones.guardar") : t("estados.crearEstado")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
