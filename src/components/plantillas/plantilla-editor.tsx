"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bold, Braces, Italic, List, Paperclip, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ActionTooltip } from "@/components/layout/action-tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  CANALES_PLANTILLA,
  variablesPlantilla,
  type AdjuntoPlantilla,
  type CanalPlantilla,
  type OrigenVariable,
  type Plantilla,
} from "@/lib/mock-data";
import {
  datosEjemplo,
  resolverVariables,
  variablesUsadas,
} from "@/lib/plantillas";
import { useT } from "@/lib/i18n";
import {
  AdjuntosChips,
  MensajeRenderizado,
} from "@/components/plantillas/mensaje-renderizado";

// Editor de una plantilla del catálogo (alta y edición). Pantalla propia y no
// un modal porque tiene: datos, canales, mensaje con formato y variables,
// valores de respaldo, adjuntos y vista previa por canal.
//
// El mensaje se escribe UNA vez, con formato básico (**negrita**, _cursiva_,
// "- " para listas) y variables {{clave}} que se insertan desde la barra; la
// vista previa muestra cómo lo recibe el cliente en cada canal elegido.
export function PlantillaEditor({ initial }: { initial: Plantilla | null }) {
  const t = useT();
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(initial?.descripcion ?? "");
  const [activa, setActiva] = useState(initial?.activa ?? true);
  const [canales, setCanales] = useState<CanalPlantilla[]>(
    initial?.canales ?? [...CANALES_PLANTILLA]
  );
  const [asunto, setAsunto] = useState(initial?.asunto ?? "");
  const [contenido, setContenido] = useState(initial?.contenido ?? "");
  const [respaldos, setRespaldos] = useState<Record<string, string>>(
    initial?.respaldos ?? {}
  );
  const [adjuntos, setAdjuntos] = useState<AdjuntoPlantilla[]>(
    initial?.adjuntos ?? []
  );
  const [variablesOpen, setVariablesOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const usadas = useMemo(
    () => variablesUsadas(contenido, canales.includes("email") ? asunto : ""),
    [contenido, asunto, canales]
  );
  const puedeConfirmar = nombre.trim() !== "" && canales.length > 0;

  // --- Barra de formato: opera sobre la selección del textarea -------------
  function envolver(marca: string) {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b } = el;
    const seleccion = contenido.slice(a, b) || t("plantillas.editor.contenido").toLowerCase();
    const nuevo = contenido.slice(0, a) + marca + seleccion + marca + contenido.slice(b);
    setContenido(nuevo);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(a + marca.length, a + marca.length + seleccion.length);
    });
  }

  function listar() {
    const el = textareaRef.current;
    if (!el) return;
    const a = el.selectionStart;
    const inicioLinea = contenido.lastIndexOf("\n", a - 1) + 1;
    const nuevo = contenido.slice(0, inicioLinea) + "- " + contenido.slice(inicioLinea);
    setContenido(nuevo);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(a + 2, a + 2);
    });
  }

  function insertarVariable(clave: string) {
    const el = textareaRef.current;
    const marca = `{{${clave}}}`;
    const a = el?.selectionStart ?? contenido.length;
    const b = el?.selectionEnd ?? contenido.length;
    setContenido(contenido.slice(0, a) + marca + contenido.slice(b));
    setVariablesOpen(false);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(a + marca.length, a + marca.length);
    });
  }

  function toggleCanal(canal: CanalPlantilla, on: boolean) {
    setCanales((prev) =>
      on ? CANALES_PLANTILLA.filter((c) => c === canal || prev.includes(c)) : prev.filter((c) => c !== canal)
    );
  }

  function agregarArchivo() {
    // Mock: no hay subida real; se agrega un archivo de ejemplo.
    const n = adjuntos.length + 1;
    setAdjuntos((prev) => [
      ...prev,
      { id: `adj-nuevo-${n}`, nombre: `archivo-${n}.pdf`, tamano: `${120 + n * 35} KB` },
    ]);
  }

  const porOrigen = useMemo(() => {
    const grupos: Record<OrigenVariable, typeof variablesPlantilla> = {
      cliente: [],
      campania: [],
      asesor: [],
    };
    for (const v of variablesPlantilla) grupos[v.origen].push(v);
    return grupos;
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={initial ? initial.nombre : t("plantillas.editor.nueva")}
        description={t("plantillas.editor.subtitulo")}
        backHref="/plantillas"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/plantillas">{t("common.acciones.cancelar")}</Link>
            </Button>
            <Button asChild disabled={!puedeConfirmar}>
              <Link href="/plantillas" aria-disabled={!puedeConfirmar}>
                {initial ? t("common.acciones.guardar") : t("plantillas.crearPlantilla")}
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* Datos ----------------------------------------------------- */}
          <Card>
            <CardHeader>
              <CardTitle>{t("plantillas.editor.datos")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="pl-nombre">{t("common.comunes.nombre")}</Label>
                  <Input
                    id="pl-nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder={t("plantillas.editor.placeholderNombre")}
                    autoFocus={!initial}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="pl-activa">{t("plantillas.editor.activa")}</Label>
                  <div className="flex h-9 items-center gap-2">
                    <Switch id="pl-activa" checked={activa} onCheckedChange={setActiva} />
                    <span className="text-xs text-muted-foreground">
                      {t("plantillas.editor.activaAyuda")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pl-descripcion">{t("common.comunes.descripcion")}</Label>
                <Textarea
                  id="pl-descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={2}
                  placeholder={t("plantillas.editor.placeholderDescripcion")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>{t("plantillas.editor.canales")}</Label>
                <div className="flex flex-wrap items-center gap-4">
                  {CANALES_PLANTILLA.map((canal) => (
                    <label key={canal} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={canales.includes(canal)}
                        onCheckedChange={(v) => toggleCanal(canal, v === true)}
                      />
                      {t(`plantillas.canal.${canal}`)}
                    </label>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {canales.length === 0
                    ? t("plantillas.editor.sinCanales")
                    : t("plantillas.editor.canalesAyuda")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Mensaje --------------------------------------------------- */}
          <Card>
            <CardHeader>
              <CardTitle>{t("plantillas.editor.contenido")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {canales.includes("email") && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="pl-asunto">{t("plantillas.editor.asunto")}</Label>
                  <Input
                    id="pl-asunto"
                    value={asunto}
                    onChange={(e) => setAsunto(e.target.value)}
                    placeholder={t("plantillas.editor.placeholderAsunto")}
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-1">
                  <ActionTooltip label={t("plantillas.editor.negrita")}>
                    <Button type="button" variant="outline" size="icon-sm" onClick={() => envolver("**")}>
                      <Bold className="size-4" />
                    </Button>
                  </ActionTooltip>
                  <ActionTooltip label={t("plantillas.editor.cursiva")}>
                    <Button type="button" variant="outline" size="icon-sm" onClick={() => envolver("_")}>
                      <Italic className="size-4" />
                    </Button>
                  </ActionTooltip>
                  <ActionTooltip label={t("plantillas.editor.lista")}>
                    <Button type="button" variant="outline" size="icon-sm" onClick={listar}>
                      <List className="size-4" />
                    </Button>
                  </ActionTooltip>
                  <Popover open={variablesOpen} onOpenChange={setVariablesOpen}>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" size="sm" className="ml-1">
                        <Braces className="size-4" />
                        {t("plantillas.editor.insertarVariable")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-0" align="start">
                      <Command>
                        <CommandInput placeholder={t("plantillas.editor.buscarVariable")} />
                        <CommandList>
                          <CommandEmpty>{t("plantillas.editor.sinVariables")}</CommandEmpty>
                          {(Object.keys(porOrigen) as OrigenVariable[]).map((origen) => (
                            <CommandGroup key={origen} heading={t(`plantillas.origen.${origen}`)}>
                              {porOrigen[origen].map((v) => (
                                <CommandItem
                                  key={v.clave}
                                  value={`${t(`plantillas.variable.${v.clave}`)} ${v.clave}`}
                                  onSelect={() => insertarVariable(v.clave)}
                                >
                                  <span className="flex-1">{t(`plantillas.variable.${v.clave}`)}</span>
                                  <span className="text-xs text-muted-foreground">{v.ejemplo}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <Textarea
                  ref={textareaRef}
                  id="pl-contenido"
                  value={contenido}
                  onChange={(e) => setContenido(e.target.value)}
                  rows={7}
                  placeholder={t("plantillas.editor.placeholderContenido")}
                  className="font-mono text-sm"
                />
              </div>

              {/* Variables usadas + respaldo ------------------------------ */}
              <div className="flex flex-col gap-2 rounded-lg border p-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{t("plantillas.editor.variables")}</span>
                  <span className="text-xs text-muted-foreground">
                    {t("plantillas.editor.variablesAyuda")}
                  </span>
                </div>
                {usadas.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("plantillas.editor.sinVariablesUsadas")}
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {usadas.map((clave) => {
                      const def = variablesPlantilla.find((v) => v.clave === clave);
                      return (
                        <div
                          key={clave}
                          className="grid items-center gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
                        >
                          <span className="flex items-center gap-2 text-sm">
                            <Badge variant="outline" className="font-mono">
                              {`{{${clave}}}`}
                            </Badge>
                            <span>
                              {def ? t(`plantillas.variable.${clave}`) : clave}
                            </span>
                            {def && (
                              <span className="text-xs text-muted-foreground">
                                · {t(`plantillas.origen.${def.origen}`)}
                              </span>
                            )}
                          </span>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`resp-${clave}`} className="shrink-0 text-xs text-muted-foreground">
                              {t("plantillas.editor.respaldo")}
                            </Label>
                            <Input
                              id={`resp-${clave}`}
                              value={respaldos[clave] ?? ""}
                              onChange={(e) =>
                                setRespaldos((prev) => ({ ...prev, [clave]: e.target.value }))
                              }
                              placeholder={t("plantillas.editor.placeholderRespaldo")}
                              className="h-8"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Adjuntos -------------------------------------------------- */}
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>{t("plantillas.editor.adjuntos")}</CardTitle>
                <CardDescription>{t("plantillas.editor.adjuntosAyuda")}</CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={agregarArchivo}>
                <Plus />
                {t("plantillas.editor.agregarArchivo")}
              </Button>
            </CardHeader>
            <CardContent>
              {adjuntos.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("plantillas.editor.sinAdjuntos")}</p>
              ) : (
                <AdjuntosChips
                  adjuntos={adjuntos}
                  onQuitar={(id) => setAdjuntos((prev) => prev.filter((a) => a.id !== id))}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Vista previa ------------------------------------------------ */}
        <Card className="h-fit xl:sticky xl:top-4">
          <CardHeader>
            <CardTitle>{t("plantillas.editor.vistaPrevia")}</CardTitle>
            <CardDescription>{t("plantillas.editor.vistaPreviaAyuda")}</CardDescription>
          </CardHeader>
          <CardContent>
            {canales.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("plantillas.editor.sinCanales")}</p>
            ) : (
              <VistaPrevia
                canales={canales}
                asunto={asunto}
                contenido={contenido}
                respaldos={respaldos}
                adjuntos={adjuntos}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function VistaPrevia({
  canales,
  asunto,
  contenido,
  respaldos,
  adjuntos,
}: {
  canales: CanalPlantilla[];
  asunto: string;
  contenido: string;
  respaldos: Record<string, string>;
  adjuntos: AdjuntoPlantilla[];
}) {
  const t = useT();
  const texto = resolverVariables(contenido, datosEjemplo, respaldos).texto;
  const asuntoResuelto = resolverVariables(asunto, datosEjemplo, respaldos).texto;

  return (
    <Tabs defaultValue={canales[0]} className="gap-3">
      <TabsList>
        {canales.map((c) => (
          <TabsTrigger key={c} value={c}>
            {t(`plantillas.canal.${c}`)}
          </TabsTrigger>
        ))}
      </TabsList>
      {canales.map((canal) => (
        <TabsContent key={canal} value={canal}>
          {contenido.trim() === "" ? (
            <p className="text-sm text-muted-foreground">
              {t("plantillas.editor.vistaPreviaVacia")}
            </p>
          ) : canal === "chat" ? (
            <div className="flex justify-end">
              <div className="max-w-[90%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-primary-foreground">
                <MensajeRenderizado texto={texto} canal="chat" />
                {adjuntos.length > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-xs opacity-80">
                    <Paperclip className="size-3" />
                    {t("plantillas.editor.adjuntosPreview", { cantidad: adjuntos.length })}
                  </div>
                )}
              </div>
            </div>
          ) : canal === "email" ? (
            <div className="flex flex-col gap-2 rounded-lg border p-3">
              {asuntoResuelto && (
                <div className="border-b pb-2 text-sm">
                  <span className="text-muted-foreground">{t("plantillas.editor.asuntoPreview")}: </span>
                  <span className="font-medium">{asuntoResuelto}</span>
                </div>
              )}
              <MensajeRenderizado texto={texto} canal="email" />
              {adjuntos.length > 0 && (
                <div className="border-t pt-2">
                  <AdjuntosChips adjuntos={adjuntos} />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="rounded-2xl rounded-bl-sm bg-muted px-3 py-2">
                <MensajeRenderizado texto={texto} canal="sms" />
              </div>
              {adjuntos.length > 0 && (
                <p className="text-xs text-muted-foreground">{t("plantillas.editor.smsSinAdjuntos")}</p>
              )}
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
