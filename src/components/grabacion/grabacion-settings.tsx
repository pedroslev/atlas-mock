"use client";

import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useT } from "@/lib/i18n";
import type { RecordingSettingsParams } from "@/lib/mock-data";

// Cuatro cosas que se activan por separado: los tres momentos del audio (la
// conversación, la espera y el trabajo posterior) y la pantalla, que es una
// grabación aparte (en el ADR de grabaciones, una object_class con su propio
// egress). "Grabar la interacción" es el principal del audio: apagado, no se
// graba audio.
//
// La pantalla se graba siempre durante la interacción y su trabajo posterior:
// grabar toda la sesión del agente se descartó (2026-09-16), ver la propuesta
// de grabaciones en documentacion/relevamiento-legacy/grabaciones/.
//
// Se configura igual en la campaña y en el grupo de trabajo, y entre los dos
// gana lo más restrictivo (decisión del PO, 2026-09-16 — pendiente de acordar
// con el Chief Innovation Architect).

function ToggleRow({
  id,
  label,
  description,
  alcance,
  checked,
  onCheckedChange,
  disabled,
  disabledReason,
}: {
  id: string;
  label: string;
  description: string;
  alcance?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
  disabledReason?: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg p-3 ring-1 ring-foreground/10">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {disabled && disabledReason ? disabledReason : description}
      </p>
      {alcance && (
        <Badge variant="outline" className="w-fit text-[0.65rem] font-normal">
          {alcance}
        </Badge>
      )}
    </div>
  );
}

export function GrabacionSettings({
  value,
  onChange,
  ambito,
  holdHabilitado = true,
}: {
  value: RecordingSettingsParams;
  onChange: (v: RecordingSettingsParams) => void;
  ambito: "campania" | "grupo";
  // Solo aplica en campaña: si la campaña no permite poner en espera, no hay
  // hold que grabar. El grupo no configura el hold.
  holdHabilitado?: boolean;
}) {
  const t = useT();
  const graba = value.recordInteraction;
  const holdDisponible = graba && holdHabilitado;

  function set<K extends keyof RecordingSettingsParams>(key: K, v: boolean) {
    onChange({ ...value, [key]: v });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("grabacion.titulo")}</CardTitle>
        <CardDescription>
          {ambito === "campania"
            ? t("grabacion.descCampania")
            : t("grabacion.descGrupo")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ToggleRow
            id={`rec-interaccion-${ambito}`}
            label={t("grabacion.interaccion")}
            description={t("grabacion.interaccionDesc")}
            checked={value.recordInteraction}
            onCheckedChange={(v) => set("recordInteraction", v)}
          />
          <ToggleRow
            id={`rec-hold-${ambito}`}
            label={t("grabacion.hold")}
            description={t("grabacion.holdDesc")}
            disabled={!holdDisponible}
            disabledReason={
              !graba
                ? t("grabacion.dependeInteraccion")
                : t("grabacion.dependeHold")
            }
            checked={holdDisponible && value.recordAgentAudioDuringHold}
            onCheckedChange={(v) => set("recordAgentAudioDuringHold", v)}
          />
          <ToggleRow
            id={`rec-acw-${ambito}`}
            label={t("grabacion.acw")}
            description={t("grabacion.acwDesc")}
            disabled={!graba}
            disabledReason={t("grabacion.dependeInteraccion")}
            checked={graba && value.recordAcw}
            onCheckedChange={(v) => set("recordAcw", v)}
          />
          <ToggleRow
            id={`rec-pantalla-${ambito}`}
            label={t("grabacion.pantalla")}
            description={t("grabacion.pantallaToggleDesc")}
            checked={value.recordScreen}
            onCheckedChange={(v) => set("recordScreen", v)}
          />
        </div>

        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          {ambito === "campania"
            ? t("grabacion.reglaDesdeCampania")
            : t("grabacion.reglaDesdeGrupo")}
        </p>
      </CardContent>
    </Card>
  );
}
