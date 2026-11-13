"use client";

import type { ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
import { GrabacionSettings } from "@/components/grabacion/grabacion-settings";
import { ArchivoCampo } from "@/components/archivos/archivo-campo";
import { useT } from "@/lib/i18n";
import type {
  AgentControlsParams,
  AgentOperationSettingsParams,
  AlertaConSonido,
  ClientMediaParams,
  DisplaySettingsParams,
  FondoAsesor,
  InteractionUrlEntry,
  RecordingSettingsParams,
  RingSound,
} from "@/lib/mock-data";

// Tipos de archivo de los parámetros nuevos de ATLAS-1227 (a definir con
// Pedro: la propuesta deja tipos y tamaños abiertos).
const EXT_AUDIO = ["mp3", "wav", "ogg"];
const EXT_IMAGEN_VIDEO = ["jpg", "jpeg", "png", "mp4", "webm"];
const EXT_IMAGEN = ["jpg", "jpeg", "png"];

// Cinco solapas de campania-editor.tsx (entre General y Usuarios), una por
// grupo de campaigns.parameters con "Dónde va: Parámetro de campaña" — ver
// el comentario junto al tipo CampaniaParametros en mock-data.ts para qué
// grupos del documento quedaron afuera y por qué. ATLAS-1227 suma una sexta,
// "Lo que ve y escucha el cliente".
function ToggleRow({
  id,
  label,
  description,
  alcance,
  checked,
  onCheckedChange,
  disabled,
  disabledReason,
  children,
}: {
  id: string;
  label: string;
  description: string;
  alcance?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
  disabledReason?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg p-3 ring-1 ring-foreground/10">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id} className="flex items-center gap-2 text-sm font-medium">
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
      {children}
    </div>
  );
}

// Un número con su unidad, debajo de un parámetro que lo usa.
function CampoNumero({
  id,
  label,
  unidad,
  value,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  unidad: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        min={1}
        className="h-8 w-24"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Math.max(1, Math.round(Number(e.target.value)) || 1))}
      />
      <span className="text-xs text-muted-foreground">{unidad}</span>
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
        <ToggleRow
          id="allow-screen-share"
          label={t("campanias.parametros.allowScreenShare")}
          description={t("campanias.parametros.allowScreenShareDesc")}
          alcance={t("campanias.parametros.alcanceTiempoReal")}
          checked={value.allowScreenShare}
          onCheckedChange={(v) => set("allowScreenShare", v)}
        />
        <ToggleRow
          id="allow-attachments"
          label={t("campanias.parametros.allowAttachments")}
          description={t("campanias.parametros.allowAttachmentsDesc")}
          alcance={t("campanias.parametros.alcanceChats")}
          checked={value.allowAttachments}
          onCheckedChange={(v) => set("allowAttachments", v)}
        />
        <ToggleRow
          id="allow-download-client-files"
          label={t("campanias.parametros.allowDownloadClientFiles")}
          description={t("campanias.parametros.allowDownloadClientFilesDesc")}
          alcance={t("campanias.parametros.alcanceChats")}
          checked={value.allowDownloadClientFiles}
          onCheckedChange={(v) => set("allowDownloadClientFiles", v)}
        >
        </ToggleRow>
        <ToggleRow
          id="allow-emoji-picker"
          label={t("campanias.parametros.allowEmojiPicker")}
          description={t("campanias.parametros.allowEmojiPickerDesc")}
          alcance={t("campanias.parametros.alcanceChats")}
          checked={value.allowEmojiPicker}
          onCheckedChange={(v) => set("allowEmojiPicker", v)}
        />
        <ToggleRow
          id="allow-image-capture"
          label={t("campanias.parametros.allowImageCapture")}
          description={t("campanias.parametros.allowImageCaptureDesc")}
          alcance={t("campanias.parametros.alcanceVideollamada")}
          checked={value.allowImageCapture}
          onCheckedChange={(v) => set("allowImageCapture", v)}
        />
      </CardContent>
    </Card>
  );
}

