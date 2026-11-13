"use client";

import { useEffect, useState } from "react";
import { CampoUnico } from "@/components/layout/campos-unicos";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { T } from "@/lib/i18n";
import type { Agente, GrupoTrabajo } from "@/lib/mock-data";
import { GrupoMiembros } from "./grupo-miembros";
import { GrupoPermisos } from "./grupo-permisos";
import { GrupoConfigHermesTab } from "../grupo-config-hermes";
import { GrupoFichaClienteTab } from "../grupo-ficha-cliente";

// Solapas del detalle de grupo. Componente cliente porque la solapa
// "Config. Hermes" solo tiene sentido si el grupo tiene acceso a Hermes (ver
// grupos.permisos.seccionHermes en GrupoPermisos) — a pedido, si se
// deshabilita ese acceso la solapa se oculta, y si el usuario estaba parado
// justo ahí lo manda de vuelta a "General".
export function GrupoDetalleTabs({
  grupo,
  agentes,
  nombresExistentes,
}: {
  grupo: GrupoTrabajo;
  agentes: Agente[];
  nombresExistentes: string[];
}) {
  const [accesoHermes, setAccesoHermes] = useState(grupo.accesoHermes);
  const [tab, setTab] = useState("general");

  useEffect(() => {
    if (!accesoHermes && (tab === "config-hermes" || tab === "ficha-cliente")) setTab("general");
  }, [accesoHermes, tab]);

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList>
        <TabsTrigger value="general">
          <T k="grupos.tab.general" />
        </TabsTrigger>
        <TabsTrigger value="permisos">
          <T k="grupos.tab.permisos" />
        </TabsTrigger>
        {accesoHermes && (
          <TabsTrigger value="config-hermes">
            <T k="grupos.tab.configHermes" />
          </TabsTrigger>
        )}
        {accesoHermes && (
          <TabsTrigger value="ficha-cliente">
            <T k="clientes.grupo.tab" />
          </TabsTrigger>
        )}
      </TabsList>

      {/* forceMount: el nombre conserva lo escrito y sigue bloqueando Confirmar
          aunque se pase a otra solapa. */}
      <TabsContent value="general" forceMount className="flex flex-col gap-6 data-[state=inactive]:hidden">
        <Card>
          <CardHeader>
            <CardTitle>
              <T k="grupos.infoGeneral" />
            </CardTitle>
          </CardHeader>
          <CardContent className="flex max-w-xl flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nombre">
                <T k="common.comunes.nombre" />
              </Label>
              <CampoUnico
                id="nombre"
                existentes={nombresExistentes}
                defaultValue={grupo.nombre}
                obligatorio
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="descripcion">
                <T k="common.comunes.descripcion" />
              </Label>
              <Textarea id="descripcion" defaultValue={grupo.descripcion} rows={3} />
            </div>
          </CardContent>
        </Card>

        <GrupoMiembros grupoId={grupo.id} agentes={agentes} initialUsuarioIds={grupo.usuarioIds} />
      </TabsContent>

      <TabsContent forceMount value="permisos" className="data-[state=inactive]:hidden">
        <GrupoPermisos
          initialPermisos={grupo.permisos}
          accesoHermes={accesoHermes}
          onAccesoHermesChange={setAccesoHermes}
          initialPermisosClavesApi={grupo.permisosClavesApi}
        />
      </TabsContent>

      {accesoHermes && (
        <TabsContent forceMount value="config-hermes" className="data-[state=inactive]:hidden">
          <GrupoConfigHermesTab
            initialEstadosAuxiliares={grupo.estadosAuxiliares}
            initialHistoryLookbackDays={grupo.historyLookbackDays}
            initialShortcutButtons={grupo.shortcutButtons}
            initialGrabacion={grupo.recordingSettings}
          />
        </TabsContent>
      )}

      {/* Qué ve y modifica el grupo en la ficha del cliente (2026-10-15). */}
      {accesoHermes && (
        <TabsContent forceMount value="ficha-cliente" className="data-[state=inactive]:hidden">
          <GrupoFichaClienteTab grupoId={grupo.id} />
        </TabsContent>
      )}
    </Tabs>
  );
}
