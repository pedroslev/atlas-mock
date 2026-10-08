"use client";

import { useMemo, useState } from "react";
import { Info, Plus } from "lucide-react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EtiquetaBadge } from "@/components/clientes/clientes-ui";
import { cn } from "@/lib/utils";
import {
  clientesConEtiqueta,
  etiquetasCatalogo,
  type ColorEtiqueta,
  type Etiqueta,
} from "@/lib/mock-clientes";
import { useT } from "@/lib/i18n";

const COLORES: ColorEtiqueta[] = ["info", "success", "warning", "destructive", "neutral", "secondary"];

type Fila = Etiqueta & { clientes: number };

// Catálogo de etiquetas de clientes (propuesta 2026-10-08). Se administra
// acá para que no convivan variantes de texto libre.
export default function EtiquetasPage() {
  const t = useT();
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>(etiquetasCatalogo);
  const [editando, setEditando] = useState<Etiqueta | "nueva" | null>(null);

  const filas = useMemo<Fila[]>(
    () => etiquetas.map((e) => ({ ...e, clientes: clientesConEtiqueta(e.id) })),
    [etiquetas]
  );

  const columns = useMemo<MRT_ColumnDef<Fila>[]>(
    () => [
      {
        accessorKey: "nombre",
        header: t("clientes.et.col.etiqueta"),
        Cell: ({ row }) => <EtiquetaBadge etiqueta={row.original} />,
      },
      {
        accessorKey: "descripcion",
        header: t("clientes.et.col.descripcion"),
        Cell: ({ cell }) => (
          <span className="text-muted-foreground">{cell.getValue<string>() ?? "—"}</span>
        ),
      },
      {
        accessorKey: "clientes",
        header: t("clientes.et.col.clientes"),
      },
    ],
    [t]
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("clientes.et.titulo")}
        description={t("clientes.et.descripcion")}
        backHref="/clientes"
        actions={
          <Button onClick={() => setEditando("nueva")}>
            <Plus />
            {t("clientes.et.nueva")}
          </Button>
        }
      />

      <p className="flex items-start gap-2 rounded-lg bg-accent px-4 py-3 text-sm text-accent-foreground">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        {t("clientes.et.noVisibilidad")}
      </p>

      <MitrolTable
        columns={columns}
        data={filas}
        options={{
          enableRowActions: true,
          renderRowActions: ({ row }) => (
            <RowActions
              actions={[
                { label: t("common.acciones.editar"), onSelect: () => setEditando(row.original) },
                {
                  label: t("common.acciones.eliminar"),
                  destructive: true,
                  separatorBefore: true,
                  confirmDescription: t("clientes.et.eliminarConfirm", {
                    nombre: row.original.nombre,
                    n: row.original.clientes,
                  }),
                  onSelect: () => setEtiquetas((es) => es.filter((e) => e.id !== row.original.id)),
                },
              ]}
            />
          ),
        }}
      />

      <EtiquetaDialog
        key={editando === "nueva" ? "nueva" : editando?.id ?? "cerrado"}
        etiqueta={editando}
        onClose={() => setEditando(null)}
        onSave={(e) => {
          setEtiquetas((es) =>
            es.some((x) => x.id === e.id) ? es.map((x) => (x.id === e.id ? e : x)) : [...es, e]
          );
          setEditando(null);
        }}
      />
    </div>
  );
}

function EtiquetaDialog({
  etiqueta,
  onClose,
  onSave,
}: {
  etiqueta: Etiqueta | "nueva" | null;
  onClose: () => void;
  onSave: (e: Etiqueta) => void;
}) {
  const t = useT();
  const base: Etiqueta =
    etiqueta && etiqueta !== "nueva"
      ? etiqueta
      : { id: "", nombre: "", color: "info" };
  const [nombre, setNombre] = useState(base.nombre);
  const [descripcion, setDescripcion] = useState(base.descripcion ?? "");
  const [color, setColor] = useState<ColorEtiqueta>(base.color);

  return (
    <Dialog open={etiqueta !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {etiqueta === "nueva" ? t("clientes.et.nueva") : t("common.acciones.editar")}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="et-nombre">{t("clientes.et.nombre")}</Label>
            <Input
              id="et-nombre"
              value={nombre}
              placeholder={t("clientes.et.placeholderNombre")}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="et-desc">{t("clientes.et.col.descripcion")}</Label>
            <Input
              id="et-desc"
              value={descripcion}
              placeholder={t("common.comunes.opcional")}
              onChange={(e) => setDescripcion(e.target.value)}
            />
          </div>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium">{t("clientes.et.color")}</legend>
            <div className="flex flex-wrap gap-2">
              {COLORES.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={color === c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "rounded-full p-0.5 ring-offset-2",
                    color === c && "ring-2 ring-primary"
                  )}
                >
                  <EtiquetaBadge etiqueta={{ id: c, nombre: t(`clientes.et.color.${c}`), color: c }} />
                </button>
              ))}
            </div>
          </fieldset>
          {nombre.trim() && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <EtiquetaBadge etiqueta={{ ...base, nombre: nombre.trim(), color }} />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.acciones.cancelar")}
          </Button>
          <Button
            disabled={!nombre.trim()}
            onClick={() =>
              onSave({
                ...base,
                id: base.id || `et-${Date.now()}`,
                nombre: nombre.trim(),
                descripcion: descripcion.trim() || undefined,
                color,
              })
            }
          >
            {t("common.acciones.guardar")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
