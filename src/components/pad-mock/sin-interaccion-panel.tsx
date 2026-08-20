"use client";

import { PhoneIncoming } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { NuevaInteraccionForm } from "@/components/pad-mock/nueva-interaccion-form";
import { OpenQuestion } from "@/components/pad-mock/open-question";
import type { CampaniaSaliente, CuentaSaliente } from "@/lib/pad-mock/data";

// Lo que ve el agente al ingresar al pad sin ninguna interacción activa (a
// pedido: "al ingresar no muestre las interacciones y solo se muestren al
// apretar el + y seleccionarlas"). El selector de estado NO se repite acá
// — queda fijo en el menú (Mi estado) — pero el formulario de "Nueva
// interacción" sí, para tenerlo más a mano y no depender de abrir el modal.
export function SinInteraccionPanel({
  onContactar,
}: {
  onContactar: (campania: CampaniaSaliente, cuenta: CuentaSaliente, numero: string) => void;
}) {
  return (
    <div className="flex h-full min-h-0 w-full flex-1 items-center justify-center overflow-y-auto bg-muted/30 p-6">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-info/10 text-info">
              <PhoneIncoming className="size-5" />
            </span>
            <h1 className="font-heading text-base font-semibold">Sin interacciones activas</h1>
            <p className="text-sm text-muted-foreground">
              Pasate a <span className="font-medium text-foreground">Disponible</span> en el menú
              para que el sistema te empiece a derivar interacciones entrantes, o iniciá una
              llamada saliente acá abajo.
            </p>
          </div>

          <NuevaInteraccionForm idPrefix="si" onContactar={onContactar} />

          <OpenQuestion>
            este formulario arma una llamada saliente real; la derivación automática de
            interacciones entrantes al pasar a Disponible todavía no está simulada acá.
          </OpenQuestion>
        </CardContent>
      </Card>
    </div>
  );
}
