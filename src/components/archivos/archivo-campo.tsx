"use client";

import { useRef, useState } from "react";
import { Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useT } from "@/lib/i18n";

type Rechazo = { nombre: string; motivo: "tipo" | "tamano"; mb?: number };

// Tope de tamaño: un número para todos los tipos, o uno por extensión (la
// imagen y el video en espera comparten campo con topes distintos).
type MaxMB = number | Record<string, number>;

function topeDe(maxMB: MaxMB | undefined, ext: string) {
  if (maxMB === undefined) return undefined;
  return typeof maxMB === "number" ? maxMB : maxMB[ext];
}

// Campo para subir un archivo de configuración (sonido del timbre, audio o
// video en espera, fondo del asesor). Valida antes y después, como todo
// Atlas: el selector ya viene filtrado a los tipos permitidos y, al elegir,
// se revisa de nuevo tipo y tamaño. Si no se puede, un aviso con el motivo
// y lo permitido; abre con el foco en "Entendido" y Enter lo cierra.
// En el mock solo se guarda el nombre del archivo.
export function ArchivoCampo({
  id,
  value,
  onChange,
  extensiones,
  maxMB,
  disabled,
}: {
  id: string;
  value?: string;
  onChange: (nombre: string | undefined) => void;
  extensiones: string[];
  maxMB?: MaxMB;
  disabled?: boolean;
}) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [rechazo, setRechazo] = useState<Rechazo | null>(null);
  // Texto de lo permitido. Con un tope por extensión, agrupa los tipos que
  // comparten tope: "JPG, JPEG, PNG hasta 20 MB; MP4, WEBM hasta 50 MB".
  const permitidos = extensiones.map((e) => e.toUpperCase()).join(", ");
  let textoPermitidos: string;
  if (maxMB === undefined) textoPermitidos = t("campanias.archivo.permitidos", { tipos: permitidos });
  else if (typeof maxMB === "number")
    textoPermitidos = t("campanias.archivo.permitidosConTamano", { tipos: permitidos, mb: maxMB });
  else {
    const porTope = new Map<number, string[]>();
    for (const e of extensiones) {
      const mb = maxMB[e];
      porTope.set(mb, [...(porTope.get(mb) ?? []), e.toUpperCase()]);
    }
    textoPermitidos = t("campanias.archivo.permitidosVarios", {
      grupos: [...porTope].map(([mb, tipos]) => t("campanias.archivo.grupoTamano", { tipos: tipos.join(", "), mb })).join("; "),
    });
  }

  function elegir(f: File | undefined) {
    if (!f) return;
    const ext = f.name.includes(".") ? f.name.split(".").pop()!.toLowerCase() : "";
    const tope = topeDe(maxMB, ext);
    if (!extensiones.includes(ext)) setRechazo({ nombre: f.name, motivo: "tipo" });
    else if (tope && f.size > tope * 1024 * 1024) setRechazo({ nombre: f.name, motivo: "tamano", mb: tope });
    else onChange(f.name);
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          id={id}
          type="file"
          className="hidden"
          accept={extensiones.map((e) => `.${e}`).join(",")}
          onChange={(e) => {
            elegir(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {value ? (
          <span className="flex min-w-0 items-center gap-1.5 rounded-md border px-2 py-1 text-sm">
            <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{value}</span>
            <button
              type="button"
              aria-label={t("campanias.archivo.quitar")}
              className="text-muted-foreground hover:text-destructive"
              onClick={() => onChange(undefined)}
              disabled={disabled}
            >
              <X className="size-3.5" />
            </button>
          </span>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            <Paperclip />
            {t("campanias.archivo.elegir")}
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{textoPermitidos}</p>

      <AlertDialog open={rechazo !== null} onOpenChange={(o) => !o && setRechazo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("campanias.archivo.rechazadoTitulo")}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{rechazo?.nombre}</span>
                  <span>
                    {rechazo?.motivo === "tipo"
                      ? t("campanias.archivo.tipoNoSoportado")
                      : t("campanias.archivo.muyGrande", { mb: rechazo?.mb ?? 0 })}
                  </span>
                </div>
                <p className="text-xs">{textoPermitidos}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction autoFocus className="gap-1.5">
              {t("campanias.archivo.entendido")}
              <Kbd className="bg-primary-foreground/15 text-primary-foreground">Enter</Kbd>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
