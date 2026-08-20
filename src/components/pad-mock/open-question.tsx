import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Marca visible de "esto lo toca el mock pero no lo resuelve" (brief §8: si el
// mock toca una pregunta técnica pendiente, se deja visible como pregunta, no
// se resuelve). A propósito NO es un tooltip: en una reunión, mostrando la
// pantalla, un texto que solo aparece al hover se pierde. Tono "info" (mismo
// token semántico que el resto de la app) en vez de gris genérico, para que
// lea como una nota intencional y no como un placeholder sin terminar.
export function OpenQuestion({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-start gap-1.5 rounded-lg border border-info/30 bg-info/10 px-2 py-1.5 text-xs text-[color-mix(in_oklab,var(--info),black_28%)] dark:text-info",
        className
      )}
    >
      <HelpCircle className="mt-0.5 size-3.5 shrink-0" />
      <span>
        <span className="font-medium">Abierto: </span>
        {children}
      </span>
    </p>
  );
}
