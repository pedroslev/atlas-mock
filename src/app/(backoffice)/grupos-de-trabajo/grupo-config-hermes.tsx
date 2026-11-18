"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
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
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type {
  RecordingSettingsParams,
  ShortcutButtonEntry,
} from "@/lib/mock-data";
import { AuxMultiSelect } from "./aux-multi-select";

// Valores de working_groups.parameters.productive_aux_on_lock.
type AccionAlBloquear = "keep" | "logout" | "not_available";

function nuevoAccesoRapido(): ShortcutButtonEntry {
  return {
    id: `sb-${crypto.randomUUID()}`,
    nombre: "",
    url: "",
    openAs: "frame",
  };
}

// Tarjeta de comunicación interna del grupo: una para las llamadas internas
// ("directorio") y otra, idéntica, para los chats internos ("chatInterno").
// Mismo criterio en las dos: un interruptor general, a quién (las reglas se
// suman y por defecto vienen todas activas) y si queda registro.
// MOCK: estado local, sin guardar.
// REAL: working_groups.parameters.internal_calls / .internal_chats, cada una
// con enabled, same_working_group, same_projects, same_campaigns y, respectivamente,
// record_audio / save_transcript. Un grupo sin la tarjeta guardada aplica lo
// que se ve acá por defecto. Ver
// documentacion/producto/funcionalidades/chats-internos/.
function TarjetaComunicacionInterna({ tipo }: { tipo: "directorio" | "chatInterno" }) {
  const t = useT();
  const k = (clave: string) => t(`grupos.${tipo}.${clave}`);
  const [habilitada, setHabilitada] = useState(true);
  const [reglas, setReglas] = useState({
    mismoGrupo: true,
    mismasCampanias: true,
    mismosProyectos: true,
  });
  // Quien comparte una campaña comparte también su proyecto: con "mismos
  // proyectos" tildado, "mismas campañas" ya está incluida y no se puede
  // destildar sola.
  const campaniasIncluidas = reglas.mismosProyectos;
  const filas = [
    { key: "mismoGrupo", label: t("grupos.directorio.mismoGrupo"), ayuda: null },
    { key: "mismosProyectos", label: t("grupos.directorio.mismosProyectos"), ayuda: t("grupos.directorio.mismosProyectosAyuda") },
    {
      key: "mismasCampanias",
      label: t("grupos.directorio.mismasCampanias"),
      ayuda: campaniasIncluidas
        ? t("grupos.directorio.mismasCampaniasIncluida")
        : t("grupos.directorio.mismasCampaniasAyuda"),
    },
  ] as const;
  const ningunaRegla = !Object.values(reglas).some(Boolean);
  // Registro: grabar el audio (llamadas) o guardar la conversación (chats).
  // Vive acá y no en "Grabación" porque una comunicación interna no tiene
  // campaña, que es de donde sale la configuración de las demás.
  const [registrar, setRegistrar] = useState(false);

  return (
    <Card data-testid={`grupo-${tipo}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <CardTitle>{k("titulo")}</CardTitle>
            <CardDescription>{k("desc")}</CardDescription>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Label htmlFor={`${tipo}-habilitar`} className="text-sm">
              {k("permitir")}
            </Label>
            <Switch
              id={`${tipo}-habilitar`}
              data-testid={`grupo-${tipo}-habilitar`}
              checked={habilitada}
              onCheckedChange={setHabilitada}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {!habilitada && <p className="text-xs text-muted-foreground">{k("deshabilitadas")}</p>}
        <fieldset disabled={!habilitada} className={cn("flex flex-col gap-5", !habilitada && "opacity-50")}>
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-medium">{k("aQuien")}</h3>
            {filas.map((r) => {
              const incluida = r.key === "mismasCampanias" && campaniasIncluidas;
              return (
                <div key={r.key} className="flex items-start gap-2.5">
                  <Checkbox
                    id={`${tipo}-${r.key}`}
                    data-testid={`grupo-${tipo}-${r.key}`}
                    className="mt-0.5"
                    checked={reglas[r.key] || incluida}
                    disabled={!habilitada || incluida}
                    onCheckedChange={(v) => setReglas((cur) => ({ ...cur, [r.key]: v === true }))}
                  />
                  <div className="flex flex-col gap-0.5">
                    <Label htmlFor={`${tipo}-${r.key}`}>{r.label}</Label>
                    {r.ayuda && <p className="text-xs text-muted-foreground">{r.ayuda}</p>}
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground">{k("noReciproco")}</p>
            {ningunaRegla && habilitada && <p className="text-xs text-warning">{k("ninguna")}</p>}
          </section>

          <section className="flex flex-col gap-3 border-t border-border pt-4">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor={`${tipo}-registrar`} className="text-sm font-medium">
                {k("grabar")}
              </Label>
              <Switch
                id={`${tipo}-registrar`}
                data-testid={`grupo-${tipo}-registrar`}
                checked={registrar}
                onCheckedChange={setRegistrar}
                disabled={!habilitada}
              />
            </div>
            <ul className="flex list-disc flex-col gap-1 pl-4 text-xs text-muted-foreground">
              <li>{k("grabarAudio")}</li>
            </ul>
          </section>
        </fieldset>
      </CardContent>
    </Card>
  );
}

// Solapa "Config. Hermes" del grupo (entre Permisos y el final) — a pedido,
// reorganización del detalle en solapas igual que Campañas. Junta lo que el
// grupo ve/tiene disponible DENTRO del pad: estados auxiliares (ya vivía
// acá, solo se mudó de tarjeta), historial de interacciones del cliente
// (nuevo — agent_operation_settings.history_lookback_days, ver
// parametrizacion-propuesta.md §5: no es por campaña, es por grupo de
// trabajo) y accesos rápidos (working_groups.shortcut_buttons, §11).
export function GrupoConfigHermesTab({
  initialEstadosAuxiliares,
  initialHistoryLookbackDays,
  initialShortcutButtons,
  initialGrabacion,
}: {
  initialEstadosAuxiliares: string[];
  initialHistoryLookbackDays: number;
  initialShortcutButtons: ShortcutButtonEntry[];
  initialGrabacion: RecordingSettingsParams;
}) {
  const t = useT();
  const [historyLookbackDays, setHistoryLookbackDays] = useState(
    String(initialHistoryLookbackDays)
  );
  const [shortcuts, setShortcuts] = useState<ShortcutButtonEntry[]>(initialShortcutButtons);
  // Grabación por grupo: alcance nuevo, todavía no acordado — ver la propuesta
  // de grabaciones en documentacion/relevamiento-legacy/grabaciones/.
  const [grabacion, setGrabacion] = useState<RecordingSettingsParams>(initialGrabacion);

  // Qué hace Hermes cuando un asesor del grupo bloquea la PC estando en un
  // auxiliar productivo. En un auxiliar no productivo no hay nada que
  // configurar: el bloqueo no cambia nada.
  // MOCK: estado local, arranca en "keep".
  // REAL: working_groups.parameters.productive_aux_on_lock
  // ("keep" | "logout" | "not_available", default "keep"). Lo aplica
  // hermes-worker cuando hermes-front le avisa el bloqueo. Ver
  // documentacion/producto/funcionalidades/estados-auxiliares-productivos/.
  const [alBloquear, setAlBloquear] = useState<AccionAlBloquear>("keep");
  const ayudaAlBloquear: Record<AccionAlBloquear, string> = {
    keep: t("grupos.bloqueo.keepAyuda"),
    logout: t("grupos.bloqueo.logoutAyuda"),
    not_available: t("grupos.bloqueo.notAvailableAyuda"),
  };

  function actualizar(id: string, patch: Partial<ShortcutButtonEntry>) {
    setShortcuts((cur) => cur.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function eliminar(id: string) {
    setShortcuts((cur) => cur.filter((s) => s.id !== id));
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("grupos.aux.titulo")}</CardTitle>
          <CardDescription>{t("grupos.aux.desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <AuxMultiSelect initialIds={initialEstadosAuxiliares} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("grupos.bloqueo.titulo")}</CardTitle>
          <CardDescription>{t("grupos.bloqueo.desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1.5 sm:w-1/2">
            <Label htmlFor="aux-al-bloquear">{t("grupos.bloqueo.campo")}</Label>
            <Select
              value={alBloquear}
              onValueChange={(v) => setAlBloquear(v as AccionAlBloquear)}
            >
              <SelectTrigger
                id="aux-al-bloquear"
                data-testid="grupo-aux-al-bloquear"
                className="w-full"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="keep">{t("grupos.bloqueo.keep")}</SelectItem>
                <SelectItem value="not_available">{t("grupos.bloqueo.notAvailable")}</SelectItem>
                <SelectItem value="logout">{t("grupos.bloqueo.logout")}</SelectItem>
              </SelectContent>
            </Select>
            <p
              className="text-xs text-muted-foreground"
              data-testid="grupo-aux-al-bloquear-ayuda"
            >
              {ayudaAlBloquear[alBloquear]}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("grupos.historial.titulo")}</CardTitle>
          <CardDescription>{t("grupos.historial.desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1.5 sm:w-1/3">
            <Label htmlFor="history-lookback-days">{t("grupos.historial.campo")}</Label>
            <Input
              id="history-lookback-days"
              type="number"
              min={0}
              value={historyLookbackDays}
              onChange={(e) => setHistoryLookbackDays(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{t("grupos.historial.ayuda")}</p>
          </div>
        </CardContent>
      </Card>

      <TarjetaComunicacionInterna tipo="directorio" />
      <TarjetaComunicacionInterna tipo="chatInterno" />

      <Card>
        <CardHeader>
          <CardTitle>{t("grupos.shortcuts.titulo")}</CardTitle>
          <CardDescription>{t("grupos.shortcuts.desc")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {shortcuts.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("grupos.shortcuts.sin")}</p>
          )}

          {shortcuts.map((entry) => (
            <div key={entry.id} className="flex flex-col gap-3 rounded-lg p-3 ring-1 ring-foreground/10">
              <div className="flex items-start gap-3">
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <Label htmlFor={`sb-nombre-${entry.id}`}>{t("grupos.shortcuts.nombre")}</Label>
                  <Input
                    id={`sb-nombre-${entry.id}`}
                    value={entry.nombre}
                    onChange={(e) => actualizar(entry.id, { nombre: e.target.value })}
                    placeholder={t("grupos.shortcuts.nombrePlaceholder")}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={t("grupos.shortcuts.eliminar")}
                  className="mt-6 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => eliminar(entry.id)}
                >
                  <Trash2 />
                </Button>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`sb-url-${entry.id}`}>{t("grupos.shortcuts.url")}</Label>
                <Input
                  id={`sb-url-${entry.id}`}
                  value={entry.url}
                  onChange={(e) => actualizar(entry.id, { url: e.target.value })}
                  placeholder={t("grupos.shortcuts.urlPlaceholder")}
                />
                <p className="text-xs text-muted-foreground">{t("grupos.shortcuts.urlAyuda")}</p>
              </div>

              <div className="flex flex-col gap-1.5 sm:w-1/2">
                <Label htmlFor={`sb-open-as-${entry.id}`}>{t("grupos.shortcuts.openAs")}</Label>
                <Select
                  value={entry.openAs}
                  onValueChange={(v) =>
                    actualizar(entry.id, { openAs: v as ShortcutButtonEntry["openAs"] })
                  }
                >
                  <SelectTrigger id={`sb-open-as-${entry.id}`} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frame">{t("grupos.shortcuts.openAsFrame")}</SelectItem>
                    <SelectItem value="blank">{t("grupos.shortcuts.openAsBlank")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-fit gap-1.5"
            onClick={() => setShortcuts((cur) => [...cur, nuevoAccesoRapido()])}
          >
            <Plus />
            {t("grupos.shortcuts.agregar")}
          </Button>
        </CardContent>
      </Card>

      <GrabacionSettings
        value={grabacion}
        onChange={setGrabacion}
        ambito="grupo"
      />
    </div>
  );
}
