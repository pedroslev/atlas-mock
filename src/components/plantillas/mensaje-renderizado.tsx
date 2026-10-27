import { Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  CANALES_PLANTILLA,
  type AdjuntoPlantilla,
  type CanalPlantilla,
  type TipoRender,
} from "@/lib/mock-data";
import { aTextoPlano, segmentar, tipoDeLinea } from "@/lib/plantillas";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// Cómo recibe el cliente el mensaje de una plantilla en un canal dado:
// email y chat muestran el formato (negrita, cursiva, listas); SMS solo
// texto plano. Lo usan la vista previa del editor (Olimpo) y el selector del
// redactor (Hermes).
export function MensajeRenderizado({
  texto,
  canal,
  className,
}: {
  texto: string;
  /** Cómo se dibuja: chat (y WhatsApp), plano (redes), email o sms. */
  canal: TipoRender;
  className?: string;
}) {
  const conFormato = canal === "chat" || canal === "email";
  const lineas = (conFormato ? texto : aTextoPlano(texto)).split("\n");
  return (
    <div className={cn("whitespace-pre-wrap text-sm leading-relaxed", className)}>
      {lineas.map((linea, i) => {
        const { tipo, marcador, texto: contenido } = conFormato
          ? tipoDeLinea(linea)
          : { tipo: "texto" as const, marcador: "", texto: linea };
        const segmentos = conFormato ? segmentar(contenido) : [{ texto: contenido }];
        return (
          <div key={i} className={cn(tipo !== "texto" && "flex gap-1.5 pl-1")}>
            {tipo !== "texto" && <span aria-hidden>{marcador}</span>}
            <span>
              {segmentos.map((s, j) =>
                s.url ? (
                  // Chat web y email muestran el enlace con su texto; en WhatsApp y
                  // los canales planos sale "texto (url)" (ver aFormatoChat).
                  <a key={j} href={s.url} className="underline underline-offset-2" onClick={(e) => e.preventDefault()}>
                    {s.texto}
                  </a>
                ) : s.negrita ? (
                  <strong key={j}>{s.texto}</strong>
                ) : s.cursiva ? (
                  <em key={j}>{s.texto}</em>
                ) : s.tachado ? (
                  <s key={j}>{s.texto}</s>
                ) : (
                  <span key={j}>{s.texto}</span>
                )
              )}
              {linea === "" && " "}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Con todos los canales marcados muestra un solo chip "Todos los canales".
export function CanalBadges({ canales }: { canales: CanalPlantilla[] }) {
  const t = useT();
  if (CANALES_PLANTILLA.every((c) => canales.includes(c))) {
    return <Badge variant="outline">{t("plantillas.canal.todos")}</Badge>;
  }
  return (
    <span className="flex flex-wrap gap-1">
      {canales.map((c) => (
        <Badge key={c} variant="outline">
          {t(`plantillas.canal.${c}`)}
        </Badge>
      ))}
    </span>
  );
}

export function AdjuntosChips({
  adjuntos,
  onQuitar,
}: {
  adjuntos: AdjuntoPlantilla[];
  onQuitar?: (id: string) => void;
}) {
  const t = useT();
  return (
    <div className="flex flex-wrap gap-1.5">
      {adjuntos.map((a) => (
        <span
          key={a.id}
          className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs"
        >
          <Paperclip className="size-3 text-muted-foreground" />
          <span className="font-medium">{a.nombre}</span>
          <span className="text-muted-foreground">{a.tamano}</span>
          {onQuitar && (
            <button
              type="button"
              aria-label={t("plantillas.editor.quitarArchivo", { nombre: a.nombre })}
              onClick={() => onQuitar(a.id)}
              className="ml-0.5 text-muted-foreground hover:text-destructive"
            >
              ×
            </button>
          )}
        </span>
      ))}
    </div>
  );
}
