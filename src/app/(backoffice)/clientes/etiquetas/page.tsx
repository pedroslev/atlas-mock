"use client";

import { useMemo, useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { RowActions } from "@/components/data-table/row-actions";
import {
  MitrolTable,
  type MRT_ColumnDef,
} from "@/components/data-table/mitrol-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { etiquetasCatalogo, type Etiqueta } from "@/lib/mock-clientes";
import { EtiquetaDialog } from "@/components/clientes/etiqueta-dialog";
import { EtiquetaBadge } from "@/components/clientes/clientes-ui";
import { useT } from "@/lib/i18n";

// Catálogo de etiquetas de clientes (propuesta 2026-10-08, ajustes
// 2026-10-14): sin columna de cantidad de clientes, con prompt para IA.
export default function EtiquetasPage() {
  const t = useT();
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>(etiquetasCatalogo);
  const [editando, setEditando] = useState<Etiqueta | "nueva" | null>(null);

  const columns = useMemo<MRT_ColumnDef<Etiqueta>[]>(
    () => [
      {
        accessorKey: "nombre",
        header: t("clientes.et.col.etiqueta"),
        Cell: ({ row }) => <EtiquetaBadge etiqueta={row.original} />,
      },
      {
        accessorKey: "descripcion",
        header: t("clientes.et.col.descripcion"),
        Cell: ({ cell }) => <span className="text-muted-foreground">{cell.getValue<string>() ?? "—"}</span>,
      },
      {
        id: "prompt",
        header: t("clientes.et.col.prompt"),
        accessorFn: (e) => (e.prompt ? t("clientes.et.conPrompt") : t("clientes.et.sinPrompt")),
        Cell: ({ row }) =>
          row.original.prompt ? (
            <Badge variant="info" className="gap-1" title={row.original.prompt}>
              <Sparkles />
              {t("clientes.et.conPrompt")}
            </Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
    ],
    [t]
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("clientes.et.titulo")}
        backHref="/clientes"
        actions={
          <Button onClick={() => setEditando("nueva")}>
            <Plus />
            {t("clientes.et.nueva")}
          </Button>
        }
      />

      <MitrolTable
        columns={columns}
        data={etiquetas}
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
                  confirmDescription: t("clientes.et.eliminarConfirm", { nombre: row.original.nombre }),
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
        existentes={etiquetas}
        onClose={() => setEditando(null)}
        onSave={(e) => {
          setEtiquetas((es) => (es.some((x) => x.id === e.id) ? es.map((x) => (x.id === e.id ? e : x)) : [...es, e]));
          setEditando(null);
        }}
      />
    </div>
  );
}
