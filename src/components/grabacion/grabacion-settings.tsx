"use client";

import { Info, PhoneCall, Radio } from "lucide-react";
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
import type { RecordingMode, RecordingSettingsParams } from "@/lib/mock-data";

// Primero se elige QUÉ se graba: solo las interacciones, o toda la sesión del
// agente (todo el tiempo que está conectado, incluido lo que pasa entre
// llamadas). Elegida la interacción, se eligen los momentos: la conversación,
// la espera y el trabajo posterior.
//
// En modo "toda la sesión" los tres momentos quedan incluidos por definición,
// así que se muestran activados y sin poder tocarse.
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

function OpcionModo({
  id,
  icon: Icon,
  label,
  description,
  elegido,
  onSelect,
}: {
  id: string;
  icon: typeof PhoneCall;
  label: string;
  description: string;
  elegido: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      id={id}
      type="button"
      onClick={onSelect}
      className={`flex items-start gap-3 rounded-lg p-3 text-left ring-1 transition-colors ${
        elegido
          ? "bg-accent/60 ring-2 ring-primary"
          : "ring-foreground/10 hover:bg-muted/60"
      }`}
    >
      <span
        className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border ${
          elegido ? "border-primary" : "border-foreground/30"
        }`}
      >
        {elegido && <span className="size-2 rounded-full bg-primary" />}
      </span>
      <span className="flex flex-col gap-1">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Icon className="size-3.5 text-secondary" />
          {label}
        </span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </span>
    </button>
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
  const porSesion = value.mode === "sesion";
  // En modo sesión se graba todo, así que los tres momentos van encendidos y
  // bloqueados.
  const graba = porSesion || value.recordInteraction;

  function set<K extends keyof RecordingSettingsParams>(key: K, v: boolean) {
    onChange({ ...value, [key]: v });
  }

  function setModo(mode: RecordingMode) {
    onChange({ ...value, mode });
  }

  const holdDisponible = !porSesion && graba && holdHabilitado;

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
        <div className="grid gap-3 sm:grid-cols-2">
          <OpcionModo
            id={`rec-modo-interaccion-${ambito}`}
            icon={PhoneCall}
            label={t("grabacion.modoInteraccion")}
            description={t("grabacion.modoInteraccionDesc")}
            elegido={!porSesion}
            onSelect={() => setModo("interaccion")}
          />
          <OpcionModo
            id={`rec-modo-sesion-${ambito}`}
            icon={Radio}
            label={t("grabacion.modoSesion")}
            description={t("grabacion.modoSesionDesc")}
            elegido={porSesion}
            onSelect={() => setModo("sesion")}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <ToggleRow
            id={`rec-interaccion-${ambito}`}
            label={t("grabacion.interaccion")}
            description={t("grabacion.interaccionDesc")}
            disabled={porSesion}
            disabledReason={t("grabacion.incluidoEnSesion")}
            checked={porSesion || value.recordInteraction}
            onCheckedChange={(v) => set("recordInteraction", v)}
          />
          <ToggleRow
            id={`rec-hold-${ambito}`}
            label={t("grabacion.hold")}
            description={t("grabacion.holdDesc")}
            disabled={!holdDisponible}
            disabledReason={
              porSesion
                ? t("grabacion.incluidoEnSesion")
                : !graba
                  ? t("grabacion.dependeInteraccion")
                  : t("grabacion.dependeHold")
            }
            checked={
              porSesion || (holdDisponible && value.recordAgentAudioDuringHold)
            }
            onCheckedChange={(v) => set("recordAgentAudioDuringHold", v)}
          />
          <ToggleRow
            id={`rec-acw-${ambito}`}
            label={t("grabacion.acw")}
            description={t("grabacion.acwDesc")}
            disabled={porSesion || !graba}
            disabledReason={
              porSesion
                ? t("grabacion.incluidoEnSesion")
                : t("grabacion.dependeInteraccion")
            }
            checked={porSesion || (graba && value.recordAcw)}
            onCheckedChange={(v) => set("recordAcw", v)}
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
