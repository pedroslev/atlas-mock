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
import { useT } from "@/lib/i18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NuevaInteraccionForm } from "@/components/pad-mock/nueva-interaccion-form";
import { LlamadaInternaDirectorio } from "@/components/pad-mock/llamada-interna-directorio";
import type { AgenteDirectorio, CampaniaSaliente, CuentaSaliente } from "@/lib/pad-mock/data";

// "+" de la cola — el formulario en sí (campaña → cuenta → número) vive en
// NuevaInteraccionForm, compartido con el panel que se ve al ingresar sin
// interacciones activas (sin-interaccion-panel.tsx). Acá solo se pone el
// envoltorio de modal. Selector Externo | Interno: "Interno" abre el
// directorio de llamadas internas (propuesta opción A), sin campaña ni cuenta.
export function NewInteractionDialog({
  open,
  onOpenChange,
  onContactar,
  onLlamarInterno,
  campaniaIdInicial,
  cuentaIdInicial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContactar: (campania: CampaniaSaliente, cuenta: CuentaSaliente, numero: string) => void;
  onLlamarInterno: (agente: AgenteDirectorio) => void;
  campaniaIdInicial?: string;
  cuentaIdInicial?: string;
}) {
  const t = useT();
  const [tipo, setTipo] = useState("externo");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PhoneCall className="size-4 text-muted-foreground" />
            {t("padMock.newInteractionDialog.titulo")}
          </DialogTitle>
          <DialogDescription>
            {tipo === "interno"
              ? t("padMock.newInteractionDialog.descripcionInterno")
              : t("padMock.newInteractionDialog.descripcion")}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tipo} onValueChange={setTipo}>
          <TabsList className="w-full">
            <TabsTrigger value="externo">{t("padMock.newInteractionDialog.externo")}</TabsTrigger>
            <TabsTrigger value="interno">{t("padMock.newInteractionDialog.interno")}</TabsTrigger>
          </TabsList>

          <TabsContent value="externo" className="pt-2">
            <NuevaInteraccionForm
              idPrefix="ni"
              campaniaIdInicial={campaniaIdInicial}
              cuentaIdInicial={cuentaIdInicial}
              onContactar={(campania, cuenta, numero) => {
                onContactar(campania, cuenta, numero);
                onOpenChange(false);
              }}
            />
          </TabsContent>

          <TabsContent value="interno" className="pt-2">
            <LlamadaInternaDirectorio
              onLlamar={(agente) => {
                onLlamarInterno(agente);
                onOpenChange(false);
              }}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