// Alerta con umbral y, opcionalmente, sonido (duración y espera).
function AlertaRow({
  id,
  label,
  description,
  alcance,
  unidad,
  value,
  onChange,
  conSonido = true,
  disabled,
  disabledReason,
}: {
  id: string;
  label: string;
  description: string;
  alcance: string;
  unidad: string;
  value: { enabled: boolean; valor: number; sound?: boolean };
  onChange: (v: { enabled: boolean; valor: number; sound?: boolean }) => void;
  conSonido?: boolean;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const t = useT();
  return (
    <ToggleRow
      id={id}
      label={label}
      description={description}
      alcance={alcance}
      checked={value.enabled && !disabled}
      disabled={disabled}
      disabledReason={disabledReason}
      onCheckedChange={(v) => onChange({ ...value, enabled: v })}
    >
      {value.enabled && !disabled && (
        <div className="flex flex-col gap-2 border-t pt-2">
          <CampoNumero
            id={`${id}-valor`}
            label={t("campanias.parametros.alertaPasados")}
            unidad={unidad}
            value={value.valor}
            onChange={(n) => onChange({ ...value, valor: n })}
          />
          {conSonido && (
            <label htmlFor={`${id}-sonido`} className="flex items-center gap-2 text-xs">
              <Checkbox
                id={`${id}-sonido`}
                checked={!!value.sound}
                onCheckedChange={(c) => onChange({ ...value, sound: c === true })}
              />
              {t("campanias.parametros.alertaConSonido")}
            </label>
          )}
        </div>
      )}
    </ToggleRow>
  );
}

export function VisualizacionTab({
  value,
  onChange,
  holdHabilitado,
}: {
  value: DisplaySettingsParams;
  onChange: (v: DisplaySettingsParams) => void;
  holdHabilitado: boolean;
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
          onCheckedChange={(v) => onChange({ ...value, allowRinging: v })}
        >
          {/* ATLAS-1227: con el timbre prendido, se elige qué suena. */}
          {value.allowRinging && (
            <div className="flex flex-col gap-2 rounded-md p-2 ring-1 ring-foreground/10">
              <Label htmlFor="ring-sound" className="flex items-center gap-2 text-xs">
                {t("campanias.parametros.ringSound")}
              </Label>
              <Select
                value={value.ringSound}
                onValueChange={(v) => onChange({ ...value, ringSound: v as RingSound })}
              >
                <SelectTrigger id="ring-sound" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clasico">{t("campanias.parametros.ringClasico")}</SelectItem>
                  <SelectItem value="suave">{t("campanias.parametros.ringSuave")}</SelectItem>
                  <SelectItem value="digital">{t("campanias.parametros.ringDigital")}</SelectItem>
                  <SelectItem value="propio">{t("campanias.parametros.ringPropio")}</SelectItem>
                </SelectContent>
              </Select>
              {value.ringSound === "propio" && (
                <ArchivoCampo
                  id="ring-sound-file"
                  value={value.ringSoundFile}
                  onChange={(f) => onChange({ ...value, ringSoundFile: f })}
                  extensiones={EXT_AUDIO}
                  maxMB={1}
                />
              )}
            </div>
          )}
        </ToggleRow>
        <AlertaRow
          id="duration-alert"
          label={t("campanias.parametros.durationAlert")}
          description={t("campanias.parametros.durationAlertDesc")}
          alcance={t("campanias.parametros.alcanceTodos")}
          unidad={t("campanias.parametros.minutos")}
          value={value.durationAlert}
          onChange={(v) => onChange({ ...value, durationAlert: v as AlertaConSonido })}
        />
        <AlertaRow
          id="hold-alert"
          label={t("campanias.parametros.holdAlert")}
          description={t("campanias.parametros.holdAlertDesc")}
          alcance={t("campanias.parametros.alcanceConEspera")}
          unidad={t("campanias.parametros.segundos")}
          disabled={!holdHabilitado}
          disabledReason={t("campanias.parametros.holdAlertDependeHold")}
          value={value.holdAlert}
          onChange={(v) => onChange({ ...value, holdAlert: v as AlertaConSonido })}
        />
        <AlertaRow
          id="no-reply-alert"
          label={t("campanias.parametros.noReplyAlert")}
          description={t("campanias.parametros.noReplyAlertDesc")}
          alcance={t("campanias.parametros.alcanceChat")}
          unidad={t("campanias.parametros.segundos")}
          conSonido={false}
          value={value.noReplyAlert}
          onChange={(v) => onChange({ ...value, noReplyAlert: { enabled: v.enabled, valor: v.valor } })}
        />
      </CardContent>
    </Card>
  );
}

// La grabación se configura igual en la campaña y en el grupo de trabajo, así
// que los switches viven en un componente compartido.
export function GrabacionTab({
  value,
  onChange,
  holdHabilitado,
}: {
  value: RecordingSettingsParams;
  onChange: (v: RecordingSettingsParams) => void;
  holdHabilitado: boolean;
}) {
  return (
    <GrabacionSettings
      value={value}
      onChange={onChange}
      ambito="campania"
      holdHabilitado={holdHabilitado}
    />
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
          onCheckedChange={(v) => onChange({ ...value, forcedAnswer: v })}
        />
        {/* ATLAS-1227: siempre hay un tope (Atlas ya aplica 60 s); lo que
            suma la propuesta es poder elegirlo. Por eso no lleva switch. */}
        <div className="flex flex-col gap-2 rounded-lg p-3 ring-1 ring-foreground/10">
          <Label htmlFor="max-acw" className="flex items-center gap-2 text-sm font-medium">
            {t("campanias.parametros.maxAcw")}
          </Label>
          <p className="text-xs text-muted-foreground">{t("campanias.parametros.maxAcwDesc")}</p>
          <CampoNumero
            id="max-acw"
            label={t("campanias.parametros.maxAcwCampo")}
            unidad={t("campanias.parametros.segundos")}
            value={value.maxAcwSeconds}
            onChange={(n) => onChange({ ...value, maxAcwSeconds: n })}
          />
          <Badge variant="outline" className="w-fit text-[0.65rem] font-normal">
            {t("campanias.parametros.alcanceTodos")}
          </Badge>
        </div>
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
                    <SelectItem value="manual">{t("campanias.parametros.modeManual")}</SelectItem>
                    <SelectItem value="start">{t("campanias.parametros.modeStart")}</SelectItem>
                    <SelectItem value="end">{t("campanias.parametros.modeEnd")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ATLAS-1227: solo tiene sentido en pestaña nueva; embebida en
                Hermes, la URL ya se va con la interacción. */}
            {entry.openAs === "blank" && (
              <label
                htmlFor={`url-close-${entry.id}`}
                className="flex items-start gap-2 rounded-md p-2 ring-1 ring-foreground/10"
              >
                <Checkbox
                  id={`url-close-${entry.id}`}
                  className="mt-0.5"
                  checked={!!entry.closeOnEnd}
                  onCheckedChange={(c) => actualizar(entry.id, { closeOnEnd: c === true })}
                />
                <span className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    {t("campanias.parametros.closeOnEnd")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t("campanias.parametros.closeOnEndDesc")}
                  </span>
                </span>
              </label>
            )}
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

// ATLAS-1227: lo que ve y escucha el cliente en webcall y videollamada.
// Solapa propia por ahora; si va así o dentro de otra lo decide Pedro.
export function ClienteTab({
  value,
  onChange,
}: {
  value: ClientMediaParams;
  onChange: (v: ClientMediaParams) => void;
}) {
  const t = useT();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {t("campanias.parametros.clienteTitulo")}
        </CardTitle>
        <CardDescription>{t("campanias.parametros.clienteDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-lg p-3 ring-1 ring-foreground/10">
          <Label htmlFor="hold-audio" className="text-sm font-medium">
            {t("campanias.parametros.holdAudio")}
          </Label>
          <p className="text-xs text-muted-foreground">{t("campanias.parametros.holdAudioDesc")}</p>
          <ArchivoCampo
            id="hold-audio"
            value={value.holdAudioFile}
            onChange={(f) => onChange({ ...value, holdAudioFile: f })}
            extensiones={EXT_AUDIO}
          />
          <Badge variant="outline" className="w-fit text-[0.65rem] font-normal">
            {t("campanias.parametros.alcanceTelefoniaWebcall")}
          </Badge>
        </div>

        <div className="flex flex-col gap-2 rounded-lg p-3 ring-1 ring-foreground/10">
          <Label htmlFor="hold-video" className="text-sm font-medium">
            {t("campanias.parametros.holdVideo")}
          </Label>
          <p className="text-xs text-muted-foreground">{t("campanias.parametros.holdVideoDesc")}</p>
          <ArchivoCampo
            id="hold-video"
            value={value.holdVideoFile}
            onChange={(f) => onChange({ ...value, holdVideoFile: f })}
            extensiones={EXT_IMAGEN_VIDEO}
          />
          <Badge variant="outline" className="w-fit text-[0.65rem] font-normal">
            {t("campanias.parametros.alcanceVideollamada")}
          </Badge>
        </div>

        <div className="flex flex-col gap-2 rounded-lg p-3 ring-1 ring-foreground/10 sm:col-span-2">
          <Label htmlFor="agent-background" className="text-sm font-medium">
            {t("campanias.parametros.agentBackground")}
          </Label>
          <p className="text-xs text-muted-foreground">
            {t("campanias.parametros.agentBackgroundDesc")}
          </p>
          <Select
            value={value.agentBackground}
            onValueChange={(v) => onChange({ ...value, agentBackground: v as FondoAsesor })}
          >
            <SelectTrigger id="agent-background" className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ninguno">{t("campanias.parametros.fondoNinguno")}</SelectItem>
              <SelectItem value="desenfocado">{t("campanias.parametros.fondoDesenfocado")}</SelectItem>
              <SelectItem value="imagen">{t("campanias.parametros.fondoImagen")}</SelectItem>
            </SelectContent>
          </Select>
          {value.agentBackground === "imagen" && (
            <ArchivoCampo
              id="agent-background-file"
              value={value.agentBackgroundFile}
              onChange={(f) => onChange({ ...value, agentBackgroundFile: f })}
              extensiones={EXT_IMAGEN}
              maxMB={2}
            />
          )}
          <Badge variant="outline" className="w-fit text-[0.65rem] font-normal">
            {t("campanias.parametros.alcanceVideollamada")}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
