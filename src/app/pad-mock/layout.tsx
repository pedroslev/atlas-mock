import { PadHeader } from "@/components/pad/pad-header";

// Reusa el navbar REAL de Hermes (mismo componente que /pad) — a pedido:
// "de Hermes mantené el navbar y el menú izquierdo". No envuelve en
// PadStateProvider a propósito: PadHeader no lo necesita (no usa usePad()) y
// este mock tiene su propio estado, separado del pad real de llamada.
export default function PadMockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <PadHeader />
      <main className="flex min-h-0 flex-1 overflow-hidden bg-muted/30">
        {children}
      </main>
    </div>
  );
}
