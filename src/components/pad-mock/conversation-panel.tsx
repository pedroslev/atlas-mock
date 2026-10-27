"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowDown, Info, Paperclip, Phone, PhoneOutgoing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MensajesChat } from "@/components/pad-mock/conversacion-chat";
import {
  SelectorPlantillas,
  type PlantillaElegida,
} from "@/components/pad-mock/selector-plantillas";
import { AdjuntosChips } from "@/components/plantillas/mensaje-renderizado";
import type { MensajeChat } from "@/lib/pad-mock/data";
import {
  getPlantilla,
  variablesPlantilla,
  type AdjuntoPlantilla,
  type CanalPlantilla,
} from "@/lib/mock-data";
import { renderizarParaCanal, variablesUsadas, type DatosVariables } from "@/lib/plantillas";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// Chat: hilo de mensajes arriba (cliente a la izquierda, asesor a la
// derecha) con "Volver al vivo", y el redactor abajo. Traído de la branch
// feature/pad-mock-omnicanal; la franja de Copiloto queda afuera.
function HiloChat({ mensajes }: { mensajes: MensajeChat[] }) {
  const t = useT();
  return (
    <div className="relative flex-1 overflow-y-auto p-4">
      <MensajesChat mensajes={mensajes} />

      <Button
        variant="outline"
        size="sm"
        className="absolute bottom-3 left-1/2 -translate-x-1/2 gap-1.5 shadow-sm"
      >
        <ArrowDown className="size-3.5" />
        {t("padMock.conversationPanel.volverAlVivo")}
      </Button>
    </div>
  );
}

// Redactor: Enter envía (Shift+Enter hace salto de línea); adjuntar y
// plantillas en línea, arriba del área de texto.
//
// Plantillas (ATLAS-1191): el selector lista las del grupo de plantillas de
// la campaña para este canal. Escribir "/" con el cuadro vacío lo abre. Al
// elegir una, el texto entra con las variables ya resueltas con los datos
// del cliente y los archivos como líneas "📎 nombre" (al enviar salen como
// mensaje aparte en ese punto); si ya había texto, el asesor elige Insertar o
// Reemplazar. La
// plantilla por defecto de la campaña (chat) viene precargada al abrir.
//
// Mock: grupo y plantilla por defecto fijos (los de la campaña de ejemplo);
// los datos del cliente salen del nombre con el que inició el chat.
const GRUPO_PLANTILLAS_MOCK = "pg-atencion";
const PLANTILLA_DEFAULT_CHAT_MOCK = "pl-saludo";
const CANAL: CanalPlantilla = "chat";

function Redactor({ nombreCliente }: { nombreCliente?: string }) {
  const t = useT();
  const datos: DatosVariables = useMemo(() => {
    const [nombre, ...resto] = (nombreCliente ?? "").split(" ");
    return {
      nombre,
      apellido: resto.join(" "),
      campania: "Soporte técnico Nivel 1",
      asesor: "Ana",
    };
  }, [nombreCliente]);

  const precargada = useMemo(() => {
    const p = getPlantilla(PLANTILLA_DEFAULT_CHAT_MOCK);
    return p ? { plantilla: p, ...renderizarParaCanal(p, CANAL, datos) } : null;
  }, [datos]);

  const [texto, setTexto] = useState(precargada?.texto ?? "");
  const [adjuntos, setAdjuntos] = useState<AdjuntoPlantilla[]>(
    precargada?.plantilla.adjuntos ?? []
  );
  const [aviso, setAviso] = useState<"precargada" | null>(precargada ? "precargada" : null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [pendiente, setPendiente] = useState<PlantillaElegida | null>(null);
  const [favoritas, setFavoritas] = useState<string[]>(["pl-datos"]);
  const [usos, setUsos] = useState<Record<string, number>>({ "pl-cierre": 4, "pl-demora": 2 });
  // Una variable sin dato queda visible en el texto ({{nombre}}); mientras
  // quede alguna, no se puede enviar: el asesor la completa a mano.
  const sinDato = variablesUsadas(texto);

  function aplicar(elegida: PlantillaElegida, modo: "insertar" | "reemplazar") {
    setTexto((prev) =>
      modo === "reemplazar" || prev.trim() === "" ? elegida.texto : `${prev.trimEnd()}\n\n${elegida.texto}`
    );
    setAdjuntos((prev) => [
      ...prev,
      ...elegida.plantilla.adjuntos.filter((a) => !prev.some((x) => x.id === a.id)),
    ]);
    setAviso(null);
    setUsos((prev) => ({ ...prev, [elegida.plantilla.id]: (prev[elegida.plantilla.id] ?? 0) + 1 }));
    setPendiente(null);
  }

  function elegir(elegida: PlantillaElegida) {
    // Con el cuadro vacío (o solo con la precargada sin tocar) reemplaza
    // directo; con texto del asesor, pregunta.
    if (texto.trim() === "" || aviso === "precargada") aplicar(elegida, "reemplazar");
    else setPendiente(elegida);
  }

  function enviar() {
    if (!texto.trim() || sinDato.length > 0) return;
    setTexto("");
    setAdjuntos([]);
    setAviso(null);
  }

  return (
    <div className="flex shrink-0 flex-col gap-2 border-t border-border p-3">
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={t("padMock.conversationPanel.adjuntar")}
          title={t("padMock.conversationPanel.adjuntar")}
        >
          <Paperclip className="size-4" />
        </Button>
        <SelectorPlantillas
          grupoId={GRUPO_PLANTILLAS_MOCK}
          canal={CANAL}
          datos={datos}
          open={selectorOpen}
          onOpenChange={setSelectorOpen}
          onElegir={elegir}
          favoritas={favoritas}
          onToggleFavorita={(id) =>
            setFavoritas((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
          }
          usos={usos}
        />
        <Button
          size="sm"
          onClick={enviar}
          disabled={!texto.trim() || sinDato.length > 0}
          className="shrink-0 gap-1.5"
        >
          {t("padMock.conversationPanel.enviar")}
          <Kbd className="bg-primary-foreground/15 text-primary-foreground">Enter</Kbd>
        </Button>
      </div>
      {aviso === "precargada" && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info className="size-3.5 shrink-0" />
          {t("plantillas.selector.precargada")}
        </p>
      )}
      {sinDato.length > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-warning">
          <AlertTriangle className="size-3.5 shrink-0" />
          {t("plantillas.selector.sinDato", {
            variables: sinDato
              .map((v) => (variablesPlantilla.some((d) => d.clave === v) ? t(`plantillas.variable.${v}`) : v))
              .join(", "),
          })}
        </p>
      )}
      <Textarea
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          if (aviso === "precargada") setAviso(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "/" && texto.trim() === "") {
            e.preventDefault();
            setSelectorOpen(true);
            return;
          }
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            enviar();
          }
        }}
        placeholder={`${t("padMock.conversationPanel.placeholder")} · ${t("plantillas.selector.atajo")}`}
        rows={3}
        className="resize-none"
      />
      {adjuntos.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">{t("plantillas.selector.adjuntoAgregado")}</span>
          <AdjuntosChips
            adjuntos={adjuntos}
            onQuitar={(id) => setAdjuntos((prev) => prev.filter((a) => a.id !== id))}
          />
        </div>
      )}

      <Dialog open={pendiente !== null} onOpenChange={(open) => !open && setPendiente(null)}>
        {/* Reemplazar es el camino más común: Enter lo hace; Shift+Enter
            inserta debajo (como Shift+Enter agrega una línea en el cuadro);
            Esc cancela. */}
        <DialogContent
          className="sm:max-w-md"
          onKeyDown={(e) => {
            if (e.key !== "Enter" || !pendiente) return;
            e.preventDefault();
            aplicar(pendiente, e.shiftKey ? "insertar" : "reemplazar");
          }}
        >
          <DialogHeader>
            <DialogTitle>{t("plantillas.selector.reemplazarTitulo")}</DialogTitle>
            <DialogDescription>{t("plantillas.selector.reemplazarDescripcion")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => pendiente && aplicar(pendiente, "insertar")}>
              {t("plantillas.selector.insertar")}
              <KbdGroup>
                <Kbd>⇧</Kbd>
                <Kbd>↵</Kbd>
              </KbdGroup>
            </Button>
            <Button autoFocus onClick={() => pendiente && aplicar(pendiente, "reemplazar")}>
              {t("plantillas.selector.reemplazar")}
              <Kbd className="bg-primary-foreground/20 text-primary-foreground">↵</Kbd>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Llamada: placeholder simple (sin transcripción, retirada a pedido) para
