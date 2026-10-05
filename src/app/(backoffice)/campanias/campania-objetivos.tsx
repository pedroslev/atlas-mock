"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, RefreshCw, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RowActions } from "@/components/data-table/row-actions";
import {
  MitrolTable,
  type MRT_ColumnDef,
} from "@/components/data-table/mitrol-table";
import {
  ADefinir,
  CanalBadge,
  CanalIcon,
  EstadoObjetivoBadge,
  OrigenBadge,
} from "@/components/clientes/clientes-ui";
import {
  clasificacionesSalida,
  formatFecha,
  getCliente,
  getInteraccionesDeObjetivo,
  getObjetivosDeCampania,
  nombreCompleto,
  type CanalContacto,
  type EstadoObjetivo,
  type ObjetivoContacto,
} from "@/lib/mock-clientes";
import { useT } from "@/lib/i18n";

const ESTADOS: EstadoObjetivo[] = [
  "programado",
  "pendiente",
  "enCurso",
  "contactado",
  "noContactado",
  "vencido",
  "cancelado",
];

const CANALES: CanalContacto[] = ["llamada", "whatsapp", "sms", "email"];

type Fila = ObjetivoContacto & { cliente: string };

export function ObjetivosContactoTab({ campaniaId }: { campaniaId: string }) {
  const t = useT();
  const [objetivos, setObjetivos] = useState<ObjetivoContacto[]>(() =>
    getObjetivosDeCampania(campaniaId)
  );
  const [filtro, setFiltro] = useState<EstadoObjetivo | "todos">("todos");
  const [verInteracciones, setVerInteracciones] = useState<Fila | null>(null);
  const [reprogramar, setReprogramar] = useState<Fila | null>(null);
  const [cargarOpen, setCargarOpen] = useState(false);
  const [recontactarOpen, setRecontactarOpen] = useState(false);

  const filas = useMemo<Fila[]>(
    () =>
      objetivos
        .filter((o) => filtro === "todos" || o.estado === filtro)
        .map((o) => {
          const c = getCliente(o.clienteId);
          return { ...o, cliente: c ? nombreCompleto(c) : "—" };
        }),
    [objetivos, filtro]
  );

  const conteo = useMemo(() => {
    const m = new Map<EstadoObjetivo, number>();
    objetivos.forEach((o) => m.set(o.estado, (m.get(o.estado) ?? 0) + 1));
    return m;
  }, [objetivos]);

  const columns = useMemo<MRT_ColumnDef<Fila>[]>(
    () => [
      {
        accessorKey: "cliente",
        header: t("clientes.obj.col.cliente"),
        Cell: ({ row }) => (
          <Link
            href={`/clientes/${row.original.clienteId}`}
            className="font-medium hover:underline"
          >
            {row.original.cliente}
          </Link>
        ),
      },
      {
        accessorKey: "cargado",
        header: t("clientes.obj.col.cargado"),
        Cell: ({ cell }) => (
          <span className="whitespace-nowrap">{formatFecha(cell.getValue<string>(), true)}</span>
        ),
      },
      {
        id: "origen",
        header: t("clientes.obj.col.origen"),
        accessorFn: (o) => t(`clientes.origen.${o.origen.tipo}`),
        filterVariant: "select",
        Cell: ({ row }) => <OrigenBadge origen={row.original.origen} />,
      },
      {
        id: "medios",
        header: t("clientes.obj.col.medios"),
        accessorFn: (o) => o.medios.join(", "),
        Cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.medios.map((m, i) => (
              <CanalBadge key={m} canal={m} orden={i + 1} />
            ))}
          </div>
        ),
      },
      {
        id: "ventana",
        header: t("clientes.obj.col.ventana"),
        accessorFn: (o) => o.desde,
        Cell: ({ row }) => (
          <span className="whitespace-nowrap">
            {formatFecha(row.original.desde)} – {formatFecha(row.original.hasta)}
          </span>
        ),
      },
      {
        accessorKey: "pasoActual",
        header: t("clientes.obj.col.paso"),
        Cell: ({ cell }) => {
          const n = cell.getValue<number | null>();
          return n ? t("clientes.obj.paso", { n }) : <span className="text-muted-foreground">—</span>;
        },
      },
      {
        accessorKey: "estado",
        header: t("clientes.obj.col.estado"),
        Cell: ({ cell }) => <EstadoObjetivoBadge estado={cell.getValue<EstadoObjetivo>()} />,
      },
    ],
    [t]
  );

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <CardTitle>{t("clientes.obj.titulo")}</CardTitle>
          <CardDescription>{t("clientes.obj.descripcion")}</CardDescription>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="outline" onClick={() => setRecontactarOpen(true)}>
            <RefreshCw />
            {t("clientes.obj.recontactar")}
          </Button>
          <Button onClick={() => setCargarOpen(true)}>
            <Upload />
            {t("clientes.obj.cargar")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t("clientes.obj.col.estado")}>
          <FiltroChip activo={filtro === "todos"} onClick={() => setFiltro("todos")}>
            {t("clientes.obj.todos")} · {objetivos.length}
          </FiltroChip>
          {ESTADOS.filter((e) => conteo.get(e)).map((e) => (
            <FiltroChip key={e} activo={filtro === e} onClick={() => setFiltro(e)}>
              {t(`clientes.estado.${e}`)} · {conteo.get(e)}
            </FiltroChip>
          ))}
          <span className="ml-auto">
            <ADefinir nota={t("clientes.obj.mediosNota")} />
          </span>
        </div>

        <MitrolTable
          columns={columns}
          data={filas}
          options={{
            enableRowActions: true,
            renderEmptyRowsFallback: () => (
              <p className="p-6 text-center text-sm text-muted-foreground">{t("clientes.obj.vacio")}</p>
            ),
            renderRowActions: ({ row }) => {
              const o = row.original;
              const activo = o.estado === "programado" || o.estado === "pendiente" || o.estado === "enCurso";
              return (
                <RowActions
                  actions={[
                    { label: t("clientes.obj.verInteracciones"), onSelect: () => setVerInteracciones(o) },
                    { label: t("clientes.obj.reprogramar"), onSelect: () => setReprogramar(o) },
                    {
                      label: t("clientes.obj.cancelar"),
                      destructive: true,
                      separatorBefore: true,
                      disabled: !activo,
                      confirmDescription: t("clientes.obj.cancelarConfirm", { nombre: o.cliente }),
                      onSelect: () =>
                        setObjetivos((os) =>
                          os.map((x) => (x.id === o.id ? { ...x, estado: "cancelado", pasoActual: null } : x))
                        ),
                    },
                  ]}
                />
              );
            },
          }}
        />
      </CardContent>

      <InteraccionesSheet fila={verInteracciones} onClose={() => setVerInteracciones(null)} />
      <ReprogramarDialog fila={reprogramar} onClose={() => setReprogramar(null)} />
      <CargarDialog open={cargarOpen} onOpenChange={setCargarOpen} />
      <RecontactarDialog open={recontactarOpen} onOpenChange={setRecontactarOpen} />
    </Card>
  );
}

