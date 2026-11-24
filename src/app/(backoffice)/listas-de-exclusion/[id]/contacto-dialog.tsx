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
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EleccionSentido, type DecisionSentido } from "./eleccion-sentido";

// Agregar contactos (varios, uno por línea) y Editar un contacto (ATLAS-1444).
// Es el mismo diálogo: Editar lo abre con Contacto, Canal y Sentido cargados.
// - Agregar: si el contacto ya está con ese canal y otro sentido, un modal
//   lista esos contactos y el usuario elige: dejarlos con el sentido nuevo o
//   pasarlos a Bidireccional (una elección para todos). Si el sentido nuevo es
//   Bidireccional no pregunta: las dos opciones dan lo mismo.
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
  type Parcial = { nuevos: ContactoExcluido[]; agregados: number; actualizados: number; ya: number };
  const [parcial, setParcial] = useState<Parcial | null>(null);
  const resumenDe = (p: Omit<Parcial, "nuevos">) =>
    t("listas.contactos.resultado", { agregados: p.agregados, actualizados: p.actualizados, ya: p.ya });

  // Contactos que ya están con otro sentido: esperan la elección del modal.
  const [conflictos, setConflictos] = useState<{ contacto: string; actual: SentidoExclusion }[] | null>(null);
  const [decision, setDecision] = useState<DecisionSentido | null>(null);

  function agregar(eleccion?: DecisionSentido) {
    const lineas = texto.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const base = parcial?.nuevos ?? contactos;
    if (!eleccion && sentido !== "bidireccional") {
      const vistos = new Set<string>();
      const encontrados: { contacto: string; actual: SentidoExclusion }[] = [];
      for (const linea of lineas) {
        const v = validarContacto(linea, canal);
        if (!v.ok) continue;
        const k = clave({ contacto: v.valor, canal });
        if (vistos.has(k)) continue;
        vistos.add(k);
        const existente = base.find((c) => clave(c) === k);
        if (existente && existente.sentido !== sentido) {
          encontrados.push({ contacto: v.valor, actual: existente.sentido });
        }
      }
      if (encontrados.length > 0) {
        setConflictos(encontrados);
        setDecision(null);
        return;
      }
    }
    const resultado = [...base];
    const malas: string[] = [];
    let agregados = parcial?.agregados ?? 0;
    let actualizados = parcial?.actualizados ?? 0;
    let ya = parcial?.ya ?? 0;
    for (const linea of lineas) {
      const v = validarContacto(linea, canal);
      if (!v.ok) {
        malas.push(linea);
        continue;
      }
      const i = resultado.findIndex((c) => clave(c) === clave({ contacto: v.valor, canal }));
      if (i >= 0) {
        const actual = resultado[i].sentido;
        const final = eleccion === "nuevo" ? sentido : combinarSentido(actual, sentido);
        resultado[i] = { ...resultado[i], sentido: final };
        if (final !== actual) actualizados++;
        else ya++;
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
      setParcial({ nuevos: resultado, agregados, actualizados, ya });
      setTexto(malas.join("\n"));
      setInvalidas(malas);
      return;
    }
    onAplicar(resultado, resumenDe({ agregados, actualizados, ya }));
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
        <Button onClick={() => (editando ? editar() : agregar())} disabled={!texto.trim()}>
          {t(editando ? "common.acciones.guardar" : "common.acciones.agregar")}
        </Button>
      </DialogFooter>

      <AlertDialog open={conflictos !== null} onOpenChange={(abierto) => !abierto && setConflictos(null)}>
        <AlertDialogContent className="data-[size=default]:sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t(conflictos?.length === 1 ? "listas.conflicto.tituloUno" : "listas.conflicto.titulo")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(conflictos?.length === 1 ? "listas.conflicto.descUno" : "listas.conflicto.desc", {
                sentido: t(`listas.sentido.${sentido}`),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-48 overflow-y-auto rounded-lg ring-1 ring-foreground/10">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("listas.contactos.contacto")}</TableHead>
                  <TableHead>{t("listas.conflicto.sentidoActual")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conflictos?.map((c) => (
                  <TableRow key={c.contacto}>
                    <TableCell className="font-mono text-xs">{c.contacto}</TableCell>
                    <TableCell>{t(`listas.sentido.${c.actual}`)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <EleccionSentido
            name="decision-sentido"
            etiquetaNuevo={t(conflictos?.length === 1 ? "listas.conflicto.dejarNuevoUno" : "listas.conflicto.dejarNuevo", {
              sentido: t(`listas.sentido.${sentido}`),
            })}
            decision={decision}
            onChange={setDecision}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>{t("listas.conflicto.volver")}</AlertDialogCancel>
            <Button
              disabled={!decision}
              onClick={() => {
                const d = decision!;
                setConflictos(null);
                agregar(d);
              }}
            >
              {t("listas.conflicto.aplicar")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DialogContent>
  );
}
