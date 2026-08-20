import { PadHeader } from "@/components/pad/pad-header";

// Shell propio del pad (Hermes). No toca el layout del backoffice: tiene su
// propio header (con el selector de estado del agente) y su propio provider de
// estado. Mismo App Bar Azul Institucional y app switcher — "un solo producto".
//
// Sin PadStateProvider a propósito: era del prototipo anterior (llamada
// únicamente); el pad omnicanal actual (PadMockShell) maneja su propio
// estado, separado.
export default function PadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // El documento no scrollea (html/body ya están overflow-hidden en globals):
  // el shell ocupa el alto del viewport y cada panel maneja su propio scroll
  // interno. Sin overscroll/bounce a nivel página — se siente como web app.
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <PadHeader />
      <main className="flex min-h-0 flex-1 overflow-hidden bg-muted/30">
        {children}
      </main>
    </div>
  );
}
