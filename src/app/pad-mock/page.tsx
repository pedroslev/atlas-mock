"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { PadMockShell, type Escenario } from "@/components/pad-mock/pad-mock-shell";

const ESCENARIOS: { id: Escenario; label: string; detalle: string }[] = [
  { id: "A", label: "A · Llamada activa", detalle: "Transcripción + próximo paso, contexto abierto" },
  { id: "B", label: "B · Chat", detalle: "Redactor + copiloto con artículo" },
  { id: "C", label: "C · Monitor chico", detalle: "Cola y contexto colapsados, 1366px" },
];

function isEscenario(v: string | null): v is Escenario {
  return v === "A" || v === "B" || v === "C";
}

// Ruta fuera de cualquier layout de app (sin sidebar, sin header con marca —
// brief §7: "sin marca, sin logo, sin nombres de productos reales"). Wireframe
// conceptual para la sesión del lunes — ver
// relevamiento/pad-competencia/brief-mock-pad.md. La barra de arriba con los
// tres botones NO es parte del pad: es el selector de escenario para la demo.
//
// El escenario vive en el query param `escenario` (no solo en state) para
// poder pasar un link directo a cada uno — útil para la sesión del lunes.
function PadMockPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get("escenario");
  const [escenario, setEscenario] = useState<Escenario>(isEscenario(fromUrl) ? fromUrl : "A");

  function seleccionar(id: Escenario) {
    setEscenario(id);
    router.replace(`/pad-mock?escenario=${id}`, { scroll: false });
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-background">
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border bg-muted/40 px-4 py-2.5">
        <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Wireframe conceptual — pad omnicanal
        </span>
        <div className="flex flex-1 flex-wrap gap-1.5">
          {ESCENARIOS.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => seleccionar(e.id)}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-left text-xs transition-colors",
                escenario === e.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              <span className="block font-medium">{e.label}</span>
              <span className="block text-[0.65rem] opacity-80">{e.detalle}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden bg-muted/20">
        {escenario === "C" ? (
          <div className="mx-auto flex h-full max-w-[1366px] flex-col border-x border-dashed border-primary/50">
            <div className="shrink-0 border-b border-dashed border-primary/50 bg-primary/5 py-1 text-center font-mono text-[0.65rem] text-primary">
              1366px de ancho
            </div>
            <div className="min-h-0 flex-1">
              <PadMockShell key={escenario} escenario={escenario} />
            </div>
          </div>
        ) : (
          <PadMockShell key={escenario} escenario={escenario} />
        )}
      </div>
    </div>
  );
}

export default function PadMockPage() {
  return (
    <Suspense>
      <PadMockPageInner />
    </Suspense>
  );
}
