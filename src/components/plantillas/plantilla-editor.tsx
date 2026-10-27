"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bold, Braces, Italic, List, Paperclip } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ActionTooltip } from "@/components/layout/action-tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
  marcaArchivo,
  partesChat,
  quitarArchivos,
  resolverVariables,
  variablesUsadas,
} from "@/lib/plantillas";
import { useT } from "@/lib/i18n";
import {
  AdjuntosChips,
  MensajeRenderizado,
} from "@/components/plantillas/mensaje-renderizado";

// Editor de una plantilla del catálogo (alta y edición). Pantalla propia en
// dos partes: "Datos" (nombre, descripción, estado, canales) y "Mensaje"
// (asunto, texto con formato, variables y archivos) con la vista previa al
// lado, para ver cómo queda mientras se escribe, sin scroll.
//
// El mensaje se escribe UNA vez, con formato básico (**negrita**, _cursiva_,
// "- " para listas), variables {{clave}} y archivos [[archivo:nombre]] que se
// insertan desde la barra donde está el cursor; la vista previa muestra cómo
// lo recibe el cliente en cada canal elegido. Los valores de respaldo de las
// variables son una configuración general (solapa Variables), no de cada
// plantilla.
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
  const [adjuntos, setAdjuntos] = useState<AdjuntoPlantilla[]>(
    initial?.adjuntos ?? []
  );
  const [variablesOpen, setVariablesOpen] = useState(false);
  // Una plantilla nueva arranca en Datos; una existente, en el mensaje.
  const [paso, setPaso] = useState<"datos" | "mensaje">(initial ? "mensaje" : "datos");
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

  /** Inserta `marca` donde está el cursor (o al final). */
  function insertarEnCursor(marca: string, enLineaPropia = false) {
    const el = textareaRef.current;
    const a = el?.selectionStart ?? contenido.length;
    const b = el?.selectionEnd ?? contenido.length;
    const antes = contenido.slice(0, a);
    const despues = contenido.slice(b);
    let texto = marca;
    if (enLineaPropia) {
      if (antes && !antes.endsWith("\n")) texto = "\n" + texto;
      if (!despues.startsWith("\n")) texto = texto + "\n";
    }
    setContenido(antes + texto + despues);
    const fin = a + texto.length;
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(fin, fin);
    });
  }

  function insertarVariable(clave: string) {
    insertarEnCursor(`{{${clave}}}`);
    setVariablesOpen(false);
  }

  function insertarArchivo() {
    // Mock: no hay subida real; se agrega un archivo de ejemplo y queda en el
    // texto, en su propia línea, donde está el cursor.
    const n = adjuntos.length + 1;
    const archivo = { id: `adj-nuevo-${n}`, nombre: `archivo-${n}.pdf`, tamano: `${120 + n * 35} KB` };
    setAdjuntos((prev) => [...prev, archivo]);
    insertarEnCursor(marcaArchivo(archivo.nombre), true);
  }

  function quitarArchivo(id: string) {
    const archivo = adjuntos.find((a) => a.id === id);
    if (!archivo) return;
    setAdjuntos((prev) => prev.filter((a) => a.id !== id));
    setContenido((prev) =>
      prev
        .split("\n")
        .filter((linea) => linea.trim() !== marcaArchivo(archivo.nombre))
        .join("\n")
    );
  }

  function toggleCanal(canal: CanalPlantilla, on: boolean) {
    setCanales((prev) =>
      on ? CANALES_PLANTILLA.filter((c) => c === canal || prev.includes(c)) : prev.filter((c) => c !== canal)
    );
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
    <div className="flex flex-col gap-4">
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

      <Tabs value={paso} onValueChange={(v) => setPaso(v as "datos" | "mensaje")} className="gap-4">
        <TabsList>
          <TabsTrigger value="datos">{t("plantillas.editor.datos")}</TabsTrigger>
          <TabsTrigger value="mensaje">{t("plantillas.editor.contenido")}</TabsTrigger>
        </TabsList>

        {/* Paso 1: Datos ------------------------------------------------ */}
        <TabsContent value="datos">
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
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
              <div className="flex justify-end">
                <Button type="button" variant="secondary" onClick={() => setPaso("mensaje")}>
                  {t("plantillas.editor.continuar")}
                  <ArrowRight />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paso 2: Mensaje + vista previa al lado ---------------------- */}
        <TabsContent value="mensaje">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,400px)]">
            <Card className="min-w-0">
              <CardContent className="flex flex-col gap-4 pt-6">
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
                  <Label htmlFor="pl-contenido">{t("plantillas.editor.contenido")}</Label>
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
                    <Button type="button" variant="outline" size="sm" onClick={insertarArchivo}>
                      <Paperclip className="size-4" />
                      {t("plantillas.editor.insertarArchivo")}
                    </Button>
                  </div>
                  <Textarea
                    ref={textareaRef}
                    id="pl-contenido"
                    value={contenido}
                    onChange={(e) => setContenido(e.target.value)}
                    placeholder={t("plantillas.editor.placeholderContenido")}
                    className="h-[calc(100vh-33rem)] min-h-[16rem] resize-y font-mono text-sm"
                    autoFocus={paso === "mensaje"}
                  />
                </div>

                {/* Archivos: están en el texto; acá, la lista para quitarlos */}
                {adjuntos.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <AdjuntosChips adjuntos={adjuntos} onQuitar={quitarArchivo} />
                    <span className="text-xs text-muted-foreground">
                      {t("plantillas.editor.archivosAyuda")}
                    </span>
                  </div>
                )}

                {/* Variables: una línea; el respaldo es configuración general */}
                <p className="text-xs text-muted-foreground">
                  {usadas.length === 0
                    ? t("plantillas.editor.sinVariablesUsadas")
                    : t("plantillas.editor.variablesUsadas", {
                        lista: usadas
                          .map((clave) =>
                            variablesPlantilla.some((v) => v.clave === clave)
                              ? t(`plantillas.variable.${clave}`)
                              : clave
                          )
                          .join(", "),
                      })}{" "}
                  <Link href="/plantillas" className="underline underline-offset-2">
                    {t("plantillas.editor.variablesConfig")}
                  </Link>
                </p>
              </CardContent>
            </Card>

            {/* Vista previa ------------------------------------------------ */}
            <Card className="h-fit lg:sticky lg:top-4">
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
                    adjuntos={adjuntos}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function VistaPrevia({
  canales,
  asunto,
  contenido,
  adjuntos,
}: {
  canales: CanalPlantilla[];
  asunto: string;
  contenido: string;
  adjuntos: AdjuntoPlantilla[];
}) {
  const t = useT();
  const texto = resolverVariables(contenido, datosEjemplo).texto;
  const asuntoResuelto = resolverVariables(asunto, datosEjemplo).texto;
  const partes = partesChat(texto);
  const sinArchivos = quitarArchivos(texto);

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
            // Chat: cada archivo corta el texto y va como mensaje aparte.
            <div className="flex flex-col items-end gap-1.5">
              {partes.map((parte, i) =>
                parte.tipo === "texto" ? (
                  <div
                    key={i}
                    className="max-w-[90%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-primary-foreground"
                  >
                    <MensajeRenderizado texto={parte.texto} canal="chat" />
                  </div>
                ) : (
                  <div
                    key={i}
                    className="flex max-w-[90%] items-center gap-2 rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
                  >
                    <Paperclip className="size-3.5 shrink-0 opacity-80" />
                    <span className="truncate">{parte.nombre}</span>
                    <span className="text-xs opacity-70">
                      {adjuntos.find((a) => a.nombre === parte.nombre)?.tamano}
                    </span>
                  </div>
                )
              )}
            </div>
          ) : canal === "email" ? (
            <div className="flex flex-col gap-2 rounded-lg border p-3">
              {asuntoResuelto && (
                <div className="border-b pb-2 text-sm">
                  <span className="text-muted-foreground">{t("plantillas.editor.asuntoPreview")}: </span>
                  <span className="font-medium">{asuntoResuelto}</span>
                </div>
              )}
              <MensajeRenderizado texto={sinArchivos} canal="email" />
              {adjuntos.length > 0 && (
                <div className="border-t pt-2">
                  <AdjuntosChips adjuntos={adjuntos} />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="rounded-2xl rounded-bl-sm bg-muted px-3 py-2">
                <MensajeRenderizado texto={sinArchivos} canal="sms" />
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
