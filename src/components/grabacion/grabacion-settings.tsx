"use client";

import { Info, Mic, Monitor } from "lucide-react";
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

// La pantalla NO es un cuarto momento: es otro canal (audio / pantalla) que se
// graba en los MISMOS momentos elegidos arriba. Por eso va debajo de los tres,
// en una fila aparte que va mostrando los momentos que hereda — así la
// dependencia se ve sin tener que explicarla por escrito.
//
// "Grabar la interacción" es el principal: apagado, no se graba nada, ni audio
// ni pantalla.
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

  // Los momentos activos, que la pantalla hereda tal cual.
  const momentos = [
    graba && t("grabacion.momentoInteraccion"),
    holdDisponible && value.recordAgentAudioDuringHold && t("grabacion.momentoHold"),
    graba && value.recordAcw && t("grabacion.momentoAcw"),
  ].filter(Boolean) as string[];

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

        {/* Los dos canales, en la misma fila y con los mismos momentos al
            lado: el audio va siempre, la pantalla es opcional. */}
        <div className="flex flex-col gap-2 rounded-lg p-3 ring-1 ring-foreground/10">
          <CanalRow
            icon={Mic}
            label={t("grabacion.canalAudio")}
            momentos={momentos}
            vacio={t("grabacion.sinMomentos")}
          />
          <div className="h-px bg-foreground/10" />
          <CanalRow
            icon={Monitor}
            label={t("grabacion.canalPantalla")}
            momentos={value.recordScreen ? momentos : []}
            vacio={t("grabacion.sinMomentos")}
            control={
              <Switch
                id={`rec-pantalla-${ambito}`}
                checked={graba && value.recordScreen}
                disabled={!graba}
                onCheckedChange={(v) => set("recordScreen", v)}
              />
            }
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

// Una línea por canal: el nombre a la izquierda, los momentos que graba en el
// medio y, si es opcional, su interruptor a la derecha.
function CanalRow({
  icon: Icon,
  label,
  momentos,
  vacio,
  control,
}: {
  icon: typeof Mic;
  label: string;
  momentos: string[];
  vacio: string;
  control?: React.ReactNode;
}) {
  const activo = momentos.length > 0;
  return (
    <div className="flex items-center gap-3 py-1">
      <span
        className={`flex w-40 shrink-0 items-center gap-2 text-sm font-medium ${
          activo ? "" : "text-muted-foreground"
        }`}
      >
        <Icon
          className={`size-3.5 ${activo ? "text-secondary" : "text-muted-foreground"}`}
        />
        {label}
      </span>
      <span className="flex flex-1 flex-wrap items-center gap-1.5">
        {activo ? (
          momentos.map((m) => (
            <Badge
              key={m}
              variant="outline"
              className="bg-accent/50 text-[0.7rem] font-normal"
            >
              {m}
            </Badge>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">{vacio}</span>
        )}
      </span>
      {control}
    </div>
  );
}
