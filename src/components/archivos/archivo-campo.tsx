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

type Rechazo = { nombre: string; motivo: "tipo" | "tamano" };

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
  maxMB?: number;
  disabled?: boolean;
}) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const [rechazo, setRechazo] = useState<Rechazo | null>(null);
  const permitidos = extensiones.map((e) => e.toUpperCase()).join(", ");

  function elegir(f: File | undefined) {
    if (!f) return;
    const ext = f.name.includes(".") ? f.name.split(".").pop()!.toLowerCase() : "";
    if (!extensiones.includes(ext)) setRechazo({ nombre: f.name, motivo: "tipo" });
    else if (maxMB && f.size > maxMB * 1024 * 1024) setRechazo({ nombre: f.name, motivo: "tamano" });
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
      <p className="text-xs text-muted-foreground">
        {maxMB
          ? t("campanias.archivo.permitidosConTamano", { tipos: permitidos, mb: maxMB })
          : t("campanias.archivo.permitidos", { tipos: permitidos })}
      </p>

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
                      : t("campanias.archivo.muyGrande", { mb: maxMB ?? 0 })}
                  </span>
                </div>
                <p className="text-xs">
                  {maxMB
                    ? t("campanias.archivo.permitidosConTamano", { tipos: permitidos, mb: maxMB })
                    : t("campanias.archivo.permitidos", { tipos: permitidos })}
                </p>
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
