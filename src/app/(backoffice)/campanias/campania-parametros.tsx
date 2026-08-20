"use client";

import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useT } from "@/lib/i18n";
import type {
  AgentControlsParams,
  AgentOperationSettingsParams,
  DisplaySettingsParams,
  InteractionUrlEntry,
  RecordingSettingsParams,
} from "@/lib/mock-data";

// Cinco solapas de campania-editor.tsx (entre General y Usuarios), una por
// grupo de campaigns.parameters con "Dónde va: Parámetro de campaña" — ver
// el comentario junto al tipo CampaniaParametros en mock-data.ts para qué
// grupos del documento quedaron afuera y por qué.
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

export function ControlesAgenteTab({
  value,
  onChange,
}: {
  value: AgentControlsParams;
  onChange: (v: AgentControlsParams) => void;
}) {
  const t = useT();
  function set<K extends keyof AgentControlsParams>(key: K, v: boolean) {
    onChange({ ...value, [key]: v });
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("campanias.parametros.controlesAgenteTitulo")}</CardTitle>
        <CardDescription>{t("campanias.parametros.controlesAgenteDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <ToggleRow
          id="allow-hold"
          label={t("campanias.parametros.allowHold")}
          description={t("campanias.parametros.allowHoldDesc")}
          alcance={t("campanias.parametros.allowHoldAlcance")}
          checked={value.allowHold}
          onCheckedChange={(v) => set("allowHold", v)}
        />
        <ToggleRow
          id="allow-hangup"
          label={t("campanias.parametros.allowHangup")}
          description={t("campanias.parametros.allowHangupDesc")}
          alcance={t("campanias.parametros.allowHangupAlcance")}
          checked={value.allowHangup}
          onCheckedChange={(v) => set("allowHangup", v)}
        />
        <ToggleRow
          id="allow-bookmark"
          label={t("campanias.parametros.allowAddBookmark")}
          description={t("campanias.parametros.allowAddBookmarkDesc")}
          alcance={t("campanias.parametros.allowAddBookmarkAlcance")}
          checked={value.allowAddBookmark}
          onCheckedChange={(v) => set("allowAddBookmark", v)}
        />
        <ToggleRow
          id="allow-mute"
          label={t("campanias.parametros.allowMute")}
          description={t("campanias.parametros.allowMuteDesc")}
          alcance={t("campanias.parametros.allowMuteAlcance")}
          checked={value.allowMute}
          onCheckedChange={(v) => set("allowMute", v)}
        />
        <ToggleRow
          id="allow-classification"
          label={t("campanias.parametros.allowClassification")}
          description={t("campanias.parametros.allowClassificationDesc")}
          alcance={t("campanias.parametros.allowClassificationAlcance")}
          checked={value.allowClassification}
          onCheckedChange={(v) => set("allowClassification", v)}
        />
        <ToggleRow
          id="force-classification"
          label={t("campanias.parametros.forceClassification")}
          description={t("campanias.parametros.forceClassificationDesc")}
          disabledReason={t("campanias.parametros.forceClassificationDependeClassification")}
          alcance={t("campanias.parametros.forceClassificationAlcance")}
          checked={value.allowClassification && value.forceClassification}
          disabled={!value.allowClassification}
          onCheckedChange={(v) => set("forceClassification", v)}
        />
      </CardContent>
    </Card>
  );
}

export function VisualizacionTab({
  value,
  onChange,
}: {
  value: DisplaySettingsParams;
  onChange: (v: DisplaySettingsParams) => void;
}) {
  const t = useT();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("campanias.parametros.visualizacionTitulo")}</CardTitle>
        <CardDescription>{t("campanias.parametros.visualizacionDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <ToggleRow
          id="allow-ringing"
          label={t("campanias.parametros.allowRinging")}
          description={t("campanias.parametros.allowRingingDesc")}
          alcance={t("campanias.parametros.allowRingingAlcance")}
          checked={value.allowRinging}
          onCheckedChange={(v) => onChange({ allowRinging: v })}
        />
      </CardContent>
    </Card>
  );
}

export function GrabacionTab({
  value,
  onChange,
  holdHabilitado,
}: {
  value: RecordingSettingsParams;
  onChange: (v: RecordingSettingsParams) => void;
  holdHabilitado: boolean;
}) {
  const t = useT();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("campanias.parametros.grabacionTitulo")}</CardTitle>
        <CardDescription>{t("campanias.parametros.grabacionDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <ToggleRow
          id="record-hold"
          label={t("campanias.parametros.recordHold")}
          description={t("campanias.parametros.recordHoldDesc")}
          disabledReason={t("campanias.parametros.recordHoldDependeHold")}
          alcance={t("campanias.parametros.recordHoldAlcance")}
          checked={holdHabilitado && value.recordAgentAudioDuringHold}
          disabled={!holdHabilitado}
          onCheckedChange={(v) => onChange({ recordAgentAudioDuringHold: v })}
        />
      </CardContent>
    </Card>
  );
}

export function ConfigOperativaTab({
  value,
  onChange,
}: {
  value: AgentOperationSettingsParams;
  onChange: (v: AgentOperationSettingsParams) => void;
}) {
  const t = useT();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("campanias.parametros.configOperativaTitulo")}</CardTitle>
        <CardDescription>{t("campanias.parametros.configOperativaDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <ToggleRow
          id="forced-answer"
          label={t("campanias.parametros.forcedAnswer")}
          description={t("campanias.parametros.forcedAnswerDesc")}
          alcance={t("campanias.parametros.forcedAnswerAlcance")}
          checked={value.forcedAnswer}
          onCheckedChange={(v) => onChange({ forcedAnswer: v })}
        />
      </CardContent>
    </Card>
  );
}

function nuevaUrlExterna(): InteractionUrlEntry {
  return {
    id: `url-${crypto.randomUUID()}`,
    nombre: "",
    url: "",
    openAs: "frame",
    mode: "manual",
  };
}

// A pedido: ya no es una URL única — se van agregando de a una, sin
// máximo, y cada una configura su propio modo de apertura y momento.
export function UrlsExternasTab({
  value,
  onChange,
}: {
  value: InteractionUrlEntry[];
  onChange: (v: InteractionUrlEntry[]) => void;
}) {
  const t = useT();

  function actualizar(id: string, patch: Partial<InteractionUrlEntry>) {
    onChange(value.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
  }

  function eliminar(id: string) {
    onChange(value.filter((entry) => entry.id !== id));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("campanias.parametros.urlInteraccionTitulo")}</CardTitle>
        <CardDescription>{t("campanias.parametros.urlInteraccionDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {value.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("campanias.parametros.sinUrls")}</p>
        )}

        {value.map((entry) => (
          <div key={entry.id} className="flex flex-col gap-3 rounded-lg p-3 ring-1 ring-foreground/10">
            <div className="flex items-start gap-3">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Label htmlFor={`url-nombre-${entry.id}`}>{t("campanias.parametros.urlNombre")}</Label>
                <Input
                  id={`url-nombre-${entry.id}`}
                  value={entry.nombre}
                  onChange={(e) => actualizar(entry.id, { nombre: e.target.value })}
                  placeholder={t("campanias.parametros.urlNombrePlaceholder")}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t("campanias.parametros.eliminarUrl")}
                className="mt-6 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => eliminar(entry.id)}
              >
                <Trash2 />
              </Button>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`url-${entry.id}`}>{t("campanias.parametros.url")}</Label>
              <Input
                id={`url-${entry.id}`}
                value={entry.url}
                onChange={(e) => actualizar(entry.id, { url: e.target.value })}
                placeholder={t("campanias.parametros.urlPlaceholder")}
              />
              <p className="text-xs text-muted-foreground">{t("campanias.parametros.urlAyuda")}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`url-open-as-${entry.id}`}>{t("campanias.parametros.openAs")}</Label>
                <Select
                  value={entry.openAs}
                  onValueChange={(v) =>
                    actualizar(entry.id, { openAs: v as InteractionUrlEntry["openAs"] })
                  }
                >
                  <SelectTrigger id={`url-open-as-${entry.id}`} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frame">{t("campanias.parametros.openAsFrame")}</SelectItem>
                    <SelectItem value="blank">{t("campanias.parametros.openAsBlank")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`url-mode-${entry.id}`}>{t("campanias.parametros.momento")}</Label>
                <Select
                  value={entry.mode}
                  onValueChange={(v) => actualizar(entry.id, { mode: v as InteractionUrlEntry["mode"] })}
                >
                  <SelectTrigger id={`url-mode-${entry.id}`} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="start">{t("campanias.parametros.modeStart")}</SelectItem>
                    <SelectItem value="end">{t("campanias.parametros.modeEnd")}</SelectItem>
                    <SelectItem value="manual">{t("campanias.parametros.modeManual")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-fit gap-1.5"
          onClick={() => onChange([...value, nuevaUrlExterna()])}
        >
          <Plus />
          {t("campanias.parametros.agregarUrl")}
        </Button>
      </CardContent>
    </Card>
  );
}
