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
import {
  CANAL_ICON,
  CANAL_LABEL,
  campaniasSalientesMock,
  type CampaniaSaliente,
  type CuentaSaliente,
} from "@/lib/pad-mock/data";

// Formulario compartido entre el modal "Nueva interacción" (el "+" de la
// cola, ver new-interaction-dialog.tsx) y el panel que se ve al ingresar sin
// interacciones activas (sin-interaccion-panel.tsx) — misma lógica, dos
// lugares donde vive: elegir campaña primero, y en función de esa campaña,
// la cuenta saliente (cada canal habilitado: llamada, WhatsApp, SMS…).
// Recién con cuenta elegida aparece el número y "Contactar" — mismo botón
// para llamada que para un canal de texto, cambia el ícono.
export function NuevaInteraccionForm({
  onContactar,
  idPrefix = "ni",
}: {
  onContactar: (campania: CampaniaSaliente, cuenta: CuentaSaliente, numero: string) => void;
  idPrefix?: string;
}) {
  // A pedido: campaña y cuenta vienen preseleccionadas con la primera del
  // listado — no arrancan vacías.
  const primeraCampania = campaniasSalientesMock[0];
  const [campaniaId, setCampaniaId] = useState<string | undefined>(primeraCampania?.id);
  const [cuentaId, setCuentaId] = useState<string | undefined>(primeraCampania?.cuentas[0]?.id);
  const [numero, setNumero] = useState("");

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
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        contactar();
      }}
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-campania`}>Campaña</Label>
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
            <SelectValue placeholder="Elegir campaña…" />
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
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-cuenta`}>Cuenta</Label>
          <Select
            value={cuentaId}
            onValueChange={(v) => {
              setCuentaId(v);
              setNumero("");
            }}
          >
            <SelectTrigger id={`${idPrefix}-cuenta`} className="w-full">
              <SelectValue placeholder="Elegir cuenta…" />
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
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-numero`}>Número</Label>
          <Input
            id={`${idPrefix}-numero`}
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            placeholder={cuenta.canal === "sms" ? "Número o contacto…" : "+54 11 xxxx-xxxx"}
          />
        </div>
      )}

      {cuenta && (
        <div className="flex justify-end">
          <Button type="submit" disabled={!numero.trim()} className="gap-1.5">
            <CanalIcon className="size-4" />
            Contactar
          </Button>
        </div>
      )}
    </form>
  );
}
