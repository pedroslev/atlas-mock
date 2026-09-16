"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useT } from "@/lib/i18n";
import {
  campanias,
  grabacionEfectiva,
  gruposTrabajo,
  type RecordingSettingsParams,
} from "@/lib/mock-data";

// Hace visible la regla "gana lo más restrictivo": se elige la otra mitad del
// cruce (un grupo si estamos en la campaña, una campaña si estamos en el
// grupo) y se muestra qué se graba realmente, diciendo quién lo restringió.
//
// Mock: sirve para discutir la regla en pantalla. No es una pantalla pedida
// por nadie todavía — puede quedar afuera si en la sesión del lunes se decide
// otra forma de resolver el cruce.

type Fila = {
  key: keyof RecordingSettingsParams;
  label: string;
};

export function GrabacionResultado({
  propio,
  ambito,
}: {
  propio: RecordingSettingsParams;
  ambito: "campania" | "grupo";
}) {
  const t = useT();

  // Del otro lado del cruce: si estoy en la campaña, elijo un grupo; si estoy
  // en el grupo, elijo una campaña.
  const otros =
    ambito === "campania"
      ? gruposTrabajo.map((g) => ({
          id: g.id,
          nombre: g.nombre,
          settings: g.recordingSettings,
        }))
      : campanias.map((c) => ({
          id: c.id,
          nombre: c.nombre,
          settings: c.parametros.recordingSettings,
        }));

  const [otroId, setOtroId] = useState(otros[0]?.id);
  const otro = otros.find((o) => o.id === otroId) ?? otros[0];
  if (!otro) return null;

  const campania = ambito === "campania" ? propio : otro.settings;
  const grupo = ambito === "campania" ? otro.settings : propio;
  const efectiva = grabacionEfectiva(campania, grupo);

  const filas: Fila[] = [
    { key: "recordInteraction", label: t("grabacion.interaccion") },
    { key: "recordAgentAudioDuringHold", label: t("grabacion.hold") },
    { key: "recordAcw", label: t("grabacion.acw") },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("grabacion.resultadoTitulo")}</CardTitle>
        <CardDescription>{t("grabacion.resultadoDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5 sm:w-80">
          <Label htmlFor="grabacion-cruce">
            {ambito === "campania"
              ? t("grabacion.cruceGrupo")
              : t("grabacion.cruceCampania")}
          </Label>
          <Select value={otroId} onValueChange={setOtroId}>
            <SelectTrigger id="grabacion-cruce" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {otros.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          {filas.map(({ key, label }) => {
            const seGraba = efectiva[key];
            // Quién lo apagó: puede ser uno, el otro, o los dos.
            const loApagaCampania = !campania[key];
            const loApagaGrupo = !grupo[key];
            const motivo = seGraba
              ? undefined
              : loApagaCampania && loApagaGrupo
                ? t("grabacion.motivoAmbos")
                : loApagaCampania
                  ? t("grabacion.motivoCampania")
                  : loApagaGrupo
                    ? t("grabacion.motivoGrupo")
                    : t("grabacion.motivoSinInteraccion");

            return (
              <div
                key={key}
                className="flex items-center justify-between gap-3 rounded-lg p-3 ring-1 ring-foreground/10"
              >
                <span className="text-sm">{label}</span>
                <span className="flex items-center gap-2">
                  {motivo && (
                    <span className="text-xs text-muted-foreground">
                      {motivo}
                    </span>
                  )}
                  <span
                    className={`flex items-center gap-1.5 text-sm font-medium ${
                      seGraba ? "text-success" : "text-muted-foreground"
                    }`}
                  >
                    {seGraba ? (
                      <Check className="size-4" />
                    ) : (
                      <X className="size-4" />
                    )}
                    {seGraba ? t("grabacion.seGraba") : t("grabacion.noSeGraba")}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
