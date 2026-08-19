"use client";

import { useState } from "react";
import { PhoneCall } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { CANAL_ICON, CANAL_LABEL, campaniasSalientesMock } from "@/lib/pad-mock/data";

// "+" de la cola — a pedido: elegir campaña primero, y en función de esa
// campaña, la cuenta saliente (cada canal que tenga habilitado: llamada,
// WhatsApp, SMS…). Recién con cuenta elegida aparece el número y "Contactar"
// — mismo botón para llamada que para un canal de texto, cambia el ícono.
//
// Lo que todavía NO hace (a propósito, falta definir): "Contactar" no crea
// today una fila real en la cola — eso implica decidir cómo se generan
// interacciones salientes nuevas en todo el mock, no solo acá.
export function NewInteractionDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [campaniaId, setCampaniaId] = useState<string | undefined>(undefined);
  const [cuentaId, setCuentaId] = useState<string | undefined>(undefined);
  const [numero, setNumero] = useState("");

  const campania = campaniasSalientesMock.find((c) => c.id === campaniaId);
  const cuenta = campania?.cuentas.find((c) => c.id === cuentaId);
  const CanalIcon = cuenta ? CANAL_ICON[cuenta.canal] : PhoneCall;

  function resetear() {
    setCampaniaId(undefined);
    setCuentaId(undefined);
    setNumero("");
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetear();
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PhoneCall className="size-4 text-muted-foreground" />
            Nueva interacción
          </DialogTitle>
          <DialogDescription>
            Elegí la campaña y la cuenta por la que vas a contactar.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ni-campania">Campaña</Label>
            <Select
              value={campaniaId}
              onValueChange={(v) => {
                setCampaniaId(v);
                setCuentaId(undefined);
                setNumero("");
              }}
            >
              <SelectTrigger id="ni-campania" className="w-full">
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
              <Label htmlFor="ni-cuenta">Cuenta</Label>
              <Select
                value={cuentaId}
                onValueChange={(v) => {
                  setCuentaId(v);
                  setNumero("");
                }}
              >
                <SelectTrigger id="ni-cuenta" className="w-full">
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
              <Label htmlFor="ni-numero">Número</Label>
              <Input
                id="ni-numero"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder={
                  cuenta.canal === "sms" ? "Número o contacto…" : "+54 11 xxxx-xxxx"
                }
              />
            </div>
          )}
        </div>

        {cuenta && (
          <div className="flex justify-end">
            <Button
              disabled={!numero.trim()}
              onClick={() => handleOpenChange(false)}
              className="gap-1.5"
            >
              <CanalIcon className="size-4" />
              Contactar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