// no dejar el área vacía sin explicación.
//
// tiempo/enEspera: mismo cronómetro que ya se muestra en el título de la
// solapa (CenterColumn) — a pedido, se repite acá abajo de "Llamada en
// curso" para que se vea también en el cuerpo del panel, no solo arriba.
//
// Llamada interna: muestra con quién es la llamada (o "Llamando a…" mientras
// el otro agente no atiende) y los simuladores de rechazo y de una entrante
// con atención forzada, que la pone en espera.
export function ConversationPanel({
  tiempo,
  enEspera,
  mensajesChat,
  nombreCliente,
  interno = false,
  sonando = false,
  nombreInterno,
  onSimularForzada,
  onSimularRechazo,
}: {
  tiempo: string;
  enEspera: boolean;
  /** Chat: lo conversado hasta ahora. Sin esto, es una llamada. */
  mensajesChat?: MensajeChat[];
  /** Chat: nombre con el que el cliente inició la conversación. */
  nombreCliente?: string;
  interno?: boolean;
  sonando?: boolean;
  nombreInterno?: string;
  onSimularForzada?: () => void;
  onSimularRechazo?: () => void;
}) {
  const t = useT();
  if (mensajesChat) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <HiloChat mensajes={mensajesChat} />
        <Redactor nombreCliente={nombreCliente} />
      </div>
    );
  }
  if (interno) {
    return (
      <div className="flex h-full min-h-0 flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground">
        {sonando ? (
          <>
            <PhoneOutgoing className="size-6 animate-pulse" />
            <p className="text-sm">{t("padMock.llamadaInterna.llamando", { nombre: nombreInterno ?? "" })}</p>
            {onSimularRechazo && (
              <button
                type="button"
                onClick={onSimularRechazo}
                className="mt-4 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                {t("padMock.llamadaInterna.simularRechazo")}
              </button>
            )}
          </>
        ) : (
          <>
            <Phone className="size-6" />
            <p className="text-sm">{t("padMock.llamadaInterna.enCursoCon", { nombre: nombreInterno ?? "" })}</p>
            <span
              className={cn(
                "font-mono text-2xl font-bold tabular-nums",
                enEspera ? "text-warning" : "text-foreground"
              )}
            >
              {tiempo}
            </span>
            {onSimularForzada && (
              <button
                type="button"
                onClick={onSimularForzada}
                className="mt-4 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                {t("padMock.llamadaInterna.simularForzada")}
              </button>
            )}
          </>
        )}
      </div>
    );
  }
  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground">
      <Phone className="size-6" />
      <p className="text-sm">{t("padMock.conversationPanel.llamadaEnCurso")}</p>
      <span
        className={cn(
          "font-mono text-2xl font-bold tabular-nums",
          enEspera ? "text-warning" : "text-foreground"
        )}
      >
        {tiempo}
      </span>
    </div>
  );
}
