"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Flag, Play, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ADefinir, CanalIcon } from "@/components/clientes/clientes-ui";
import { cn } from "@/lib/utils";
import {
  clasificacionesSalida,
  condicionesAvance,
  estrategiasPorCampania,
  plantillasMensaje,
  type CanalContacto,
  type ModoPaso,
  type PasoEstrategia,
} from "@/lib/mock-clientes";
import { useT } from "@/lib/i18n";

const MODOS_LLAMADA: ModoPaso[] = ["predictivo", "progresivo", "preview", "power"];

function pasoNuevo(): PasoEstrategia {
  return {
    id: `paso-${Math.random().toString(36).slice(2, 8)}`,
    canal: "llamada",
    modo: "preview",
    arranque: "horasDespues",
    arranqueValor: "24",
    horarioDesde: "09:00",
    horarioHasta: "18:00",
    intentos: 1,
    minutosEntreIntentos: 60,
    formasAUsar: "principal",
    avanzaSi: ["noContesta"],
    saleSi: ["Promesa de pago"],
  };
}

export function EstrategiaSalidaTab({ campaniaId }: { campaniaId: string }) {
  const t = useT();
  const [pasos, setPasos] = useState<PasoEstrategia[]>(
    () => estrategiasPorCampania[campaniaId] ?? []
  );
  const [seleccionado, setSeleccionado] = useState<string | null>(pasos[0]?.id ?? null);
  const idx = pasos.findIndex((p) => p.id === seleccionado);
  const paso = idx >= 0 ? pasos[idx] : null;

  const actualizar = (cambios: Partial<PasoEstrategia>) =>
    setPasos((ps) => ps.map((p) => (p.id === seleccionado ? { ...p, ...cambios } : p)));
  const mover = (i: number, d: -1 | 1) =>
    setPasos((ps) => {
      const n = [...ps];
      [n[i], n[i + d]] = [n[i + d], n[i]];
      return n;
    });
  const agregar = () => {
    const nuevo = pasoNuevo();
    setPasos((ps) => [...ps, nuevo]);
    setSeleccionado(nuevo.id);
  };
  const eliminar = (id: string) => {
    setPasos((ps) => ps.filter((p) => p.id !== id));
    if (seleccionado === id) setSeleccionado(null);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <Card className="min-w-0">
        <CardHeader className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <CardTitle>{t("clientes.est.titulo")}</CardTitle>
              <CardDescription>{t("clientes.est.descripcion")}</CardDescription>
            </div>
            <Button variant="outline" className="shrink-0" onClick={agregar}>
              <Plus />
              {t("clientes.est.agregarPaso")}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <ADefinir nota={t("clientes.est.ramasNota")} />
            <ADefinir nota={t("clientes.est.arquitecturaNota")} />
          </div>
        </CardHeader>
        <CardContent>
          {pasos.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              {t("clientes.est.vacio")}
              <Button onClick={agregar}>
                <Plus />
                {t("clientes.est.agregarPaso")}
              </Button>
            </div>
          ) : (
            <ol className="flex flex-col">
              <Hito icon={<Play className="size-3.5" />} texto={t("clientes.est.inicio")} />
              {pasos.map((p, i) => (
                <li key={p.id} className="flex flex-col">
                  <Conector />
                  <PasoCard
                    paso={p}
                    numero={i + 1}
                    activo={p.id === seleccionado}
                    onSelect={() => setSeleccionado(p.id)}
                    onSubir={i > 0 ? () => mover(i, -1) : undefined}
                    onBajar={i < pasos.length - 1 ? () => mover(i, 1) : undefined}
                    onEliminar={() => eliminar(p.id)}
                  />
                  {i < pasos.length - 1 && (
                    <span className="ml-[22px] border-l-2 border-dashed border-border py-1 pl-5 text-xs text-muted-foreground">
                      {t("clientes.est.siNo", { n: i + 2 })}
                    </span>
                  )}
                </li>
              ))}
              <Conector />
              <Hito icon={<Flag className="size-3.5" />} texto={t("clientes.est.fin")} />
            </ol>
          )}
        </CardContent>
      </Card>

      <Card className="min-w-0 self-start lg:sticky lg:top-28">
        {paso ? (
          <EditorPaso
            paso={paso}
            numero={idx + 1}
            esUltimo={idx === pasos.length - 1}
            onChange={actualizar}
          />
        ) : (
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            {t("clientes.est.seleccionar")}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

function Conector() {
  return <span aria-hidden className="ml-[22px] h-4 border-l-2 border-border" />;
}

function Hito({ icon, texto }: { icon: React.ReactNode; texto: string }) {
  return (
    <li className="flex items-center gap-3 text-sm text-muted-foreground">
      <span className="flex size-[46px] shrink-0 items-center justify-center">
        <span className="flex size-7 items-center justify-center rounded-full bg-muted">{icon}</span>
      </span>
      {texto}
    </li>
  );
}

function PasoCard({
  paso,
  numero,
  activo,
  onSelect,
  onSubir,
  onBajar,
  onEliminar,
}: {
  paso: PasoEstrategia;
  numero: number;
  activo: boolean;
  onSelect: () => void;
  onSubir?: () => void;
  onBajar?: () => void;
  onEliminar: () => void;
}) {
  const t = useT();
  const resumen =
    paso.canal === "llamada"
      ? t("clientes.est.resumenLlamada", {
          modo: t(`clientes.modo.${paso.modo}`),
          intentos: paso.intentos,
          desde: paso.horarioDesde,
          hasta: paso.horarioHasta,
        })
      : t("clientes.est.resumenMensaje", {
          plantilla: paso.plantilla ?? "—",
          desde: paso.horarioDesde,
          hasta: paso.horarioHasta,
        });

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-card p-2 pr-3 transition-colors",
        activo ? "border-primary ring-2 ring-primary/20" : "hover:bg-muted/50"
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={activo}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span
          className={cn(
            "flex size-[30px] shrink-0 items-center justify-center rounded-full text-primary-foreground",
            "bg-primary"
          )}
        >
          <CanalIcon canal={paso.canal} />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="text-sm font-medium">
            {t("clientes.est.paso", { n: numero })} · {t(`clientes.canal.${paso.canal}`)}
          </span>
          <span className="truncate text-xs text-muted-foreground">{resumen}</span>
        </span>
      </button>
      <div className="flex shrink-0 items-center">
        <Button variant="ghost" size="icon" className="size-7" disabled={!onSubir} onClick={onSubir} aria-label={t("clientes.est.subir")}>
          <ArrowUp />
        </Button>
        <Button variant="ghost" size="icon" className="size-7" disabled={!onBajar} onClick={onBajar} aria-label={t("clientes.est.bajar")}>
          <ArrowDown />
        </Button>
        <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={onEliminar} aria-label={t("clientes.est.eliminar")}>
          <Trash2 />
        </Button>
      </div>
    </div>
  );
}

function EditorPaso({
  paso,
  numero,
  esUltimo,
  onChange,
}: {
  paso: PasoEstrategia;
  numero: number;
  esUltimo: boolean;
  onChange: (c: Partial<PasoEstrategia>) => void;
}) {
  const t = useT();
  const esLlamada = paso.canal === "llamada";
  const toggle = (lista: string[], v: string) =>
    lista.includes(v) ? lista.filter((x) => x !== v) : [...lista, v];

  return (
    <>
      <CardHeader>
        <CardTitle>{t("clientes.est.editando", { n: numero })}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>{t("clientes.est.canal")}</Label>
            <Select
              value={paso.canal}
              onValueChange={(v) => {
                const canal = v as CanalContacto;
                onChange(
                  canal === "llamada"
                    ? { canal, modo: "preview", plantilla: undefined }
                    : { canal, modo: "plantilla", plantilla: plantillasMensaje[0] }
                );
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["llamada", "whatsapp", "sms", "email"] as CanalContacto[]).map((c) => (
                  <SelectItem key={c} value={c}>
                    <CanalIcon canal={c} />
                    {t(`clientes.canal.${c}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {esLlamada ? (
            <div className="flex flex-col gap-1.5">
              <Label>{t("clientes.est.modo")}</Label>
              <Select value={paso.modo} onValueChange={(v) => onChange({ modo: v as ModoPaso })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODOS_LLAMADA.map((m) => (
                    <SelectItem key={m} value={m}>
                      {t(`clientes.modo.${m}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <Label>{t("clientes.est.plantilla")}</Label>
              <Select value={paso.plantilla} onValueChange={(v) => onChange({ plantilla: v })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {plantillasMensaje.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-1.5">
            <Label>{t("clientes.est.arranque")}</Label>
            <Select
              value={paso.arranque}
              onValueChange={(v) => onChange({ arranque: v as PasoEstrategia["arranque"] })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["inmediato", "horasDespues", "diaSiguiente"] as const).map((a) => (
                  <SelectItem key={a} value={a}>
                    {t(`clientes.est.arranque.${a}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {paso.arranque !== "inmediato" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="arranque-valor">
                {paso.arranque === "horasDespues" ? t("clientes.est.horas") : t("clientes.est.hora")}
              </Label>
              <Input
                id="arranque-valor"
                type={paso.arranque === "horasDespues" ? "number" : "time"}
                value={paso.arranqueValor ?? ""}
                onChange={(e) => onChange({ arranqueValor: e.target.value })}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>{t("clientes.est.horario")}</Label>
          <div className="flex items-center gap-2">
            <Input type="time" aria-label={t("clientes.obj.desde")} value={paso.horarioDesde} onChange={(e) => onChange({ horarioDesde: e.target.value })} />
            <span className="text-muted-foreground">–</span>
            <Input type="time" aria-label={t("clientes.obj.hasta")} value={paso.horarioHasta} onChange={(e) => onChange({ horarioHasta: e.target.value })} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="intentos">{t("clientes.est.intentos")}</Label>
            <Input id="intentos" type="number" min={1} value={paso.intentos} onChange={(e) => onChange({ intentos: Number(e.target.value) })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="entre">{t("clientes.est.entreIntentos")}</Label>
            <Input id="entre" type="number" min={0} disabled={paso.intentos <= 1} value={paso.minutosEntreIntentos} onChange={(e) => onChange({ minutosEntreIntentos: Number(e.target.value) })} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>{t("clientes.est.formas")}</Label>
          <Select value={paso.formasAUsar} onValueChange={(v) => onChange({ formasAUsar: v as PasoEstrategia["formasAUsar"] })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["principal", "todasEnOrden", "soloCelulares"] as const).map((f) => (
                <SelectItem key={f} value={f}>
                  {t(`clientes.est.formas.${f}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium">{t("clientes.est.avanzaSi")}</legend>
          {esUltimo ? (
            <p className="text-sm text-muted-foreground">{t("clientes.est.ultimoPaso")}</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {condicionesAvance.map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={paso.avanzaSi.includes(c)} onCheckedChange={() => onChange({ avanzaSi: toggle(paso.avanzaSi, c) })} />
                  {t(`clientes.avance.${c}`)}
                </label>
              ))}
            </div>
          )}
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium">{t("clientes.est.saleSi")}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {clasificacionesSalida.map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm">
                <Checkbox checked={paso.saleSi.includes(c)} onCheckedChange={() => onChange({ saleSi: toggle(paso.saleSi, c) })} />
                {c}
              </label>
            ))}
          </div>
        </fieldset>
      </CardContent>
    </>
  );
}
