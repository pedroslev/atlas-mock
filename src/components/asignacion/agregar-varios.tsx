"use client";

// Piezas comunes para agregar y quitar varios elementos a la vez dentro de un
// grupo o de una campaña (ATLAS-1353): la ventana "Agregar varios", la casilla
// por fila y el botón "Quitar (n)" con su confirmación.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useT } from "@/lib/i18n";
import { ListaSeleccionable, type Opcion } from "./lista-seleccionable";

/**
 * Un filtro de la ventana: un desplegable de una opción. `pasa` dice si un
 * elemento queda en la lista con el valor elegido. "todos" no filtra.
 */
export type FiltroAgregar = {
  id: string;
  etiqueta: string;
  textoTodos: string;
  grupos: { titulo?: string; opciones: { value: string; label: string }[] }[];
  pasa: (valor: string, opcionId: string) => boolean;
};

export function AgregarVariosDialog({
  titulo,
  descripcion,
  opciones,
  filtros = [],
  placeholder,
  vacio,
  padreDe,
  onAgregar,
  onClose,
}: {
  titulo: string;
  descripcion?: string;
  /** Solo lo que todavía no está: lo ya agregado no se ofrece. */
  opciones: Opcion[];
  filtros?: FiltroAgregar[];
  placeholder: string;
  vacio: string;
  padreDe?: (id: string) => string | undefined;
  onAgregar: (ids: string[]) => void;
  onClose: () => void;
}) {
  const t = useT();
  const [valores, setValores] = useState<Record<string, string>>(
    Object.fromEntries(filtros.map((f) => [f.id, "todos"]))
  );
  const [elegidos, setElegidos] = useState<string[]>([]);

  // Los filtros se combinan entre sí.
  const visibles = opciones.filter((o) =>
    filtros.every((f) => valores[f.id] === "todos" || f.pasa(valores[f.id], o.id))
  );

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>
            {descripcion}
            {filtros.length > 0 && ` ${t("asignacion.notaCopia")}`}
          </DialogDescription>
        </DialogHeader>
        {filtros.length > 0 && (
          <div className={`grid gap-3 ${filtros.length > 1 ? "sm:grid-cols-2" : ""}`}>
            {filtros.map((f) => (
              <div key={f.id} className="flex flex-col gap-1.5">
                <Label>{f.etiqueta}</Label>
                <Select
                  value={valores[f.id]}
                  onValueChange={(v) => setValores((prev) => ({ ...prev, [f.id]: v }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">{f.textoTodos}</SelectItem>
                    {f.grupos.map((g, i) =>
                      g.titulo ? (
                        <SelectGroup key={g.titulo}>
                          <SelectLabel>{g.titulo}</SelectLabel>
                          {g.opciones.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectGroup>
                      ) : (
                        g.opciones.map((o) => (
                          <SelectItem key={`${i}:${o.value}`} value={o.value}>{o.label}</SelectItem>
                        ))
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        )}
        <ListaSeleccionable
          opciones={visibles}
          elegidos={elegidos}
          onChange={setElegidos}
          placeholder={placeholder}
          vacio={vacio}
          padreDe={padreDe}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t("common.acciones.cancelar")}</Button>
          <Button disabled={elegidos.length === 0} onClick={() => onAgregar(elegidos)}>
            {t("asignacion.agregarN", { n: elegidos.length })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Casilla de la cabecera de una lista de miembros: marca o desmarca a todos. */
export function CasillaTodos({
  ids,
  marcados,
  onChange,
}: {
  ids: string[];
  marcados: string[];
  onChange: (ids: string[]) => void;
}) {
  const t = useT();
  const n = ids.filter((id) => marcados.includes(id)).length;
  if (ids.length === 0) return null;
  return (
    <label className="flex items-center gap-2 px-3 text-sm text-muted-foreground">
      <Checkbox
        checked={n === 0 ? false : n === ids.length ? true : "indeterminate"}
        onCheckedChange={(v) => onChange(v === true ? ids : [])}
      />
      {t("asignacion.marcarTodos")}
    </label>
  );
}

/**
 * Botón "Quitar (n)" con confirmación. `extra` agrega una línea al aviso (por
 * ejemplo, las hijas que también se quitan).
 */
export function QuitarVarios({
  nombres,
  extra,
  ayuda,
  onConfirmar,
}: {
  nombres: string[];
  extra?: string;
  ayuda?: string;
  onConfirmar: () => void;
}) {
  const t = useT();
  const [abierto, setAbierto] = useState(false);
  if (nombres.length === 0) return null;
  return (
    <>
      <Button variant="outline" className="text-destructive" onClick={() => setAbierto(true)}>
        {t("asignacion.quitarN", { n: nombres.length })}
      </Button>
      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("asignacion.quitarTitulo", { n: nombres.length })}</DialogTitle>
            <DialogDescription>{nombres.join(", ")}</DialogDescription>
          </DialogHeader>
          {extra && <p className="text-sm text-destructive">{extra}</p>}
          <p className="text-sm text-muted-foreground">{ayuda ?? t("asignacion.quitarAyuda")}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAbierto(false)}>
              {t("common.acciones.cancelar")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onConfirmar();
                setAbierto(false);
              }}
            >
              {t("asignacion.quitarN", { n: nombres.length })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
