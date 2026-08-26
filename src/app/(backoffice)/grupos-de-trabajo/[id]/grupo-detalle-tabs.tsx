"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
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

// Solapas del detalle de grupo. Componente cliente porque la solapa
// "Config. Hermes" solo tiene sentido si el grupo tiene acceso a Hermes (ver
// grupos.permisos.seccionHermes en GrupoPermisos) — a pedido, si se
// deshabilita ese acceso la solapa se oculta, y si el usuario estaba parado
// justo ahí lo manda de vuelta a "General".
export function GrupoDetalleTabs({
  grupo,
  agentes,
}: {
  grupo: GrupoTrabajo;
  agentes: Agente[];
}) {
  const [accesoHermes, setAccesoHermes] = useState(grupo.accesoHermes);
  const [tab, setTab] = useState("general");

  useEffect(() => {
    if (!accesoHermes && tab === "config-hermes") setTab("general");
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
      </TabsList>

      <TabsContent value="general" className="flex flex-col gap-6">
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
              <Input id="nombre" defaultValue={grupo.nombre} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="descripcion">
                <T k="common.comunes.descripcion" />
              </Label>
              <Textarea id="descripcion" defaultValue={grupo.descripcion} rows={3} />
            </div>
          </CardContent>
        </Card>

        <GrupoMiembros agentes={agentes} initialUsuarioIds={grupo.usuarioIds} />
      </TabsContent>

      <TabsContent value="permisos">
        <GrupoPermisos
          initialPermisos={grupo.permisos}
          accesoHermes={accesoHermes}
          onAccesoHermesChange={setAccesoHermes}
        />
      </TabsContent>

      {accesoHermes && (
        <TabsContent value="config-hermes">
          <GrupoConfigHermesTab
            initialEstadosAuxiliares={grupo.estadosAuxiliares}
            initialHistoryLookbackDays={grupo.historyLookbackDays}
            initialShortcutButtons={grupo.shortcutButtons}
          />
        </TabsContent>
      )}
    </Tabs>
  );
}