function FiltroChip({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={
        activo
          ? "h-7 rounded-full bg-primary px-3 text-xs font-medium text-primary-foreground"
          : "h-7 rounded-full border px-3 text-xs font-medium text-muted-foreground hover:bg-muted"
      }
    >
      {children}
    </button>
  );
}

function InteraccionesSheet({ fila, onClose }: { fila: Fila | null; onClose: () => void }) {
  const t = useT();
  const items = fila ? getInteraccionesDeObjetivo(fila.id) : [];
  return (
    <Sheet open={!!fila} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t("clientes.obj.interacciones.titulo")}</SheetTitle>
          {fila && (
            <SheetDescription>
              {t("clientes.obj.interacciones.desc", {
                cliente: fila.cliente,
                fecha: formatFecha(fila.cargado, true),
                origen: fila.origen.detalle,
              })}
            </SheetDescription>
          )}
        </SheetHeader>
        <ol className="flex flex-col gap-3 px-4">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">{t("clientes.obj.interacciones.vacio")}</p>
          )}
          {items.map((i) => (
            <li key={i.id} className="flex gap-3 rounded-lg border p-3">
              <CanalIcon canal={i.canal} className="mt-0.5 size-4 text-muted-foreground" />
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{t(`clientes.canal.${i.canal}`)}</span>
                  <span className="text-xs text-muted-foreground">{formatFecha(i.fecha, true)}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{i.clasificacion}</Badge>
                  {i.agente && <span>{i.agente}</span>}
                  {i.duracion && i.duracion !== "—" && <span>{i.duracion}</span>}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </SheetContent>
    </Sheet>
  );
}

function ReprogramarDialog({ fila, onClose }: { fila: Fila | null; onClose: () => void }) {
  const t = useT();
  return (
    <Dialog open={!!fila} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("clientes.obj.reprog.titulo")}</DialogTitle>
          {fila && (
            <DialogDescription>
              {t("clientes.obj.reprog.desc", { nombre: fila.cliente })}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reprog-desde">{t("clientes.obj.desde")}</Label>
            <Input id="reprog-desde" type="date" defaultValue="2026-10-06" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reprog-hasta">{t("clientes.obj.hasta")}</Label>
            <Input id="reprog-hasta" type="date" defaultValue="2026-10-10" />
          </div>
        </div>
        <ADefinir nota={t("clientes.obj.reprog.nota")} />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.acciones.cancelar")}
          </Button>
          <Button onClick={onClose}>{t("common.acciones.confirmar")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Medios en orden de preferencia, reordenables — "por qué medio deseamos
// contactar" (pedido de producto 2026-10-05).
function MediosPicker() {
  const t = useT();
  const [medios, setMedios] = useState<CanalContacto[]>(["llamada", "whatsapp"]);
  const restantes = CANALES.filter((c) => !medios.includes(c));
  const mover = (i: number, d: -1 | 1) =>
    setMedios((ms) => {
      const n = [...ms];
      [n[i], n[i + d]] = [n[i + d], n[i]];
      return n;
    });
  return (
    <div className="flex flex-col gap-2">
      <ol className="flex flex-col gap-1.5">
        {medios.map((m, i) => (
          <li key={m} className="flex items-center gap-2 rounded-lg border px-3 py-1.5">
            <span className="w-4 text-xs text-muted-foreground">{i + 1}.</span>
            <CanalIcon canal={m} />
            <span className="flex-1 text-sm">{t(`clientes.canal.${m}`)}</span>
            <Button variant="ghost" size="icon" className="size-7" disabled={i === 0} onClick={() => mover(i, -1)} aria-label={t("clientes.est.subir")}>
              <ArrowUp />
            </Button>
            <Button variant="ghost" size="icon" className="size-7" disabled={i === medios.length - 1} onClick={() => mover(i, 1)} aria-label={t("clientes.est.bajar")}>
              <ArrowDown />
            </Button>
            <Button variant="ghost" size="icon" className="size-7" disabled={medios.length === 1} onClick={() => setMedios((ms) => ms.filter((x) => x !== m))} aria-label={t("common.acciones.eliminar")}>
              <X />
            </Button>
          </li>
        ))}
      </ol>
      {restantes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {restantes.map((c) => (
            <Button key={c} variant="outline" size="sm" onClick={() => setMedios((ms) => [...ms, c])}>
              <CanalIcon canal={c} />+ {t(`clientes.canal.${c}`)}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

function CargarDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const t = useT();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("clientes.obj.cargar.titulo")}</DialogTitle>
          <DialogDescription>{t("clientes.obj.cargar.desc")}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <Label>{t("clientes.obj.cargar.input")}</Label>
              <ADefinir nota={t("clientes.obj.cargar.inputNota")} />
            </div>
            <Select defaultValue="archivo">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="archivo">{t("clientes.obj.cargar.archivo")}</SelectItem>
                <SelectItem value="integracion">{t("clientes.obj.cargar.integracion")}</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              <Upload className="mr-2 size-4" />
              {t("clientes.obj.cargar.soltar")}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t("clientes.obj.cargar.medios")}</Label>
            <p className="text-xs text-muted-foreground">{t("clientes.obj.cargar.mediosDesc")}</p>
            <MediosPicker />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cargar-desde">{t("clientes.obj.desde")}</Label>
              <Input id="cargar-desde" type="date" defaultValue="2026-10-06" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cargar-hasta">{t("clientes.obj.hasta")}</Label>
              <Input id="cargar-hasta" type="date" defaultValue="2026-10-10" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.acciones.cancelar")}
          </Button>
          <Button onClick={() => onOpenChange(false)}>{t("clientes.obj.cargar")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RecontactarDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const t = useT();
  const [estado, setEstado] = useState("noContactado");
  const [periodo, setPeriodo] = useState("semanaPasada");
  const [clasif, setClasif] = useState("cualquiera");
  // Conteo de ejemplo que reacciona al filtro, solo para que se entienda la idea.
  const n = 38 + (estado === "vencido" ? -21 : 0) + (periodo === "ultimos30" ? 94 : 0) + (clasif !== "cualquiera" ? -25 : 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("clientes.obj.recontactar.titulo")}</DialogTitle>
          <DialogDescription>{t("clientes.obj.recontactar.desc")}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>{t("clientes.obj.recontactar.estado")}</Label>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["noContactado", "vencido", "contactado"] as EstadoObjetivo[]).map((e) => (
                    <SelectItem key={e} value={e}>
                      {t(`clientes.estado.${e}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t("clientes.obj.recontactar.periodo")}</Label>
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semanaPasada">{t("clientes.obj.recontactar.semanaPasada")}</SelectItem>
                  <SelectItem value="ultimos30">{t("clientes.obj.recontactar.ultimos30")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>{t("clientes.obj.recontactar.clasificacion")}</Label>
            <Select value={clasif} onValueChange={setClasif}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cualquiera">{t("clientes.obj.recontactar.cualquiera")}</SelectItem>
                {clasificacionesSalida.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-lg bg-accent px-4 py-3 text-sm font-medium text-accent-foreground">
            {t("clientes.obj.recontactar.resultado", { n })}
          </div>
          <div className="flex flex-col gap-2">
            <Label>{t("clientes.obj.cargar.medios")}</Label>
            <MediosPicker />
          </div>
          <ADefinir nota={t("clientes.obj.recontactar.nota")} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.acciones.cancelar")}
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            {t("clientes.obj.recontactar.confirmar", { n })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
