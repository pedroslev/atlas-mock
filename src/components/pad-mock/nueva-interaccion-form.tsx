"use client";

import { useState } from "react";
import { PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  CANAL_ICON,
  CANAL_LABEL,
  campaniasSalientesMock,
  type CampaniaSaliente,
  type CuentaSaliente,
} from "@/lib/pad-mock/data";

// Formulario compartido entre el modal "Nueva interacción" (el "+" de la
// cola, ver new-interaction-dialog.tsx) y la barra que se ve al ingresar sin
// interacciones activas (sin-interaccion-panel.tsx) — misma lógica, dos
// layouts: elegir campaña primero, y en función de esa campaña, la cuenta
// saliente (cada canal habilitado: llamada, WhatsApp, SMS…). Recién con
// cuenta elegida aparece el número y "Contactar" — mismo botón para llamada
// que para un canal de texto, cambia el ícono.
export function NuevaInteraccionForm({
  onContactar,
  idPrefix = "ni",
  layout = "column",
  campaniaIdInicial,
  cuentaIdInicial,
}: {
  onContactar: (campania: CampaniaSaliente, cuenta: CuentaSaliente, numero: string) => void;
  idPrefix?: string;
  /** "row": campos en línea dentro de una barra ancha — la pantalla de
   * inicio del pad. "column" (default): el form vertical de siempre, para
   * el modal del "+". */
  layout?: "column" | "row";
  /** A pedido: precargados con la campaña/cuenta del último contacto (la
   * pantalla de inicio los recibe desde pad-mock-shell.tsx); sin eso, cae a
   * la primera opción del listado. */
  campaniaIdInicial?: string;
  cuentaIdInicial?: string;
}) {
  const t = useT();
  const primeraCampania =
    campaniasSalientesMock.find((c) => c.id === campaniaIdInicial) ?? campaniasSalientesMock[0];
  const primeraCuenta =
    primeraCampania?.cuentas.find((c) => c.id === cuentaIdInicial) ?? primeraCampania?.cuentas[0];
  const [campaniaId, setCampaniaId] = useState<string | undefined>(primeraCampania?.id);
  const [cuentaId, setCuentaId] = useState<string | undefined>(primeraCuenta?.id);
  const [numero, setNumero] = useState("");
  const fila = layout === "row";

  const campania = campaniasSalientesMock.find((c) => c.id === campaniaId);
  const cuenta = campania?.cuentas.find((c) => c.id === cuentaId);
  const CanalIcon = cuenta ? CANAL_ICON[cuenta.canal] : PhoneCall;

  function contactar() {
    if (!campania || !cuenta || !numero.trim()) return;
    onContactar(campania, cuenta, numero.trim());
    setNumero("");
  }

  return (
    <form
      className={cn(fila ? "flex flex-wrap items-end gap-3" : "flex flex-col gap-3")}
      onSubmit={(e) => {
        e.preventDefault();
        contactar();
      }}
    >
      <div className={cn("flex flex-col gap-1.5", fila && "min-w-40 flex-1")}>
        <Label htmlFor={`${idPrefix}-campania`}>{t("padMock.nuevaInteraccion.campania")}</Label>
        <Select
          value={campaniaId}
          onValueChange={(v) => {
            setCampaniaId(v);
            const nueva = campaniasSalientesMock.find((c) => c.id === v);
            setCuentaId(nueva?.cuentas[0]?.id);
            setNumero("");
          }}
        >
          <SelectTrigger id={`${idPrefix}-campania`} className="w-full">
            <SelectValue placeholder={t("padMock.nuevaInteraccion.elegirCampania")} />
          </SelectTrigger>
          <SelectContent>
            {campaniasSalientesMock.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {campania && (
        <div className={cn("flex flex-col gap-1.5", fila && "min-w-40 flex-1")}>
          <Label htmlFor={`${idPrefix}-cuenta`}>{t("padMock.nuevaInteraccion.cuenta")}</Label>
          <Select
            value={cuentaId}
            onValueChange={(v) => {
              setCuentaId(v);
              setNumero("");
            }}
          >
            <SelectTrigger id={`${idPrefix}-cuenta`} className="w-full">
              <SelectValue placeholder={t("padMock.nuevaInteraccion.elegirCuenta")} />
            </SelectTrigger>
            <SelectContent>
              {campania.cuentas.map((c) => {
                const Icon = CANAL_ICON[c.canal];
                return (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="flex items-center gap-1.5">
                      <Icon className="size-3.5 text-muted-foreground" />
                      {c.nombre}
                      <span className="text-muted-foreground">· {CANAL_LABEL[c.canal]}</span>
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      {cuenta && (
        <div className={cn("flex flex-col gap-1.5", fila && "min-w-48 flex-[1.5]")}>
          <Label htmlFor={`${idPrefix}-numero`}>{t("padMock.nuevaInteraccion.numero")}</Label>
          <Input
            id={`${idPrefix}-numero`}
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            autoFocus={fila}
            placeholder={
              cuenta.canal === "sms"
                ? t("padMock.nuevaInteraccion.numeroPlaceholderSms")
                : t("padMock.nuevaInteraccion.numeroPlaceholderDefault")
            }
          />
        </div>
      )}

      {cuenta &&
        (fila ? (
          // Botón primario de la pantalla de inicio: más grande, se destaca
          // apenas hay número cargado (deshabilitado si no, mismo criterio
          // que el layout de columna).
          <Button type="submit" size="lg" disabled={!numero.trim()} className="gap-1.5">
            <CanalIcon className="size-4" />
            {t("padMock.nuevaInteraccion.contactar")}
          </Button>
        ) : (
          <div className="flex justify-end">
            <Button type="submit" disabled={!numero.trim()} className="gap-1.5">
              <CanalIcon className="size-4" />
              {t("padMock.nuevaInteraccion.contactar")}
            </Button>
          </div>
        ))}
    </form>
  );
}
