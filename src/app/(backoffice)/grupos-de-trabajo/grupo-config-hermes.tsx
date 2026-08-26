"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
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
import type { ShortcutButtonEntry } from "@/lib/mock-data";
import { AuxMultiSelect } from "./aux-multi-select";

function nuevoAccesoRapido(): ShortcutButtonEntry {
  return {
    id: `sb-${crypto.randomUUID()}`,
    nombre: "",
    url: "",
    openAs: "frame",
  };
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
}: {
  initialEstadosAuxiliares: string[];
  initialHistoryLookbackDays: number;
  initialShortcutButtons: ShortcutButtonEntry[];
}) {
  const t = useT();
  const [historyLookbackDays, setHistoryLookbackDays] = useState(
    String(initialHistoryLookbackDays)
  );
  const [shortcuts, setShortcuts] = useState<ShortcutButtonEntry[]>(initialShortcutButtons);

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
    </div>
  );
}
