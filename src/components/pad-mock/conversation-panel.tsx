import { Phone } from "lucide-react";

// A pedido, se retiraron para esta fase: el chat como canal (redactor,
// plantillas, hilo de mensajes), la franja de Copiloto y la transcripción
// de la llamada. Lo único que queda de esta solapa es la barra de
// controles (InteractionControls, fuera de este panel, en CenterColumn) —
// este panel es un placeholder simple para no dejar el área vacía sin
// explicación mientras se define qué va acá en la próxima fase.
export function ConversationPanel() {
  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground">
      <Phone className="size-6" />
      <p className="text-sm">Llamada en curso.</p>
    </div>
  );
}
