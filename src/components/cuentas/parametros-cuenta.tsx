"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArchivoCampo } from "@/components/archivos/archivo-campo";
import { useT } from "@/lib/i18n";

// Topes del archivo de espera: imagen 20 MB, video 50 MB (decisión del
// Chief Innovation Architect, ATLAS-1227). El video se recomprime a 720p en
// el navegador antes de subirlo; el mock solo valida el tamaño de entrada.
export const MAX_MB_IMAGEN_VIDEO = { jpg: 20, jpeg: 20, png: 20, mp4: 50, webm: 50 };

// ATLAS-1227: parámetros de la cuenta de chat y de videollamada.
// - Chat: cierre por inactividad y aviso antes del cierre.
// - Videollamada: lo que ve el cliente mientras espera un asesor. La calidad
//   de video no se configura: la fija la plataforma (720p como techo).
// Estado local: en el mock no se guarda.
export function ParametrosCuenta({ tipo }: { tipo: "Chat" | "Videollamada" }) {
  const t = useT();
  const [cierre, setCierre] = useState({ minutos: 10, aviso: true, avisoMinutos: 2 });
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
                min={cierre.aviso ? 2 : 1}
                className="w-24"
                value={cierre.minutos}
                onChange={(e) =>
                  setCierre((c) => {
                    // Con aviso, el cierre es de al menos 2 minutos y el aviso
                    // queda siempre al menos un minuto antes: si el cierre baja,
                    // el aviso baja con él.
                    const minutos = Math.max(c.aviso ? 2 : 1, Math.round(Number(e.target.value)) || 1);
                    return { ...c, minutos, avisoMinutos: Math.min(c.avisoMinutos, minutos - 1) || 1 };
                  })
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
                onCheckedChange={(v) =>
                  setCierre((c) => {
                    if (!v) return { ...c, aviso: false };
                    const minutos = Math.max(2, c.minutos);
                    return { ...c, aviso: true, minutos, avisoMinutos: Math.min(c.avisoMinutos, minutos - 1) };
                  })
                }
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
                        Math.max(1, Math.round(Number(e.target.value)) || 1)
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
        <CardContent>
          <div className="flex flex-col gap-1.5 lg:max-w-[50%]">
            <Label htmlFor="espera-asesor">{t("cuentas.propuesta.espera")}</Label>
            <ArchivoCampo
              id="espera-asesor"
              value={esperaArchivo}
              onChange={setEsperaArchivo}
              extensiones={["jpg", "jpeg", "png", "mp4", "webm"]}
              maxMB={MAX_MB_IMAGEN_VIDEO}
            />
            <p className="text-xs text-muted-foreground">{t("cuentas.propuesta.esperaDesc")}</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
