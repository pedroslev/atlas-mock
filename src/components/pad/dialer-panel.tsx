"use client";

import { useState } from "react";
import { Phone, Delete, PhoneIncoming } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { campanias } from "@/lib/mock-data";
import { AGENTE_PAD_ID } from "@/lib/mock-pad";
import { usePad } from "@/components/pad/pad-state";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const asignadas = campanias.filter((c) =>
  c.usuariosAsignados.includes(AGENTE_PAD_ID)
);

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

export function DialerPanel() {
  const { interaction, startOutbound, simulateIncoming } = usePad();
  const t = useT();
  const [numero, setNumero] = useState("");
  const [campaniaId, setCampaniaId] = useState(asignadas[0]?.id ?? "");

  // El dialer solo opera cuando no hay una interacción en curso.
  const busy = interaction !== null;

  function press(key: string) {
    setNumero((n) => n + key);
  }

  function llamar() {
    if (busy || !numero.trim()) return;
    startOutbound(numero, campaniaId);
    setNumero("");
  }

  return (
    <Card size="sm" className="min-h-0">
      <CardHeader>
        <CardTitle as="h2" className="flex items-center gap-2">
          <Phone className="size-4 text-muted-foreground" />
          {t("pad.discador.titulo")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-1.5">
          <Input
            inputMode="tel"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            placeholder={t("pad.discador.numeroPlaceholder")}
            disabled={busy}
            className="font-mono tabular-nums"
            aria-label={t("pad.discador.numeroPlaceholder")}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNumero((n) => n.slice(0, -1))}
            disabled={busy || numero.length === 0}
            aria-label={t("pad.discador.borrarDigito")}
          >
            <Delete />
          </Button>
        </div>

        {/* Teclado numérico: el operador de escritorio disca con SU teclado, así
            que el dialpad clickeable no aporta y ensucia. Se muestra solo en
            mobile (sin teclado físico); en ≥sm se oculta. */}
        <div className="grid grid-cols-3 gap-1.5 sm:hidden">
          {KEYS.map((key) => (
            <Button
              key={key}
              variant="outline"
              onClick={() => press(key)}
              disabled={busy}
              className="h-10 font-mono text-base"
              aria-label={t("pad.discador.digito", { n: key })}
            >
              {key}
            </Button>
          ))}
        </div>

        <Select value={campaniaId} onValueChange={setCampaniaId} disabled={busy}>
          <SelectTrigger
            className="w-full"
            aria-label={t("pad.discador.campaniaAria")}
          >
            <SelectValue placeholder={t("pad.campo.campania")} />
          </SelectTrigger>
          <SelectContent>
            {asignadas.map((camp) => (
              <SelectItem key={camp.id} value={camp.id}>
                {camp.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={llamar}
          disabled={busy || !numero.trim()}
          className={cn("w-full")}
        >
          <Phone />
          {t("pad.discador.llamar")}
        </Button>

        <div className="border-t pt-3">
          <Button
            variant="secondary"
            onClick={simulateIncoming}
            disabled={busy}
            className="w-full"
          >
            <PhoneIncoming />
            {t("pad.discador.simularEntrante")}
          </Button>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {t("pad.discador.simularAyuda")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
