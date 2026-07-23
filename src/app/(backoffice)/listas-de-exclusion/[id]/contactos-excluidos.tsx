"use client";

import { useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActionTooltip } from "@/components/layout/action-tooltip";
import type { ContactoExcluido } from "@/lib/mock-data";
import { useT } from "@/lib/i18n";

// El tipo de contacto es un valor de dominio; su rótulo visible sale del
// diccionario.
const tipoKey: Record<ContactoExcluido["tipo"], string> = {
  wsp: "listas.contactos.tipoWhatsapp",
  calline: "listas.contactos.tipoLlamada",
  email: "listas.contactos.tipoEmail",
};

let contadorIdsNuevos = 0;

// Estado local solo para que agregar/quitar contacto se sienta real en el
// mock — no hay persistencia (ver PRODUCT.md: esto es un mock sin API).
export function ContactosExcluidos({
  initialContactos,
}: {
  initialContactos: ContactoExcluido[];
}) {
  const t = useT();
  const tipoLabel = (tipo: ContactoExcluido["tipo"]) => t(tipoKey[tipo]);
  const [contactos, setContactos] = useState(initialContactos);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contacto, setContacto] = useState("");
  const [tipo, setTipo] = useState<ContactoExcluido["tipo"]>("calline");
  // Buscador local: estas listas suelen ser largas (feedback 2026-07-16),
  // así que se filtra en vivo por contacto o tipo. Sin persistencia.
  const [busqueda, setBusqueda] = useState("");

  const contactosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return contactos;
    return contactos.filter(
      (c) =>
        c.contacto.toLowerCase().includes(q) ||
        t(tipoKey[c.tipo]).toLowerCase().includes(q)
    );
  }, [contactos, busqueda, t]);

  function agregarContacto() {
    const valor = contacto.trim();
    if (!valor) return;
    contadorIdsNuevos += 1;
    setContactos((current) => [
      ...current,
      { id: `dnc-nuevo-${contadorIdsNuevos}`, contacto: valor, tipo },
    ]);
    setContacto("");
    setTipo("calline");
    setDialogOpen(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-muted-foreground">
          {t(
            contactos.length === 1
              ? "listas.contactos.uno"
              : "listas.contactos.varios",
            { n: contactos.length.toLocaleString("es-AR") }
          )}
        </span>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus />
              {t("listas.contactos.agregar")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("listas.contactos.agregarTitulo")}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contacto">
                  {t("listas.contactos.contacto")}
                </Label>
                <Input
                  id="contacto"
                  placeholder="+54 11 4000-0000 / email@ejemplo.com"
                  value={contacto}
                  onChange={(event) => setContacto(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tipo-contacto">{t("listas.col.tipo")}</Label>
                <Select
                  value={tipo}
                  onValueChange={(value) =>
                    setTipo(value as ContactoExcluido["tipo"])
                  }
                >
                  <SelectTrigger id="tipo-contacto" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="calline">
                      {t("listas.contactos.tipoLlamada")}
                    </SelectItem>
                    <SelectItem value="wsp">
                      {t("listas.contactos.tipoWhatsapp")}
                    </SelectItem>
                    <SelectItem value="email">
                      {t("listas.contactos.tipoEmail")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t("common.acciones.cancelar")}
              </Button>
              <Button onClick={agregarContacto} disabled={!contacto.trim()}>
                {t("common.acciones.agregar")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {contactos.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("listas.contactos.vacio")}
        </p>
      ) : (
        <>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("listas.contactos.buscarPlaceholder")}
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              className="pl-9"
              aria-label={t("listas.contactos.buscarAria")}
            />
          </div>
          {contactosFiltrados.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("listas.contactos.sinCoincidencias", { q: busqueda.trim() })}
            </p>
          ) : (
            <div className="rounded-xl ring-1 ring-foreground/10">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("listas.contactos.contacto")}</TableHead>
                    <TableHead>{t("listas.col.tipo")}</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contactosFiltrados.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-sm">
                        {c.contacto}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{tipoLabel(c.tipo)}</Badge>
                      </TableCell>
                      <TableCell>
                        <ActionTooltip label={t("listas.contactos.quitar")}>
                          <button
                            type="button"
                            aria-label={t("listas.contactos.quitarAria", {
                              contacto: c.contacto,
                            })}
                            onClick={() =>
                              setContactos((current) =>
                                current.filter((x) => x.id !== c.id)
                              )
                            }
                            className="flex size-8 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10"
                          >
                            <X className="size-4" />
                          </button>
                        </ActionTooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
