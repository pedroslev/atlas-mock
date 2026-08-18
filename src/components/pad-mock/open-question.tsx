import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Marca visible de "esto lo toca el mock pero no lo resuelve" (brief §8: si el
// mock toca una pregunta técnica pendiente, se deja visible como pregunta, no
// se resuelve). A propósito NO es un tooltip: en una reunión, mostrando la
// pantalla, un texto que solo aparece al hover se pierde.
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
        "flex items-start gap-1.5 rounded-md border border-dashed border-muted-foreground/40 bg-muted/40 px-2 py-1 text-xs text-muted-foreground italic",
        className
      )}
    >
      <HelpCircle className="mt-0.5 size-3.5 shrink-0" />
      <span>
        <span className="font-medium not-italic">Abierto: </span>
        {children}
      </span>
    </p>
  );
}
