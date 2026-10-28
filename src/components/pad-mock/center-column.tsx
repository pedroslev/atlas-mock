"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Headset, Link2, MessageSquareText, MonitorUp, Phone, Video } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Kbd } from "@/components/ui/kbd";
import { ConversationPanel, formatoTamano, type AdjuntoExterno } from "@/components/pad-mock/conversation-panel";
import { ExternalPagePanel } from "@/components/pad-mock/external-page-panel";
import { InteractionControls } from "@/components/pad-mock/call-controls";
import { PantallaClientePanel, VideoPanel, capturarCliente, type FuenteVideo } from "@/components/pad-mock/video-panel";
import { paginasExternas, type InteraccionEntrante, type PaginaExterna, type Tipificacion } from "@/lib/pad-mock/data";
import { ALTO_CABECERA_COLUMNA } from "@/lib/pad-mock/layout";
import { useT } from "@/lib/i18n";
import { useIsMac } from "@/lib/pad-mock/use-is-mac";
import { useNow, formatDuration } from "@/lib/pad-mock/use-now";
import { cn } from "@/lib/utils";

// A pedido: por ahora el ícono de las páginas externas no es configurable
// por ítem — todas comparten este mismo genérico (mismo criterio que
// left-nav.tsx para accesos rápidos).
const ICONO_PAGINA_EXTERNA = Link2;
const SIN_PAGINAS: PaginaExterna[] = [];

