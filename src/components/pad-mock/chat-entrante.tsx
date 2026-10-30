"use client";

import { Headset, MessageCircle, Phone, PhoneOff, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { Kbd } from "@/components/ui/kbd";
import { useIsMac } from "@/lib/pad-mock/use-is-mac";
import { etiquetaAtender, etiquetaRechazar, useAtajosEntrante } from "@/lib/pad-mock/use-atajos-entrante";
import type { InteraccionEntrante } from "@/lib/pad-mock/data";

// Chat entrante de una campaña SIN atención forzada: el agente lo acepta o
// lo rechaza (y el sistema se lo deriva a otro agente). Con atención forzada
// no hay nada de esto: el chat entra directo a las interacciones en curso.
//
// Cómo se ofrece depende de lo que esté haciendo el agente:
// - libre (sin interacciones en curso): toma el centro, igual que una
//   llamada entrante (ChatEntrantePanel);
// - ya en otra interacción: no lo saca de lo que está haciendo — queda la
//   fila "Por aceptar" en Interacciones en curso y este aviso flotante abajo
//   a la derecha (mismo lugar y forma que el de llamada interna entrante).
export function ChatEntranteAviso({
  chat,
  onAceptar,
  onRechazar,
}: {
  chat: InteraccionEntrante;
  onAceptar: () => void;
  onRechazar: () => void;
}) {
  const t = useT();
  const isMac = useIsMac();
  useAtajosEntrante(onAceptar, onRechazar);
  const primerMensaje = chat.mensajes.find((m) => m.autor === "cliente");
  return (
    <div
      role="alertdialog"
      aria-label={t("padMock.chatEntrante.titulo")}
      className="fixed right-6 bottom-6 z-50 flex w-80 flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-lg"
    >
      <div className="flex items-center gap-3">
        <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/20" />
          <MessageCircle className="size-5" />
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="text-xs text-muted-foreground">{t("padMock.chatEntrante.titulo")}</span>
          <span className="truncate text-sm font-semibold">{chat.nombre}</span>
          <span className="truncate text-xs text-muted-foreground">{chat.campania}</span>
        </div>
      </div>
      {primerMensaje && (
        <p className="line-clamp-2 rounded-lg bg-muted px-3 py-2 text-xs text-foreground">{primerMensaje.texto}</p>
      )}
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1 gap-1.5" onClick={onRechazar}>
          <X className="size-4" />
          {t("padMock.chatEntrante.rechazar")}
          <Kbd className="ml-1">{etiquetaRechazar(isMac)}</Kbd>
        </Button>
        <Button type="button" className="flex-1 gap-1.5 bg-success text-white hover:bg-success/90" onClick={onAceptar}>
          <MessageCircle className="size-4" />
          {t("padMock.chatEntrante.aceptar")}
          <Kbd className="ml-1 bg-white/20 text-white">{etiquetaAtender(isMac)}</Kbd>
        </Button>
      </div>
    </div>
  );
}

// El chat, la webcall o la videollamada entrante en el centro de la
// pantalla — mismo criterio que la llamada entrante de Hermes: quién es, por
// qué campaña, y los dos botones (con atajos: useAtajosEntrante). Chat: su
// primer mensaje, Aceptar / Rechazar. Llamada, webcall y videollamada:
// Atender / Rechazar,
// sin más: si la cuenta suma chat es configuración que al asesor no le
// cambia nada para decidir, y qué llega antes de atender (puede haber un
// IMR antes) queda por definir con el Architect.
export function ChatEntrantePanel({
  chat,
  onAceptar,
  onRechazar,
}: {
  chat: InteraccionEntrante;
  onAceptar: () => void;
  onRechazar: () => void;
}) {
  const t = useT();
  const isMac = useIsMac();
  useAtajosEntrante(onAceptar, onRechazar);
  // Llamada, webcall y videollamada se atienden como una llamada.
  const webcall = chat.canal !== "chat";
  const Icono =
    chat.canal === "videollamada" ? Video : chat.canal === "webcall" ? Headset : webcall ? Phone : MessageCircle;
  const primerMensaje = webcall ? undefined : chat.mensajes.find((m) => m.autor === "cliente");
  return (
    <div className="flex h-full min-h-0 w-0 flex-1 flex-col items-center justify-center gap-5 bg-background p-6 text-center">
      <span className="relative flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/20" />
        <Icono className="size-7" />
      </span>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">
          {chat.canal === "videollamada"
            ? t("padMock.videollamadaEntrante.titulo")
            : chat.canal === "llamada"
              ? t("padMock.llamadaEntrante.titulo")
              : webcall
              ? t("padMock.webcallEntrante.titulo")
              : t("padMock.chatEntrante.titulo")}
        </span>
        <span className="font-heading text-2xl font-semibold">{chat.nombre}</span>
        <span className="text-sm text-muted-foreground">{chat.campania}</span>
      </div>
      {primerMensaje && (
        <p className="max-w-md rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-left text-sm leading-relaxed text-foreground">
          {primerMensaje.texto}
        </p>
      )}
      <div className="flex gap-3">
        <Button type="button" size="lg" variant="outline" className="min-w-36 gap-1.5" onClick={onRechazar}>
          {webcall ? <PhoneOff className="size-4" /> : <X className="size-4" />}
          {t("padMock.chatEntrante.rechazar")}
          <Kbd className="ml-1">{etiquetaRechazar(isMac)}</Kbd>
        </Button>
        <Button
          type="button"
          size="lg"
          className="min-w-36 gap-1.5 bg-success text-white hover:bg-success/90"
          onClick={onAceptar}
        >
          {webcall ? <Phone className="size-4" /> : <MessageCircle className="size-4" />}
          {webcall ? t("padMock.webcallEntrante.atender") : t("padMock.chatEntrante.aceptar")}
          <Kbd className="ml-1 bg-white/20 text-white">{etiquetaAtender(isMac)}</Kbd>
        </Button>
      </div>
    </div>
  );
}
