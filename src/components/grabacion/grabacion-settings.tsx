"use client";

import { Check, Info, Mic, Monitor } from "lucide-react";
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

// Dos preguntas separadas, en ese orden: QUÉ se graba (audio, pantalla) y EN
// QUÉ MOMENTOS. Mezclarlas era lo confuso: la pantalla no es un momento más,
// y los momentos valen para todo lo que se grabe.
//
// La conversación no se elige: si algo se graba, se graba la conversación. Se
// muestra igual, como primer momento fijo, para que la lista se entienda
// completa. Lo opcional es seguir grabando en la espera y en el trabajo
// posterior.
//
// Si no se graba ni audio ni pantalla, los momentos no aplican y se apagan.
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
  icon: Icon,
  label,
  description,
  alcance,
  checked,
  onCheckedChange,
  disabled,
  disabledReason,
}: {
  id: string;
  icon?: typeof Mic;
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
        <Label htmlFor={id} className="flex items-center gap-2 text-sm font-medium">
          {Icon && <Icon className="size-3.5 text-secondary" />}
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
  const graba = value.recordAudio || value.recordScreen;
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
      <CardContent className="flex flex-col gap-5">
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-medium">{t("grabacion.queTitulo")}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <ToggleRow
              id={`rec-audio-${ambito}`}
              icon={Mic}
              label={t("grabacion.audio")}
              description={t("grabacion.audioDesc")}
              checked={value.recordAudio}
              onCheckedChange={(v) => set("recordAudio", v)}
            />
            <ToggleRow
              id={`rec-pantalla-${ambito}`}
              icon={Monitor}
              label={t("grabacion.pantalla")}
              description={t("grabacion.pantallaDesc")}
              checked={value.recordScreen}
              onCheckedChange={(v) => set("recordScreen", v)}
            />
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3
            className={`text-sm font-medium ${graba ? "" : "text-muted-foreground"}`}
          >
            {t("grabacion.cuandoTitulo")}
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {/* La conversación no se elige: es lo que se graba siempre. */}
            <div
              className={`flex flex-col gap-2 rounded-lg p-3 ring-1 ring-foreground/10 ${
                graba ? "bg-accent/40" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`text-sm font-medium ${graba ? "" : "text-muted-foreground"}`}
                >
                  {t("grabacion.momentoConversacion")}
                </span>
                {graba ? (
                  <Check className="size-4 shrink-0 text-primary" />
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {t("grabacion.no")}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {graba
                  ? t("grabacion.momentoConversacionDesc")
                  : t("grabacion.sinGrabacion")}
              </p>
            </div>

            <ToggleRow
              id={`rec-hold-${ambito}`}
              label={t("grabacion.hold")}
              description={t("grabacion.holdDesc")}
              disabled={!holdDisponible}
              disabledReason={
                !graba ? t("grabacion.sinGrabacion") : t("grabacion.dependeHold")
              }
              checked={holdDisponible && value.recordAgentAudioDuringHold}
              onCheckedChange={(v) => set("recordAgentAudioDuringHold", v)}
            />
            <ToggleRow
              id={`rec-acw-${ambito}`}
              label={t("grabacion.acw")}
              description={t("grabacion.acwDesc")}
              disabled={!graba}
              disabledReason={t("grabacion.sinGrabacion")}
              checked={graba && value.recordAcw}
              onCheckedChange={(v) => set("recordAcw", v)}
            />
          </div>
        </section>

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
