"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkflowEditor } from "@/components/workflow/workflow-editor";
import { CapacidadChat, cupoOtrasCuentas } from "@/components/cuentas/capacidad-chat";
import { UsoDeLinea } from "@/components/cuentas/uso-de-linea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TIPOS_CUENTA, esTelefonia, type TipoCuenta } from "@/components/cuentas/tipos";
import { useT } from "@/lib/i18n";
import type { Cuenta, UsoDeLinea as TipoUso } from "@/lib/mock-data";

// Cuerpo de alta y detalle de cuenta: datos generales y flujo en el mismo
// lugar, así la cuenta se crea con su flujo de una vez. Sin `cuenta` es el
// alta (el tipo se elige); con `cuenta` es el detalle (el tipo queda fijo).
// Vive en un componente de cliente porque los placeholders exigen strings
// traducidos (`useT()`), mientras las pages pueden seguir siendo Server
// Components (el detalle usa generateStaticParams).
export function CuentaForm({
  cuenta,
  campanias,
}: {
  cuenta?: Cuenta;
  campanias: { id: string; nombre: string }[];
}) {
  const t = useT();
  const [uso, setUso] = useState<TipoUso | undefined>(cuenta?.uso);
  const [tipo, setTipo] = useState<TipoCuenta>((cuenta?.tipo as TipoCuenta) ?? "Llamada");
  const [chatEnLlamada, setChatEnLlamada] = useState(cuenta?.chatEnLlamada ?? false);

  // Capacidad del asesor (solo chat). Una cuenta nueva arranca con 3 chats y el
  // 60% de la capacidad, o lo que quede libre si otras cuentas ya reservaron.
  const otrosCupo = cupoOtrasCuentas(cuenta?.id);
  const [capacidad, setCapacidad] = useState({
    limitar: (cuenta?.provisioning ?? 0) > 0,
    cupo: cuenta?.provisioningLock ?? Math.min(60, 100 - otrosCupo),
    simultaneas: cuenta?.provisioning || 3,
  });

  const telefonia = esTelefonia(tipo);
  const tKeyTipo = TIPOS_CUENTA.find((x) => x.value === tipo)?.tKey;

  // La derivación define a qué campaña va cada llamada que ENTRA. Si la línea
  // solo origina llamadas, la solapa no aplica y no se muestra. Chat y
  // videollamada siempre reciben: el cliente es quien inicia la interacción.
  const tieneDerivacion = !telefonia || uso === "entrante" || uso === "ambas";

  return (
    <Tabs defaultValue="general">
      <TabsList>
        <TabsTrigger value="general">{t("cuentas.tab.general")}</TabsTrigger>
        {tieneDerivacion && (
          <TabsTrigger value="workflow">
            {t("cuentas.tab.derivacion")}
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>{t("cuentas.datos.titulo")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nombre">{t("common.comunes.nombre")}</Label>
              <Input
                id="nombre"
                defaultValue={cuenta?.nombre}
                placeholder={cuenta ? undefined : t("cuentas.campo.nombrePlaceholder")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tipo">{t("cuentas.campo.tipo")}</Label>
              {cuenta ? (
                <Input
                  id="tipo"
                  value={tKeyTipo ? t(tKeyTipo) : cuenta.tipo}
                  readOnly
                  disabled
                />
              ) : (
                <Select value={tipo} onValueChange={(v) => setTipo(v as TipoCuenta)}>
                  <SelectTrigger id="tipo" className="w-full" data-testid="cuenta-tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_CUENTA.map(({ value, icon: Icono, tKey }) => (
                      <SelectItem key={value} value={value} data-testid={`cuenta-tipo-${value}`}>
                        <Icono className="size-4" />
                        {t(tKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex flex-col gap-1.5 lg:col-span-2">
              <Label htmlFor="descripcion">
                {t("common.comunes.descripcion")}
              </Label>
              <Textarea
                id="descripcion"
                defaultValue={cuenta?.descripcion}
                placeholder={t("cuentas.campo.descripcionPlaceholder")}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {tipo === "Chat" && (
          <div className="mt-4">
            <CapacidadChat
              {...capacidad}
              otrosCupo={otrosCupo}
              onChange={(c) => setCapacidad((prev) => ({ ...prev, ...c }))}
            />
          </div>
        )}

        {/* Webcall y videollamada: el chat durante la llamada es de la cuenta,
            porque define qué ve el cliente en la web (solo la llamada, o la
            llamada y el chat). */}
        {(tipo === "Webcall" || tipo === "Videollamada") && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>{tipo === "Webcall" ? t("cuentas.webcall.titulo") : t("cuentas.videollamada.titulo")}</CardTitle>
            </CardHeader>
            <CardContent>
              <label htmlFor="chat-en-llamada" className="flex items-start justify-between gap-4">
                <span className="flex flex-col gap-1">
                  <span className="text-sm font-medium">{t("cuentas.webcall.chatEnLlamada")}</span>
                  <span className="text-xs text-muted-foreground">
                    {tipo === "Webcall" ? t("cuentas.webcall.chatEnLlamadaDesc") : t("cuentas.videollamada.chatEnLlamadaDesc")}
                  </span>
                </span>
                <Switch id="chat-en-llamada" checked={chatEnLlamada} onCheckedChange={setChatEnLlamada} />
              </label>
            </CardContent>
          </Card>
        )}

        {telefonia && (
        <div className="mt-4">
          <UsoDeLinea
            uso={uso}
            onUsoChange={setUso}
            defaultModoSalida={cuenta?.modoSalida}
            defaultLinea={cuenta?.identificador}
            defaultLineaSalida={cuenta?.lineaSalida}
          />
        </div>
        )}
      </TabsContent>

      <TabsContent value="workflow">
        <Card>
          <CardHeader>
            <CardTitle>{t("cuentas.derivacion.titulo")}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* En chat y videollamada el PLAY solo envía texto. */}
            <WorkflowEditor
              // Al cambiar de canal en el alta se rearma el editor: las
              // propiedades de PLAY y COLLECT son distintas según el tipo.
              key={telefonia ? "voz" : "texto"}
              initialWorkflow={cuenta?.workflow}
              campanias={campanias}
              soloTexto={!telefonia}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
