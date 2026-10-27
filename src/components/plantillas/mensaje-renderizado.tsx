import { Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  CANALES_PLANTILLA,
  type AdjuntoPlantilla,
  type CanalPlantilla,
  type TipoRender,
} from "@/lib/mock-data";
import { aTextoPlano, segmentar } from "@/lib/plantillas";
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
  /** Cómo se dibuja: chat (y redes), email o sms. */
  canal: TipoRender;
  className?: string;
}) {
  const lineas = (canal === "sms" ? aTextoPlano(texto) : texto).split("\n");
  return (
    <div className={cn("whitespace-pre-wrap text-sm leading-relaxed", className)}>
      {lineas.map((linea, i) => {
        const esItem = canal !== "sms" && linea.startsWith("- ");
        const contenido = esItem ? linea.slice(2) : linea;
        const segmentos =
          canal === "sms" ? [{ texto: contenido }] : segmentar(contenido);
        return (
          <div key={i} className={cn(esItem && "flex gap-1.5 pl-1")}>
            {esItem && <span aria-hidden>•</span>}
            <span>
              {segmentos.map((s, j) =>
                s.negrita ? (
                  <strong key={j}>{s.texto}</strong>
                ) : s.cursiva ? (
                  <em key={j}>{s.texto}</em>
                ) : (
                  <span key={j}>{s.texto}</span>
                )
              )}
              {linea === "" && " "}
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
