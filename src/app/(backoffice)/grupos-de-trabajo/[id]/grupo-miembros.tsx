"use client";

// Usuarios del grupo (ATLAS-1353): agregar varios a la vez, con filtros por
// otro grupo y por campaña (copia de los usuarios de hoy: quien se sume
// después no queda en este grupo), y quitar varios a la vez.
// MOCK: estado local de la pantalla, sin persistencia; se guarda con Confirmar
// como el resto del grupo.
// REAL: el front real ya agrega varios a la vez con búsqueda en el servidor
// (olimpo-front, ATLAS-900); faltan los filtros por grupo y por campaña y el
// quitar varios.

import { useMemo, useState } from "react";
import Link from "next/link";
import { UserPlus, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ActionTooltip } from "@/components/layout/action-tooltip";
import {
  AgregarVariosDialog,
  CasillaTodos,
  QuitarVarios,
  type FiltroAgregar,
} from "@/components/asignacion/agregar-varios";
import { useT } from "@/lib/i18n";
import {
  campanias,
  getOverrideDeUsuario,
  gruposTrabajo,
  proyectos,
  type Agente,
} from "@/lib/mock-data";

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .map((n) => n[0])
    .join("");
}

/** Filtros "Usuarios de otro grupo" y "Usuarios de la campaña" (agrupada por proyecto). */
export function filtrosDeUsuarios(
  t: (k: string, v?: Record<string, string | number>) => string,
  excluirGrupoId?: string,
  excluirCampaniaId?: string
): FiltroAgregar[] {
  return [
    {
      id: "grupo",
      etiqueta: t("asignacion.filtroUsuariosDeGrupo"),
      textoTodos: t("asignacion.todosLosGrupos"),
      grupos: [
        {
          opciones: gruposTrabajo
            .filter((g) => g.id !== excluirGrupoId)
            .map((g) => ({ value: g.id, label: g.nombre })),
        },
      ],
      pasa: (v, id) => gruposTrabajo.find((g) => g.id === v)?.usuarioIds.includes(id) ?? false,
    },
    {
      id: "campania",
      etiqueta: t("asignacion.filtroUsuariosDeCampania"),
      textoTodos: t("asignacion.todasLasCampanias"),
      grupos: proyectos
        .map((p) => ({
          titulo: p.nombre,
          opciones: [
            { value: `proyecto:${p.id}`, label: t("asignacion.todasDelProyecto", { proyecto: p.nombre }) },
            ...campanias
              .filter((c) => c.proyectoId === p.id && c.id !== excluirCampaniaId)
              .map((c) => ({ value: c.id, label: c.nombre })),
          ],
        }))
        .filter((g) => g.opciones.length > 1),
      pasa: (v, id) => {
        const origen = v.startsWith("proyecto:")
          ? campanias.filter((c) => c.proyectoId === v.slice("proyecto:".length) && c.id !== excluirCampaniaId)
          : campanias.filter((c) => c.id === v);
        return origen.some((c) => c.usuariosAsignados.includes(id));
      },
    },
  ];
}

export function GrupoMiembros({
  grupoId,
  agentes,
  initialUsuarioIds,
}: {
  grupoId: string;
  agentes: Agente[];
  initialUsuarioIds: string[];
}) {
  const [usuarioIds, setUsuarioIds] = useState(initialUsuarioIds);
  const [agregando, setAgregando] = useState(false);
  const [marcados, setMarcados] = useState<string[]>([]);
  const t = useT();

  const miembros = useMemo(
    () => agentes.filter((a) => usuarioIds.includes(a.id)),
    [agentes, usuarioIds]
  );
  const disponibles = agentes.filter((a) => !usuarioIds.includes(a.id));

  function quitar(ids: string[]) {
    setUsuarioIds((current) => current.filter((id) => !ids.includes(id)));
    setMarcados((m) => m.filter((id) => !ids.includes(id)));
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>{t("grupos.miembros.titulo")}</CardTitle>
          <CardDescription>
            {t("grupos.miembros.conteo", { n: miembros.length })}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <QuitarVarios
            nombres={miembros.filter((m) => marcados.includes(m.id)).map((m) => m.nombre)}
            ayuda={t("grupos.miembros.quitarVariosAyuda")}
            onConfirmar={() => quitar(marcados)}
          />
          <Button variant="outline" size="sm" onClick={() => setAgregando(true)}>
            <UserPlus />
            {t("grupos.miembros.agregar")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {miembros.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("grupos.miembros.vacio")}
          </p>
        ) : (
          <CasillaTodos ids={miembros.map((m) => m.id)} marcados={marcados} onChange={setMarcados} />
        )}
        {miembros.map((m) => {
          const tieneOverride = Boolean(getOverrideDeUsuario(m.id));
          return (
            <div
              key={m.id}
              className="flex items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm ring-1 ring-foreground/10"
            >
              <div className="flex min-w-0 items-center gap-2">
                <Checkbox
                  aria-label={m.nombre}
                  checked={marcados.includes(m.id)}
                  onCheckedChange={(v) =>
                    setMarcados((prev) => (v === true ? [...prev, m.id] : prev.filter((id) => id !== m.id)))
                  }
                />
                <Link
                  href={`/agentes/${m.id}`}
                  className="flex min-w-0 items-center gap-2 font-medium hover:underline"
                >
                  <Avatar className="size-7 shrink-0">
                    <AvatarFallback className="text-xs">
                      {iniciales(m.nombre)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{m.nombre}</span>
                  {tieneOverride && (
                    <Badge variant="secondary" className="shrink-0">
                      {t("grupos.miembros.permisosIndividuales")}
                    </Badge>
                  )}
                </Link>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden text-muted-foreground sm:inline">
                  {m.email}
                </span>
                <ActionTooltip label={t("grupos.miembros.quitar")}>
                  <button
                    type="button"
                    aria-label={t("grupos.miembros.quitarAria", {
                      nombre: m.nombre,
                    })}
                    onClick={() => quitar([m.id])}
                    className="flex size-7 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10"
                  >
                    <X className="size-3.5" />
                  </button>
                </ActionTooltip>
              </div>
            </div>
          );
        })}
      </CardContent>

      {agregando && (
        <AgregarVariosDialog
          titulo={t("grupos.miembros.agregar")}
          descripcion={t("grupos.miembros.agregarAyuda")}
          opciones={disponibles.map((a) => ({ id: a.id, nombre: a.nombre, detalle: a.email }))}
          filtros={filtrosDeUsuarios(t, grupoId)}
          placeholder={t("grupos.miembros.buscar")}
          vacio={t("grupos.miembros.sinDisponibles")}
          onClose={() => setAgregando(false)}
          onAgregar={(ids) => {
            setUsuarioIds((current) => [...current, ...ids]);
            setAgregando(false);
          }}
        />
      )}
    </Card>
  );
}
