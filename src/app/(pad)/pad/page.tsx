import type { Metadata } from "next";
import { PadMockShell } from "@/components/pad-mock/pad-mock-shell";

export const metadata: Metadata = {
  title: "Hermes - Mitrol",
  description: "Pad del agente de Atlas — atención de interacciones omnicanal.",
};

// Wireframe conceptual del pad omnicanal — ver
// relevamiento/pad-competencia/brief-mock-pad.md. Reemplaza al prototipo
// anterior (PadConsole, de llamada únicamente): esta es ahora la versión
// vigente de /pad.
export default function PadPage() {
  return <PadMockShell />;
}
