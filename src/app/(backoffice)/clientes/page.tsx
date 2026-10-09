"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Tags, Upload } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { RowActions } from "@/components/data-table/row-actions";
import {
  MitrolTable,
  type MRT_ColumnDef,
} from "@/components/data-table/mitrol-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ADefinir, EtiquetaBadge } from "@/components/clientes/clientes-ui";
import { getProyecto } from "@/lib/mock-data";
import {
  clientes,
  getEtiqueta,
  nombreCompleto,
  telefonoPrincipal,
  type Cliente,
} from "@/lib/mock-clientes";
import { useT } from "@/lib/i18n";
import { ImportarWizard } from "./importar-wizard";

// El listado muestra solo datos básicos y etiquetas (feedback de producto
// 2026-10-09): nada derivado de interacciones ni de objetivos de contacto.
type Fila = Cliente & { nombreCompleto: string };

export default function ClientesPage() {
  const t = useT();
  const [importarOpen, setImportarOpen] = useState(false);

  // Sin filtros propios arriba (feedback 2026-10-09): la búsqueda y los
  // filtros por columna de la tabla alcanzan.
  const filas = useMemo<Fila[]>(
    () => clientes.map((c) => ({ ...c, nombreCompleto: nombreCompleto(c) })),
    []
  );

  const columns = useMemo<MRT_ColumnDef<Fila>[]>(
    () => [
      {
        accessorKey: "nombreCompleto",
        header: t("clientes.col.cliente"),
        Cell: ({ row }) => (
          <Link
            href={`/clientes/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.nombreCompleto}
          </Link>
        ),
      },
      {
        id: "identificacion",
        header: t("clientes.col.identificacion"),
        accessorFn: (c) => `${c.tipoDoc} ${c.nroDoc}`,
        Cell: ({ cell }) => (
          <span className="text-muted-foreground">{cell.getValue<string>()}</span>
        ),
      },
      {
        id: "telefono",
        header: t("clientes.col.telefono"),
        accessorFn: (c) => telefonoPrincipal(c) ?? "—",
      },
      {
        id: "etiquetas",
        header: t("clientes.col.etiquetas"),
        accessorFn: (c) => c.etiquetas.map((id) => getEtiqueta(id)?.nombre).join(", "),
        Cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.etiquetas.map((id) => {
              const e = getEtiqueta(id);
              return e ? <EtiquetaBadge key={id} etiqueta={e} /> : null;
            })}
          </div>
        ),
      },
      {
        id: "visibilidad",
        header: t("clientes.col.visibilidad"),
        accessorFn: (c) => c.ocultoEn.length,
        Cell: ({ row }) =>
          row.original.ocultoEn.length === 0 ? (
            <span className="text-muted-foreground">{t("clientes.visibleTodos")}</span>
          ) : (
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-xs text-muted-foreground">{t("clientes.todosMenos")}</span>
              {row.original.ocultoEn.map((pid) => (
                <Badge key={pid} variant="neutral">
                  {getProyecto(pid)?.nombre}
                </Badge>
              ))}
            </div>
          ),
      },
    ],
    [t]
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("common.nav.clientes")}
        description={t("clientes.descripcion")}
        actions={
          <>
            <ADefinir nota={t("clientes.obj.cargar.inputNota")} />
            <Button variant="outline" asChild>
              <Link href="/clientes/etiquetas">
                <Tags />
                {t("clientes.administrarEtiquetas")}
              </Link>
            </Button>
            <Button variant="outline" onClick={() => setImportarOpen(true)}>
              <Upload />
              {t("clientes.importar")}
            </Button>
            <Button>
              <Plus />
              {t("clientes.nuevo")}
            </Button>
          </>
        }
      />


      <MitrolTable
        columns={columns}
        data={filas}
        options={{
          enableRowActions: true,
          renderRowActions: ({ row }) => (
            <RowActions
              actions={[
                {
                  label: t("clientes.verFicha"),
                  href: `/clientes/${row.original.id}`,
                },
                {
                  label: t("common.acciones.eliminar"),
                  destructive: true,
                  separatorBefore: true,
                },
              ]}
            />
          ),
        }}
      />

      <ImportarWizard open={importarOpen} onOpenChange={setImportarOpen} />
    </div>
  );
}