// Brief §4 — el centro nunca se colapsa. Solapa fija (no se cierra) — dice
// "Llamada" con ícono de teléfono, "Conversación" en un chat o "Webcall" con
// ícono de auricular. Las
// demás son páginas externas configurables, embebidas o "pestaña aparte"
// (§4.2). w-full en TabsList para que la línea de abajo llegue hasta el
// borde con la columna de contexto, no solo hasta donde terminan las
// solapas. min-w-0 en el contenedor y en Tabs: sin esto, la columna no se
// achica cuando el contexto crece y el layout se rompe.
//
// El cronómetro de la interacción vive ACÁ (antes en InteractionControls) y
// se muestra al lado del título de la solapa fija — a pedido, sacado de la
// barra de controles de abajo.
//
// InteractionControls vive FUERA del Tabs (a pedido: la barra de controles
// de la interacción queda visible siempre, no solo en la solapa Llamada).
//
// Ctrl/Cmd+Alt+N salta a la solapa N (1 = Llamada, 2… = cada integración) —
// mismo "número = posición" que Alt+N en la cola, con un modificador extra
// para no chocar con ese atajo ni con nada del navegador.
//
// Videollamada: la solapa fija es "Video" y, si la cuenta suma chat, hay una
// segunda solapa fija "Chat" (Ctrl/Cmd+Alt+2; las páginas externas corren un
// lugar). Webcall: mientras el cliente comparte su pantalla, con chat la
// segunda solapa fija es "Pantalla del cliente"; sin chat, la pantalla va
// en la primera. El chat queda montado al cambiar de solapa, para no perder lo que
// se estaba escribiendo. La captura de imagen vive acá porque la usan la
// barra de controles, la solapa del video y la del chat. Quién comparte su
// pantalla (el asesor o el cliente, también en el chat), el
// Picture-in-Picture y la ventanita del video viven en pad-mock-shell.tsx,
// porque siguen al cambiar de interacción, en Inicio o en un acceso rápido:
// por eso esta columna avisa si la solapa Video está a la vista
// (onSolapaVideoVisible) y vuelve a ella cuando se lo piden (pedidoSolapaVideo).
//
// Llamada interna (interno): sin páginas externas (CRM, tickets, etc.) — no
// hay cliente sobre el que trabajar.
export function CenterColumn({
  tipificaciones,
  enEspera,
  holdStartedAt,
  onToggleEspera,
  onCerrarInteraccion,
  entrante,
  interno = false,
  sonando = false,
  nombreInterno,
  onSimularForzada,
  onSimularRechazo,
  pip,
  onSolapaVideoVisible,
  pedidoSolapaVideo = 0,
  pedidoSolapaVideoVisto = 0,
  onPedidoSolapaVideoVisto,
  compartiendo = false,
  onAlternarCompartiendo,
  clienteComparte = false,
  onAlternarClienteComparte,
  fijado = "cliente",
  onFijar,
}: {
  tipificaciones: Tipificacion[];
  enEspera: boolean;
  holdStartedAt: number | null;
  onToggleEspera: () => void;
  onCerrarInteraccion: () => void;
  /** Chat o webcall en curso; sin esto, es una llamada. */
  entrante?: InteraccionEntrante;
  interno?: boolean;
  sonando?: boolean;
  /** Nombre del otro agente en una llamada interna. */
  nombreInterno?: string;
  onSimularForzada?: () => void;
  onSimularRechazo?: () => void;
  /** Videollamada: Picture-in-Picture del navegador. */
  pip?: { activo: boolean; alternar: () => void };
  onSolapaVideoVisible?: (visible: boolean) => void;
  /** El asesor comparte su pantalla (chat, webcall y videollamada). */
  compartiendo?: boolean;
  onAlternarCompartiendo?: () => void;
  /** El cliente comparte su pantalla (chat, webcall y videollamada). */
  clienteComparte?: boolean;
  onAlternarClienteComparte?: () => void;
  /** Videollamada: lo que se ve en el recuadro grande. */
  fijado?: FuenteVideo;
  onFijar?: (f: FuenteVideo) => void;
  /** Cada vez que cambia, vuelve a la solapa Video (o a Pantalla del
   *  cliente, en la webcall). */
  pedidoSolapaVideo?: number;
  /** Último pedido de volver a la solapa que ya se atendió. */
  pedidoSolapaVideoVisto?: number;
  onPedidoSolapaVideoVisto?: (n: number) => void;
}) {
  const t = useT();
  const isMac = useIsMac();
  const chat = entrante?.canal === "chat";
  const webcall = entrante?.canal === "webcall";
  const video = entrante?.canal === "videollamada";
  // La solapa muestra el chat en un chat y en una webcall cuya cuenta suma
  // chat durante la llamada; si no, el cuerpo de una llamada. En la
  // videollamada el chat va en su propia solapa.
  const conChat = chat || (webcall && entrante?.chatEnLlamada === true);
  const solapaChat = video && entrante?.chatEnLlamada === true;
  // El cliente comparte su pantalla (en el mock, con el simulador de abajo;
  // el estado vive en pad-mock-shell.tsx). En el chat y la webcall con chat aparece
  // la solapa "Pantalla del cliente" mientras dure; sin chat, la pantalla
  // ocupa la primera solapa en lugar del cuerpo de la llamada.
  const solapaPantalla = (webcall || chat) && clienteComparte && conChat;
  const pantallaEnPrimera = webcall && clienteComparte && !conChat;
  const fijas = solapaChat || solapaPantalla ? 2 : 1;
  // Captura de imagen (solo videollamada con chat): destella el video, queda
  // adjunta en el redactor del chat como "Captura-HH:MM" y lleva a la solapa
  // Chat; el asesor decide si la envía o la quita.
  const [captura, setCaptura] = useState<AdjuntoExterno | undefined>();
  const [flash, setFlash] = useState(false);
  const flashTimer = useRef<number | undefined>(undefined);
  function capturar() {
    if (!entrante) return;
    const hora = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
    const { url, bytes } = capturarCliente(entrante.nombre);
    setCaptura((cur) => ({
      id: (cur?.id ?? 0) + 1,
      adjunto: { nombre: `Captura-${hora}`, tamano: formatoTamano(bytes), esImagen: true, url },
    }));
    setFlash(true);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => {
      setFlash(false);
      setTab("chat");
    }, 250);
  }
  const [tab, setTab] = useState("conversacion");
  // Si el cliente deja de compartir con su solapa a la vista, vuelve a la
  // primera.
  if (tab === "pantalla" && !solapaPantalla) setTab("conversacion");
  // Arranca desde el último pedido ya atendido (no desde el actual): si la
  // columna se vuelve a armar por un pedido (por ejemplo, "Volver a la
  // pantalla" desde Inicio), lo atiende igual.
  const [pedidoAtendido, setPedidoAtendido] = useState(pedidoSolapaVideoVisto);
  if (pedidoSolapaVideo !== pedidoAtendido) {
    setPedidoAtendido(pedidoSolapaVideo);
    setTab(solapaPantalla ? "pantalla" : "conversacion");
  }
  useEffect(() => {
    onPedidoSolapaVideoVisto?.(pedidoAtendido);
  }, [pedidoAtendido, onPedidoSolapaVideoVisto]);
  // La solapa que siguen la ventanita y el Picture-in-Picture: Video en la
  // videollamada; en la webcall, la que muestra la pantalla del cliente.
  const solapaVideoVisible =
    ((video || pantallaEnPrimera) && tab === "conversacion") || (solapaPantalla && tab === "pantalla");
  useEffect(() => {
    onSolapaVideoVisible?.(solapaVideoVisible);
  }, [solapaVideoVisible, onSolapaVideoVisible]);
  useEffect(() => () => onSolapaVideoVisible?.(false), [onSolapaVideoVisible]);
  const [startedAt] = useState(() => Date.now());
  const paginas = interno ? SIN_PAGINAS : paginasExternas;
  const now = useNow(true);
  const elapsedTotal = Math.max(0, Math.floor((now - startedAt) / 1000));
  const elapsedHold = holdStartedAt ? Math.max(0, Math.floor((now - holdStartedAt) / 1000)) : 0;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod || !e.altKey || e.shiftKey || e.repeat) return;
      const el = e.target as HTMLElement | null;
      if (
        el &&
        (el.isContentEditable ||
          el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT")
      ) {
        return;
      }
      const idx = Number(e.key) - 1;
      if (Number.isNaN(idx) || idx < 0 || idx >= paginas.length + fijas) return;
      e.preventDefault();
      // Posición 1 = Llamada/Conversación (siempre una solapa). Del resto,
      // las "pestana" (solo externas) no se seleccionan — abren su link
      // aparte, igual que al clickearlas.
      if (idx === 0) {
        setTab("conversacion");
        return;
      }
      if (idx === 1 && fijas === 2) {
        setTab(solapaPantalla ? "pantalla" : "chat");
        return;
      }
      const p = paginas[idx - fijas];
      if (!p) return;
      if (p.modo === "pestana") {
        window.open(p.url, "_blank", "noopener,noreferrer");
      } else {
        setTab(p.id);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paginas, fijas, solapaPantalla]);

  const shortcutMod = isMac ? "⌘⌥" : "Ctrl Alt";

  return (
    <div className="flex h-full min-h-0 w-0 flex-1 flex-col bg-background">
      <Tabs value={tab} onValueChange={setTab} className="min-h-0 w-full flex-1 gap-0">
        {/* ALTO_CABECERA_COLUMNA: mismo alto que la cabecera "Contexto" de
            ContextColumn (fuente única compartida — ver layout.ts), para
            que las dos columnas arranquen alineadas. La solapa fija
            (Llamada/Conversación) queda sticky a la izquierda con su propio
            fondo — a pedido, no se va con el resto cuando el overflow-x-auto
            hace scroll por la cantidad de páginas externas.
            pr-3 y pl-0 acá (NO px-3): un padding-left en el propio TabsList
            deja un hueco entre el borde y la solapa sticky que "left-0" no
            cubre (sticky se pega al borde interno del padding, no al del
            contenedor) — por ese hueco se veía pasar el texto de las demás
            solapas al scrollear. pl-0 explícito porque la base de TabsList
            ya trae "p-[3px]" (padding en los 4 lados) — sin pisarlo
            puntualmente quedaban esos 3px como el mismo hueco, más chico
            pero con el mismo problema. El padding izquierdo se movió
            DENTRO de la solapa sticky (pl-7 más abajo), que sí tiene fondo
            opaco. */}
        <TabsList
          variant="line"
          className={cn(
            ALTO_CABECERA_COLUMNA,
            "no-scrollbar w-full shrink-0 justify-start gap-1 overflow-x-auto overflow-y-hidden border-b border-border pr-3 pl-0"
          )}
        >
          {/* flex-none: la base de TabsTrigger trae flex-1 (pensada para
              tabs tipo segmented control que reparten el ancho disponible) —
              acá cada solapa mide lo que mide su contenido, si no se
              estiraba y el contenido quedaba centrado a mitad del sobrante.
              bg-background! (con !important): sin forzarlo, pierde contra
              las variantes data-active/dark de TabsTrigger y se veían las
              solapas de atrás pasando por detrás del texto al hacer scroll.
              A pedido, esta barra (y las páginas externas de abajo) se
              agrandaron: texto/íconos más grandes y más padding, además del
              alto ya crecido en ALTO_CABECERA_COLUMNA. pl-7 (no px-4 parejo):
              absorbe también el padding izquierdo que le sacamos al
              TabsList de arriba. */}
          <TabsTrigger
            value="conversacion"
            className="sticky left-0 z-10 flex-none gap-2 bg-background! py-3 pr-4 pl-7 text-sm"
          >
            {chat ? (
              <MessageSquareText className="size-5" />
            ) : video ? (
              <Video className="size-5" />
            ) : webcall ? (
              <Headset className="size-5" />
            ) : (
              <Phone className="size-5" />
            )}
            {chat
              ? t("padMock.centerColumn.conversacion")
              : video
                ? t("padMock.centerColumn.video")
                : webcall
                ? t("padMock.centerColumn.webcall")
                : interno
                  ? t("padMock.llamadaInterna.titulo")
                  : t("padMock.centerColumn.llamada")}
            <span
              className={cn(
                "font-mono text-sm font-bold tabular-nums",
                enEspera ? "text-warning" : "text-foreground"
              )}
            >
              {sonando ? "—" : formatDuration(enEspera ? elapsedHold : elapsedTotal)}
            </span>
            <Kbd className="ml-1">{shortcutMod} 1</Kbd>
          </TabsTrigger>
          {solapaChat && (
            <TabsTrigger value="chat" className="flex-none gap-2 px-4 py-3 text-sm">
              <MessageSquareText className="size-5" />
              {t("padMock.centerColumn.chat")}
              <Kbd className="ml-1">{shortcutMod} 2</Kbd>
            </TabsTrigger>
          )}
          {solapaPantalla && (
            <TabsTrigger value="pantalla" className="flex-none gap-2 px-4 py-3 text-sm">
              <MonitorUp className="size-5" />
              {t("padMock.centerColumn.pantallaCliente")}
              <Kbd className="ml-1">{shortcutMod} 2</Kbd>
            </TabsTrigger>
          )}
          {paginas.map((p, i) =>
            p.modo === "pestana" ? (
              // Solo externa ("blank"): no es una solapa seleccionable — un
              // click abre pagina.url directo en pestaña nueva y no queda
              // marcada como activa (a pedido: "no deje seleccionado el
              // botón como si se posicionara allí").
              <button
                key={p.id}
                type="button"
                onClick={() => window.open(p.url, "_blank", "noopener,noreferrer")}
                className="relative inline-flex h-[calc(100%-1px)] flex-none items-center justify-center gap-2 rounded-md border border-transparent px-4 py-3 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all hover:bg-muted/60 hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
              >
                <ICONO_PAGINA_EXTERNA className="size-5" />
                {p.nombre}
                <ExternalLink className="size-3.5 text-muted-foreground" />
                <Kbd className="ml-1">
                  {shortcutMod} {i + 1 + fijas}
                </Kbd>
              </button>
            ) : (
              <TabsTrigger key={p.id} value={p.id} className="flex-none gap-2 px-4 py-3 text-sm">
                <ICONO_PAGINA_EXTERNA className="size-5" />
                {p.nombre}
                <Kbd className="ml-1">
                  {shortcutMod} {i + 1 + fijas}
                </Kbd>
              </TabsTrigger>
            )
          )}
        </TabsList>

        <TabsContent value="conversacion" className="min-h-0 flex-1 overflow-hidden">
          {video && entrante ? (
            <VideoPanel
              nombre={entrante.nombre}
              compartiendo={compartiendo}
              onDejarDeCompartir={() => onAlternarCompartiendo?.()}
              clienteComparte={clienteComparte}
              fijado={fijado}
              onFijar={onFijar ?? (() => {})}
              pip={pip?.activo ?? false}
              onCerrarPip={() => pip?.alternar()}
              flash={flash}
            />
          ) : pantallaEnPrimera && entrante ? (
            <PantallaClientePanel
              nombre={entrante.nombre}
              pip={pip?.activo ?? false}
              onCerrarPip={() => pip?.alternar()}
            />
          ) : (
            <ConversationPanel
              tiempo={formatDuration(enEspera ? elapsedHold : elapsedTotal)}
              enEspera={enEspera}
              mensajesChat={conChat ? entrante?.mensajes : undefined}
              interno={interno}
              sonando={sonando}
              nombreInterno={nombreInterno}
              onSimularForzada={onSimularForzada}
              onSimularRechazo={onSimularRechazo}
            />
          )}
        </TabsContent>
        {solapaChat && (
          <TabsContent
            value="chat"
            forceMount
            className="min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
          >
            <ConversationPanel
              tiempo={formatDuration(enEspera ? elapsedHold : elapsedTotal)}
              enEspera={enEspera}
              mensajesChat={entrante?.mensajes}
              adjuntoNuevo={captura}
            />
          </TabsContent>
        )}
        {solapaPantalla && entrante && (
          <TabsContent value="pantalla" className="min-h-0 flex-1 overflow-hidden">
            <PantallaClientePanel
              nombre={entrante.nombre}
              pip={pip?.activo ?? false}
              onCerrarPip={() => pip?.alternar()}
            />
          </TabsContent>
        )}
        {paginas
          .filter((p) => p.modo === "embebido")
          .map((p) => (
            <TabsContent key={p.id} value={p.id} className="min-h-0 flex-1 overflow-hidden">
              <ExternalPagePanel pagina={p} />
            </TabsContent>
          ))}
      </Tabs>

      {/* Solo para probar el mock: que el cliente empiece o deje de
          compartir su pantalla. No es parte de la pantalla. */}
      {(webcall || video || chat) && (
        <div className="flex shrink-0 items-center gap-2 border-t border-dashed border-border px-4 py-1.5 text-xs text-muted-foreground">
          {t("padMock.simularComparte.titulo")}
          <button
            type="button"
            onClick={onAlternarClienteComparte}
            className="inline-flex items-center gap-1 underline-offset-2 hover:text-foreground hover:underline"
          >
            <MonitorUp className="size-3.5" />
            {clienteComparte ? t("padMock.simularComparte.termina") : t("padMock.simularComparte.empieza")}
          </button>
        </div>
      )}

      <InteractionControls
        tipificaciones={tipificaciones}
        enEspera={enEspera}
        onToggleEspera={onToggleEspera}
        onCerrarInteraccion={onCerrarInteraccion}
        chat={chat}
        llamadaWeb={webcall || video}
        video={
          webcall || video || chat
            ? {
                compartiendo,
                onToggleCompartir: () => onAlternarCompartiendo?.(),
                ...(video && {
                  esVideo: true,
                  ...(solapaChat && { onCaptura: capturar }),
                }),
                // Picture-in-Picture: el video en la videollamada; la
                // pantalla del cliente en la webcall y el chat, mientras la
                // comparte.
                ...(pip && (video || ((webcall || chat) && clienteComparte)) && { pip: pip.activo, onTogglePip: pip.alternar }),
              }
            : undefined
        }
        interno={interno}
        sonando={sonando}
      />

    </div>
  );
}
