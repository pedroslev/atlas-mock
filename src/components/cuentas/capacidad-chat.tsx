"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/lib/i18n";
import { cuentas } from "@/lib/mock-data";

// Un asesor tiene 100 de capacidad. Una cuenta de chat define cuántas
// interacciones simultáneas entran en ella (`provisioning`) y qué parte de la
// capacidad reserva (`provisioning_lock`, el cupo en %); lo que ocupa cada una
// (`interaction_value`) es cupo / simultáneas. Así el tenant puede pedir, por ejemplo, 4 mails y 3
// chats a la vez sin que una cuenta le coma el lugar a la otra.
// Sin límite (el check "Limitar" apagado): cada chat vale 10, o sea hasta 10
// chats a la vez por asesor. La cuenta se guarda con provisioning y
// provisioning_lock en 0 (no reserva capacidad) e interaction_value en 10.
export const VALOR_SIN_LIMITE = 10;

export const valorDeInteraccion = (cupo: number, simultaneas: number) =>
  Math.floor(cupo / simultaneas);

// Cupo que ya reservan las demás cuentas de canales digitales: lo que queda es
// lo que puede pedir esta. Hoy el único canal digital es chat; mail, WhatsApp,
// etc. se suman al mismo reparto. Telefonía y videollamada no entran: una
// llamada ocupa al asesor entero, así que con una llamada en curso no atiende
// ningún chat y con un chat abierto no recibe una llamada.
export const cupoOtrasCuentas = (idActual?: string) =>
  cuentas
    .filter((c) => c.tipo === "Chat" && c.id !== idActual)
    .reduce((suma, c) => suma + c.provisioningLock, 0);

// Capacidad del asesor para una cuenta de chat. Telefonía y videollamada no lo
// piden: ocupan al asesor entero.
export function CapacidadChat({
  limitar,
  cupo,
  simultaneas,
  otrosCupo,
  onChange,
}: {
  limitar: boolean;
  cupo: number;
  simultaneas: number;
  otrosCupo: number;
  onChange: (cambio: {
    limitar?: boolean;
    cupo?: number;
    simultaneas?: number;
  }) => void;
}) {
  const t = useT();
  // El texto de cada input se guarda aparte del número: así se puede borrar y
  // reescribir sin que el campo vuelva a "0"; el valor se valida después.
  const [textoSimultaneas, setTextoSimultaneas] = useState(String(simultaneas));
  const [textoCupo, setTextoCupo] = useState(String(cupo));
  const incompleto = simultaneas < 1 || cupo < 1;
  const excede = cupo + otrosCupo > 100;
  // interaction_value = cupo / simultáneas nunca puede dar 0: cada interacción
  // necesita al menos 1 de capacidad, así que no pueden ser más simultáneas
  // que el cupo.
  const sinLugar = simultaneas > cupo;
  const entero = (v: string) => Math.max(0, Math.round(Number(v)) || 0);
  const reemplazar = (txt: string, vars: Record<string, number>) =>
    Object.entries(vars).reduce(
      (s, [k, v]) => s.replace(`{${k}}`, String(v)),
      txt,
    );

  return (
    <Card data-testid="capacidad-chat">
      <CardHeader>
        <CardTitle>{t("cuentas.capacidad.titulo")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="limitar-chats"
            data-testid="limitar-chats"
            checked={limitar}
            onCheckedChange={(v) => onChange({ limitar: v === true })}
          />
          <Label htmlFor="limitar-chats">
            {t("cuentas.capacidad.limitar")}
          </Label>
        </div>

        {!limitar && (
          <p
            className="text-sm text-muted-foreground"
            data-testid="capacidad-ilimitada"
          >
            {reemplazar(t("cuentas.capacidad.ilimitada"), {
              valor: VALOR_SIN_LIMITE,
              n: 100 / VALOR_SIN_LIMITE,
            })}
          </p>
        )}

        {limitar && (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="chats-simultaneos">
                  {t("cuentas.capacidad.chats")}
                </Label>
                <Input
                  id="chats-simultaneos"
                  data-testid="chats-simultaneos"
                  type="number"
                  min={1}
                  value={textoSimultaneas}
                  aria-invalid={sinLugar || incompleto}
                  onChange={(e) => {
                    setTextoSimultaneas(e.target.value);
                    onChange({ simultaneas: entero(e.target.value) });
                  }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cupo-asesor">
                  {t("cuentas.capacidad.cupo")}
                </Label>
                <Input
                  id="cupo-asesor"
                  data-testid="cupo-asesor"
                  type="number"
                  min={1}
                  max={100}
                  value={textoCupo}
                  aria-invalid={excede || incompleto || cupo > 100}
                  onChange={(e) => {
                    setTextoCupo(e.target.value);
                    onChange({ cupo: entero(e.target.value) });
                  }}
                />
              </div>
            </div>

            {!incompleto && (
              <p
                className="text-sm text-muted-foreground"
                data-testid="capacidad-explicacion"
              >
                {reemplazar(t("cuentas.capacidad.explicacion"), {
                  n: simultaneas,
                  cupo,
                  valor: valorDeInteraccion(cupo, simultaneas),
                })}
              </p>
            )}
            {(excede || sinLugar || incompleto) && (
              <p
                className="text-sm text-destructive"
                role="alert"
                data-testid="capacidad-error"
              >
                {t(
                  incompleto
                    ? "cuentas.capacidad.vacio"
                    : excede
                      ? "cuentas.capacidad.excede"
                      : "cuentas.capacidad.sinLugar",
                )}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
