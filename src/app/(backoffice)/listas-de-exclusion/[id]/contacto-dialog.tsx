"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogConAviso } from "@/components/layout/aviso-cambios";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  CanalExclusion,
  ContactoExcluido,
  SentidoExclusion,
} from "@/lib/mock-data";
import {
  CANALES,
  SENTIDOS,
  USUARIO_ACTUAL,
  clave,
  combinarSentido,
  nuevoId,
  validarContacto,
} from "@/lib/listas-exclusion";
import { useT } from "@/lib/i18n";

// Agregar contactos (varios, uno por línea) y Editar un contacto (ATLAS-1444).
// Es el mismo diálogo: Editar lo abre con Contacto, Canal y Sentido cargados.
// - Agregar: si el contacto ya está con ese canal, se combina el sentido.
// - Editar: si queda igual a otro de la lista con ese canal, avisa y no guarda
//   (editar es corregir un contacto, no juntar dos).
// Lo aplicado queda pendiente hasta el Confirmar de la pantalla.
export function ContactoDialog({
  open,
  onOpenChange,
  contactos,
  editando,
  onAplicar,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactos: ContactoExcluido[];
  editando?: ContactoExcluido;
  onAplicar: (nuevos: ContactoExcluido[], resumen: string) => void;
}) {
  return (
    <DialogConAviso open={open} onOpenChange={onOpenChange}>
      {open && (
        <Formulario
          key={editando?.id ?? "nuevo"}
          contactos={contactos}
          editando={editando}
          onAplicar={(nuevos, resumen) => {
            onAplicar(nuevos, resumen);
            onOpenChange(false);
          }}
        />
      )}
    </DialogConAviso>
  );
}

function Formulario({
  contactos,
  editando,
  onAplicar,
}: {
  contactos: ContactoExcluido[];
  editando?: ContactoExcluido;
  onAplicar: (nuevos: ContactoExcluido[], resumen: string) => void;
}) {
  const t = useT();
  const [texto, setTexto] = useState(editando?.contacto ?? "");
  const [canal, setCanal] = useState<CanalExclusion>(editando?.canal ?? "calline");
  const [sentido, setSentido] = useState<SentidoExclusion>(editando?.sentido ?? "saliente");
  const [invalidas, setInvalidas] = useState<string[]>([]);
  const [error, setError] = useState("");

  // Con líneas inválidas, lo válido queda aplicado en el diálogo y lo que no,
  // en el cuadro para corregirlo. "Cerrar" se queda con lo aplicado.
  const [parcial, setParcial] = useState<{ nuevos: ContactoExcluido[]; agregados: number; ya: number } | null>(null);
  const resumenDe = (p: { agregados: number; ya: number }) =>
    t("listas.contactos.resultado", { agregados: p.agregados, ya: p.ya });

  function agregar() {
    const lineas = texto.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const resultado = [...(parcial?.nuevos ?? contactos)];
    const malas: string[] = [];
    let agregados = parcial?.agregados ?? 0;
    let ya = parcial?.ya ?? 0;
    for (const linea of lineas) {
      const v = validarContacto(linea, canal);
      if (!v.ok) {
        malas.push(linea);
        continue;
      }
      const i = resultado.findIndex((c) => clave(c) === clave({ contacto: v.valor, canal }));
      if (i >= 0) {
        resultado[i] = { ...resultado[i], sentido: combinarSentido(resultado[i].sentido, sentido) };
        ya++;
      } else {
        resultado.unshift({
          id: nuevoId(),
          contacto: v.valor,
          canal,
          sentido,
          fechaAlta: new Date().toISOString(),
          usuarioAlta: USUARIO_ACTUAL,
        });
        agregados++;
      }
    }
    if (malas.length > 0) {
      setParcial({ nuevos: resultado, agregados, ya });
      setTexto(malas.join("\n"));
      setInvalidas(malas);
      return;
    }
    onAplicar(resultado, resumenDe({ agregados, ya }));
  }

  function editar() {
    if (!editando) return;
    const v = validarContacto(texto, canal);
    if (!v.ok) {
      setError(t(`listas.contactos.invalido.${v.motivo}`));
      return;
    }
    const repetido = contactos.some(
      (c) => c.id !== editando.id && clave(c) === clave({ contacto: v.valor, canal })
    );
    if (repetido) {
      setError(t("listas.contactos.repetido"));
      return;
    }
    onAplicar(
      contactos.map((c) => (c.id === editando.id ? { ...c, contacto: v.valor, canal, sentido } : c)),
      ""
    );
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {t(editando ? "listas.contactos.editarTitulo" : "listas.contactos.agregarTitulo")}
        </DialogTitle>
        {parcial && <DialogDescription>{resumenDe(parcial)}</DialogDescription>}
      </DialogHeader>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contacto-excluido">
            {t(editando ? "listas.contactos.contacto" : "listas.contactos.lineas")}
          </Label>
          {editando ? (
            <Input
              id="contacto-excluido"
              value={texto}
              aria-invalid={!!error}
              onChange={(e) => {
                setTexto(e.target.value);
                setError("");
              }}
            />
          ) : (
            <Textarea
              id="contacto-excluido"
              rows={5}
              className="font-mono"
              placeholder={t("listas.contactos.lineasPlaceholder")}
              value={texto}
              aria-invalid={invalidas.length > 0}
              onChange={(e) => {
                setTexto(e.target.value);
                setInvalidas([]);
              }}
            />
          )}
          {error ? (
            <span className="text-xs text-destructive">{error}</span>
          ) : invalidas.length > 0 ? (
            <span className="text-xs text-destructive">
              {t("listas.contactos.invalidas")}{" "}
              {t(canal === "email" ? "listas.contactos.invalido.email" : "listas.contactos.invalido.numero")}
            </span>
          ) : (
            !editando && (
              <span className="text-xs text-muted-foreground">{t("listas.contactos.lineasAyuda")}</span>
            )
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="canal-contacto">{t("listas.contactos.canal")}</Label>
            <Select
              value={canal}
              onValueChange={(v) => {
                setCanal(v as CanalExclusion);
                setError("");
                setInvalidas([]);
              }}
            >
              <SelectTrigger id="canal-contacto" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CANALES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {t(`listas.canal.${c}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!editando && (
              <span className="text-xs text-muted-foreground">{t("listas.contactos.canalAyuda")}</span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sentido-contacto">{t("listas.contactos.sentido")}</Label>
            <Select value={sentido} onValueChange={(v) => setSentido(v as SentidoExclusion)}>
              <SelectTrigger id="sentido-contacto" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SENTIDOS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`listas.sentido.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">{t(`listas.sentido.ayuda.${sentido}`)}</span>
          </div>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">{t("common.acciones.cancelar")}</Button>
        </DialogClose>
        {parcial && !editando && (
          <Button variant="outline" onClick={() => onAplicar(parcial.nuevos, resumenDe(parcial))}>
            {t("common.acciones.cerrar")}
          </Button>
        )}
        <Button onClick={editando ? editar : agregar} disabled={!texto.trim()}>
          {t(editando ? "common.acciones.guardar" : "common.acciones.agregar")}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
