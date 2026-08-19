import { PadMockShell } from "@/components/pad-mock/pad-mock-shell";

// Wireframe conceptual del pad omnicanal — ver
// relevamiento/pad-competencia/brief-mock-pad.md. Los tres escenarios del
// brief (§6) ya no son un selector aparte: son la cola en el menú izquierdo
// (una llamada, un chat) y el modo "monitor chico" es el comportamiento
// responsive real del shell (el menú y el contexto colapsan solos, igual que
// en /pad) — nada que togglear a mano.
export default function PadMockPage() {
  return <PadMockShell />;
}
