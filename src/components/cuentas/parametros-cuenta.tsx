"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArchivoCampo } from "@/components/archivos/archivo-campo";
import { useT } from "@/lib/i18n";

type Calidad = "baja" | "media" | "alta";

// ATLAS-1227: parámetros de la cuenta de chat y de videollamada.
// - Chat: cierre por inactividad y aviso antes del cierre.
// - Videollamada: calidad de video (reemplaza resolución de cámara y
//   cuadros por segundo) y lo que ve el cliente mientras espera un asesor.
// Estado local: en el mock no se guarda.
export function ParametrosCuenta({ tipo }: { tipo: "Chat" | "Videollamada" }) {
  const t = useT();
  const [cierre, setCierre] = useState({ minutos: 10, aviso: true, avisoMinutos: 2 });
  const [calidad, setCalidad] = useState<Calidad>("media");
  const [esperaArchivo, setEsperaArchivo] = useState<string | undefined>();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {tipo === "Chat" ? t("cuentas.propuesta.chatTitulo") : t("cuentas.propuesta.videoTitulo")}
        </CardTitle>
        <CardDescription>
          {tipo === "Chat" ? t("cuentas.propuesta.chatDesc") : t("cuentas.propuesta.videoDesc")}
        </CardDescription>
      </CardHeader>

      {tipo === "Chat" ? (
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cierre-inactividad">{t("cuentas.propuesta.cierre")}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="cierre-inactividad"
                type="number"
                min={1}
                className="w-24"
                value={cierre.minutos}
                onChange={(e) =>
                  setCierre((c) => ({ ...c, minutos: Math.max(1, Number(e.target.value) || 1) }))
                }
              />
              <span className="text-sm text-muted-foreground">{t("cuentas.propuesta.minutos")}</span>
            </div>
            <p className="text-xs text-muted-foreground">{t("cuentas.propuesta.cierreDesc")}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="aviso-cierre" className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">{t("cuentas.propuesta.aviso")}</span>
              <Switch
                id="aviso-cierre"
                checked={cierre.aviso}
                onCheckedChange={(v) => setCierre((c) => ({ ...c, aviso: v }))}
              />
            </label>
            {cierre.aviso && (
              <div className="flex items-center gap-2">
                <Input
                  id="aviso-cierre-minutos"
                  aria-label={t("cuentas.propuesta.avisoMinutos")}
                  type="number"
                  min={1}
                  max={Math.max(1, cierre.minutos - 1)}
                  className="w-24"
                  value={cierre.avisoMinutos}
                  onChange={(e) =>
                    setCierre((c) => ({
                      ...c,
                      avisoMinutos: Math.min(
                        Math.max(1, c.minutos - 1),
                        Math.max(1, Number(e.target.value) || 1)
                      ),
                    }))
                  }
                />
                <span className="text-sm text-muted-foreground">
                  {t("cuentas.propuesta.minutosAntes")}
                </span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">{t("cuentas.propuesta.avisoDesc")}</p>
          </div>
        </CardContent>
      ) : (
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="calidad-video">{t("cuentas.propuesta.calidad")}</Label>
            <Select value={calidad} onValueChange={(v) => setCalidad(v as Calidad)}>
              <SelectTrigger id="calidad-video" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baja">{t("cuentas.propuesta.calidadBaja")}</SelectItem>
                <SelectItem value="media">{t("cuentas.propuesta.calidadMedia")}</SelectItem>
                <SelectItem value="alta">{t("cuentas.propuesta.calidadAlta")}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{t("cuentas.propuesta.calidadDesc")}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="espera-asesor">{t("cuentas.propuesta.espera")}</Label>
            <ArchivoCampo
              id="espera-asesor"
              value={esperaArchivo}
              onChange={setEsperaArchivo}
              extensiones={["jpg", "jpeg", "png", "mp4", "webm"]}
            />
            <p className="text-xs text-muted-foreground">{t("cuentas.propuesta.esperaDesc")}</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
