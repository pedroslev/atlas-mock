"use client";

import { AlertTriangle, Info, Monitor, PhoneCall } from "lucide-react";
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
import type {
  RecordingSettingsParams,
  ScreenRecordingScope,
} from "@/lib/mock-data";

// Dos grabaciones distintas, que se activan por separado:
//
// - AUDIO: tres momentos (la conversación, la espera y el trabajo posterior).
//   "Grabar la interacción" es el principal: apagado, no se graba audio.
// - PANTALLA: en el ADR de grabaciones es una object_class aparte, con su
//   propio egress, así que acá también va aparte — con su alcance: solo
//   durante las interacciones (lo que hace el mercado) o toda la sesión.
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

function OpcionAlcance({
  id,
  label,
  description,
  elegido,
  onSelect,
}: {
  id: string;
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
        <span className="text-sm font-medium">{label}</span>
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
  const graba = value.recordInteraction;
  const holdDisponible = graba && holdHabilitado;
  const porSesion = value.screenScope === "sesion";

  function set<K extends keyof RecordingSettingsParams>(
    key: K,
    v: RecordingSettingsParams[K]
  ) {
    onChange({ ...value, [key]: v });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("grabacion.audioTitulo")}</CardTitle>
          <CardDescription>
            {ambito === "campania"
              ? t("grabacion.descCampania")
              : t("grabacion.descGrupo")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
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
          </div>

          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            {ambito === "campania"
              ? t("grabacion.reglaDesdeCampania")
              : t("grabacion.reglaDesdeGrupo")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="size-4 text-secondary" />
            {t("grabacion.pantallaTitulo")}
          </CardTitle>
          <CardDescription>{t("grabacion.pantallaDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <ToggleRow
              id={`rec-pantalla-${ambito}`}
              label={t("grabacion.pantalla")}
              description={t("grabacion.pantallaToggleDesc")}
              checked={value.recordScreen}
              onCheckedChange={(v) => set("recordScreen", v)}
            />
          </div>

          {value.recordScreen && (
            <div className="flex flex-col gap-3">
              <Label className="text-sm font-medium">
                {t("grabacion.alcanceTitulo")}
              </Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <OpcionAlcance
                  id={`rec-alcance-interaccion-${ambito}`}
                  label={t("grabacion.alcanceInteraccion")}
                  description={t("grabacion.alcanceInteraccionDesc")}
                  elegido={!porSesion}
                  onSelect={() =>
                    set("screenScope", "interaccion" as ScreenRecordingScope)
                  }
                />
                <OpcionAlcance
                  id={`rec-alcance-sesion-${ambito}`}
                  label={t("grabacion.alcanceSesion")}
                  description={t("grabacion.alcanceSesionDesc")}
                  elegido={porSesion}
                  onSelect={() =>
                    set("screenScope", "sesion" as ScreenRecordingScope)
                  }
                />
              </div>

              {porSesion && (
                <p className="flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-xs text-muted-foreground">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning" />
                  {t("grabacion.alcanceSesionAviso")}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
