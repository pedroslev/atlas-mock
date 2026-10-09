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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ADefinir, EtiquetaBadge } from "@/components/clientes/clientes-ui";
import { proyectos, getProyecto } from "@/lib/mock-data";
import {
  clientes,
  etiquetasCatalogo,
  getEtiqueta,
  nombreCompleto,
  telefonoPrincipal,
  visibleEn,
  type Cliente,
} from "@/lib/mock-clientes";
import { useT } from "@/lib/i18n";

// El listado muestra solo datos básicos y etiquetas (feedback de producto
// 2026-10-09): nada derivado de interacciones ni de objetivos de contacto.
type Fila = Cliente & { nombreCompleto: string };

export default function ClientesPage() {
  const t = useT();
  const [proyectoId, setProyectoId] = useState<string>("todos");
  const [etiquetaId, setEtiquetaId] = useState<string>("todas");

  // Clientes globales: un cliente se ve en un proyecto salvo que se le haya
  // sacado la visibilidad ahí.
  const filas = useMemo<Fila[]>(
    () =>
      clientes
        .filter((c) => proyectoId === "todos" || visibleEn(c, proyectoId))
        .filter((c) => etiquetaId === "todas" || c.etiquetas.includes(etiquetaId))
        .map((c) => ({ ...c, nombreCompleto: nombreCompleto(c) })),
    [proyectoId, etiquetaId]
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
            <Button variant="outline">
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

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium">{t("clientes.proyecto")}</span>
        <Select value={proyectoId} onValueChange={setProyectoId}>
          <SelectTrigger className="w-60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">{t("clientes.todosProyectos")}</SelectItem>
            {proyectos.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm font-medium">{t("clientes.filtroEtiqueta")}</span>
        <Select value={etiquetaId} onValueChange={setEtiquetaId}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">{t("clientes.todasEtiquetas")}</SelectItem>
            {etiquetasCatalogo.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
    </div>
  );
}
