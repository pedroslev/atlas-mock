"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { RowActions } from "@/components/data-table/row-actions";
import {
  MitrolTable,
  type MRT_ColumnDef,
} from "@/components/data-table/mitrol-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useT } from "@/lib/i18n";
import { agentes, getGruposDeUsuario, type Agente } from "@/lib/mock-data";

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .map((n) => n[0])
    .join("");
}

export default function AgentesPage() {
  const t = useT();
  const columns = useMemo<MRT_ColumnDef<Agente>[]>(
    () => [
      {
        accessorKey: "nombre",
        header: t("usuarios.usuario"),
        Cell: ({ row }) => {
          const agente = row.original;
          const grupos = getGruposDeUsuario(agente.id);
          return (
            <HoverCard>
              <HoverCardTrigger asChild>
                <Link
                  href={`/agentes/${agente.id}`}
                  className="flex w-fit items-center gap-2 font-medium hover:underline"
                >
                  <Avatar className="size-7">
                    <AvatarFallback className="text-xs">
                      {iniciales(agente.nombre)}
                    </AvatarFallback>
                  </Avatar>
                  {agente.nombre}
                </Link>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback>{iniciales(agente.nombre)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{agente.nombre}</span>
                    <span className="text-xs text-muted-foreground">
                      {agente.email}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-1">
                  <Badge variant={agente.habilitado ? "default" : "neutral"}>
                    {agente.habilitado
                      ? t("usuarios.habilitado")
                      : t("usuarios.deshabilitado")}
                  </Badge>
                  {grupos.map((g) => (
                    <Badge key={g.id} variant="outline">
                      {g.nombre}
                    </Badge>
                  ))}
                </div>
              </HoverCardContent>
            </HoverCard>
          );
        },
      },
      {
        accessorKey: "email",
        header: t("usuarios.email"),
        Cell: ({ cell }) => (
          <span className="text-muted-foreground">{cell.getValue<string>()}</span>
        ),
      },
      {
        id: "estado",
        header: t("common.comunes.estado"),
        accessorFn: (agente) =>
          agente.habilitado
            ? t("usuarios.habilitado")
            : t("usuarios.deshabilitado"),
        filterVariant: "select",
        Cell: ({ row }) => (
          <Badge variant={row.original.habilitado ? "default" : "neutral"}>
            {row.original.habilitado
              ? t("usuarios.habilitado")
              : t("usuarios.deshabilitado")}
          </Badge>
        ),
      },
    ],
    [t]
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("common.nav.usuarios")}
        description={t("usuarios.descripcion")}
        actions={
          <Button asChild>
            <Link href="/agentes/nuevo">
              <Plus />
              {t("usuarios.nuevo")}
            </Link>
          </Button>
        }
      />

      <MitrolTable
        columns={columns}
        data={agentes}
        options={{
          enableRowActions: true,
          renderRowActions: ({ row }) => (
            <RowActions
              actions={[
                {
                  label: t("common.acciones.editar"),
                  href: `/agentes/${row.original.id}`,
                },
                {
                  label: row.original.habilitado
                    ? t("usuarios.acciones.deshabilitar")
                    : t("usuarios.acciones.habilitar"),
                  separatorBefore: true,
                },
                {
                  label: t("common.acciones.eliminar"),
                  destructive: true,
                  disabled: row.original.habilitado,
                  separatorBefore: true,
                  confirmDescription: row.original.habilitado
                    ? t("usuarios.eliminar.bloqueado")
                    : t("usuarios.eliminar.permanente"),
                },
              ]}
            />
          ),
        }}
      />
    </div>
  );
}
