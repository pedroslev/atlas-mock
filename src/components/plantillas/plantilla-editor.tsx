"use client";

// MOCK: Crear/Guardar no persiste (navega al listado); el contador, la validación y el saneo
// corren en el navegador; los archivos elegidos solo registran nombre y tamaño.
// REAL: olimpo-api valida al guardar y rechaza con el motivo (límites por canal, canales
// combinables, validación del HTML/CSS de email), guarda el HTML ya saneado y el envío vuelve a
// sanear. Los archivos se suben por el flujo de adjuntos (storage del tenant). El front solo adelanta
// los avisos para que quien edita los vea antes.

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bold,
  Braces,
  Italic,
  Link2,
  List,
  ListOrdered,
  Paperclip,
  SmilePlus,
  Strikethrough,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Categories, EmojiStyle } from "emoji-picker-react";
import { PageHeader } from "@/components/layout/page-header";
import { ActionTooltip } from "@/components/layout/action-tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useSidebar } from "@/components/ui/sidebar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  CANALES_MENSAJERIA,
  TIPOS_RENDER,
  tipoRenderDeCanal,
  type AdjuntoPlantilla,
  type CanalPlantilla,
  type FormatoCuerpo,
  type Plantilla,
  type TipoRender,
} from "@/lib/mock-data";
import {
  datosEjemplo,
  marcaArchivo,
  nombreVariable,
  partesChat,
  quitarArchivos,
  resolverVariables,
  usuarioActualId,
  variablesUsadas,
  variablesVisiblesPara,
  type OrigenVariable,
  type VariablePlantilla,
} from "@/lib/plantillas";
import { useLocale, useT } from "@/lib/i18n";
import { contarParaCanal, type ConteoCanal, MAX_SEGMENTOS_SMS } from "@/lib/limites-canal";
import { validarEmail, resumirHallazgos, type Hallazgo } from "@/lib/validar-email";
import { escaparHtml, sanearCss, sanearHtml } from "@/lib/sanear-email";
import { enlaceMarkdownValido } from "@/lib/esquemas-url";
import { cn } from "@/lib/utils";
import { useAutocompletadoVariables } from "@/components/plantillas/autocompletado-variables";
import { componerEmail } from "@/lib/componer-email";
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
// lo recibe el cliente según el tipo de canal (chat y redes, email, SMS). Si
// un dato falta, la variable queda visible tal cual: el asesor la completa.
// Se carga solo al abrir el selector: el listado completo de emojis es pesado.
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

// Categorías del selector de emojis, en el orden en que se muestran; el
// nombre visible sale del diccionario (idioma del aplicativo).
const CATEGORIAS_EMOJI = [
  Categories.SUGGESTED,
  Categories.SMILEYS_PEOPLE,
  Categories.ANIMALS_NATURE,
  Categories.FOOD_DRINK,
  Categories.TRAVEL_PLACES,
  Categories.ACTIVITIES,
  Categories.OBJECTS,
  Categories.SYMBOLS,
  Categories.FLAGS,
];

function formatoTamano(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PlantillaEditor({ initial }: { initial: Plantilla | null }) {
  const t = useT();
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(initial?.descripcion ?? "");
  const [activa, setActiva] = useState(initial?.activa ?? true);
  const [canales, setCanales] = useState<CanalPlantilla[]>(
    initial?.canales ?? [...CANALES_MENSAJERIA]
  );
  // Solo email: el cuerpo es texto plano (por defecto) o código HTML.
  const [bodyFormat, setBodyFormat] = useState<FormatoCuerpo>(initial?.bodyFormat ?? "texto");
  // Solo email con cuerpo HTML: el CSS se carga aparte, en su propia pestaña.
  const [cuerpoCss, setCuerpoCss] = useState(initial?.cuerpoCss ?? "");
  const [cuerpoTab, setCuerpoTab] = useState<"html" | "css">("html");
  const [asunto, setAsunto] = useState(initial?.asunto ?? "");
  const [contenido, setContenido] = useState(initial?.contenido ?? "");
  const [adjuntos, setAdjuntos] = useState<AdjuntoPlantilla[]>(
    initial?.adjuntos ?? []
  );
  const [variablesOpen, setVariablesOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [enlaceOpen, setEnlaceOpen] = useState(false);
  const [enlaceTexto, setEnlaceTexto] = useState("");
  const [enlaceUrl, setEnlaceUrl] = useState("");
  // Una plantilla nueva arranca en Datos; una existente, en el mensaje.
  const [paso, setPaso] = useState<"datos" | "mensaje">(initial ? "mensaje" : "datos");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Última posición del cursor en el texto. Si nunca se tocó el cuadro, lo
  // que se inserta (variable, archivo, emoji, enlace) va al final.
  const cursorRef = useRef<{ a: number; b: number } | null>(null);

  const usadas = useMemo(
    () => variablesUsadas(contenido, canales.includes("email") ? asunto : ""),
    [contenido, asunto, canales]
  );
  // Tipo de plantilla según los canales elegidos: define qué herramientas
  // tiene el mensaje (barra de formato, archivos, formato del cuerpo).
  const esEmail = canales.includes("email");
  const esSms = canales.includes("sms");
  const esMensajeria = !esEmail && !esSms;
  // Email con cuerpo HTML: el editor pasa a un modo ancho con vista previa grande
  // y se cierra la barra lateral de la app para dar lugar.
  const modoHtml = esEmail && bodyFormat === "html";
  const editandoCss = modoHtml && cuerpoTab === "css";
  const { open: sidebarAbierto, setOpen: setSidebarAbierto } = useSidebar();
  const sidebarRef = useRef({ abierto: sidebarAbierto, setAbierto: setSidebarAbierto });
  useEffect(() => {
    sidebarRef.current = { abierto: sidebarAbierto, setAbierto: setSidebarAbierto };
  });
  useEffect(() => {
    if (!modoHtml) return;
    // Se guarda el estado previo y se restaura al salir del modo (cambiar a
    // texto plano o dejar el editor); el usuario puede reabrirla a mano.
    const { abierto, setAbierto } = sidebarRef.current;
    setAbierto(false);
    return () => setAbierto(abierto);
  }, [modoHtml]);
  // Validación del HTML/CSS (solo email con cuerpo HTML).
  const hallazgos = useMemo(
    () => (modoHtml ? validarEmail(contenido, cuerpoCss) : []),
    [modoHtml, contenido, cuerpoCss]
  );
  const { errores, avisos } = resumirHallazgos(hallazgos);

  // Contador por canal: se cuenta el texto con las variables en su valor de
  // ejemplo, sin las marcas de archivo y con el Markdown crudo. Email no tiene tope.
  const { locale } = useLocale();
  const formatoNumero = useMemo(
    () => new Intl.NumberFormat(locale === "es" ? "es-AR" : locale),
    [locale]
  );
  const textoContado = useMemo(
    () => quitarArchivos(resolverVariables(contenido, datosEjemplo).texto),
    [contenido]
  );
  const limites = useMemo(
    () =>
      esEmail
        ? []
        : canales.flatMap((canal) => {
            const conteo = contarParaCanal(canal, textoContado);
            return conteo ? [{ canal, conteo }] : [];
          }),
    [esEmail, canales, textoContado]
  );
  const excedidos = limites.filter((l) => l.conteo.excedido);
  const nombresExcedidos = excedidos.map((l) => t(`plantillas.canal.${l.canal}`)).join(", ");

  // Guardar queda bloqueado por canales excedidos o por errores del HTML/CSS.
  const razonBloqueo =
    excedidos.length > 0
      ? t("plantillas.bloqueo.limites", { canales: nombresExcedidos })
      : errores > 0
        ? t("plantillas.bloqueo.errores", { n: errores })
        : null;
  const puedeConfirmar = nombre.trim() !== "" && canales.length > 0 && razonBloqueo === null;

  /** Texto de la insignia de un canal (ej. "WhatsApp 1.020 / 4.096"). */
  function textoLimite(canal: CanalPlantilla, c: ConteoCanal) {
    const n = (v: number) => formatoNumero.format(v);
    if (c.tipo === "sms") {
      const base = t(c.segmentos === 1 ? "plantillas.limites.smsUno" : "plantillas.limites.sms", {
        segmentos: c.segmentos,
        caracteres: n(c.caracteres),
        codificacion: c.codificacion,
      });
      return c.excedido
        ? base +
            t("plantillas.limites.smsMax", { max: MAX_SEGMENTOS_SMS }) +
            t("plantillas.limites.excede", { n: n(c.exceso) })
        : base;
    }
    const base = t(c.unidad === "bytes" ? "plantillas.limites.badgeBytes" : "plantillas.limites.badge", {
      canal: t(`plantillas.canal.${canal}`),
      usado: n(c.usado),
      max: n(c.max),
    });
    return c.excedido ? base + t("plantillas.limites.excede", { n: n(c.exceso) }) : base;
  }

  /** Lleva el cursor al comienzo de la línea de un hallazgo (en su pestaña). */
  function irALinea(h: Hallazgo) {
    setCuerpoTab(h.origen);
    // Se espera al render para que el cuadro ya muestre el texto de esa pestaña.
    setTimeout(() => {
      const el = textareaRef.current;
      if (!el) return;
      const fuente = h.origen === "css" ? cuerpoCss : contenido;
      const inicio = fuente.split("\n").slice(0, h.linea - 1).join("\n").length + (h.linea > 1 ? 1 : 0);
      el.focus();
      el.setSelectionRange(inicio, inicio);
      const alto = parseFloat(getComputedStyle(el).lineHeight) || 20;
      el.scrollTop = Math.max(0, (h.linea - 3) * alto);
    }, 50);
  }

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

  /** Viñeta ("- ") o número ("N. ", siguiendo la línea anterior) al inicio de la línea actual. */
  function listar(tipo: "vineta" | "numero") {
    const el = textareaRef.current;
    if (!el) return;
    const a = el.selectionStart;
    const inicioLinea = contenido.lastIndexOf("\n", a - 1) + 1;
    let marca = "- ";
    if (tipo === "numero") {
      const anterior = contenido.slice(0, inicioLinea).split("\n").at(-2) ?? "";
      const n = anterior.match(/^(\d+)\. /);
      marca = `${n ? Number(n[1]) + 1 : 1}. `;
    }
    const nuevo = contenido.slice(0, inicioLinea) + marca + contenido.slice(inicioLinea);
    setContenido(nuevo);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(a + marca.length, a + marca.length);
    });
  }

  function abrirEnlace() {
    const el = textareaRef.current;
    const seleccion = el ? contenido.slice(el.selectionStart, el.selectionEnd) : "";
    setEnlaceTexto(seleccion);
    setEnlaceUrl("");
    setEnlaceOpen(true);
  }

  // El esquema del enlace tiene que ser http, https, mailto o tel.
  const enlaceInvalido = enlaceUrl.trim() !== "" && !enlaceMarkdownValido(enlaceUrl.trim());

  function insertarEnlace() {
    if (!enlaceUrl.trim() || enlaceInvalido) return;
    insertarEnCursor(`[${enlaceTexto.trim() || enlaceUrl.trim()}](${enlaceUrl.trim()})`);
    setEnlaceOpen(false);
  }

  /** Inserta `marca` donde está el cursor (o al final). */
  function insertarEnCursor(marca: string, enLineaPropia = false) {
    const el = textareaRef.current;
    const a = cursorRef.current?.a ?? contenido.length;
    const b = cursorRef.current?.b ?? contenido.length;
    const antes = contenido.slice(0, a);
    const despues = contenido.slice(b);
    let texto = marca;
    if (enLineaPropia) {
      if (antes && !antes.endsWith("\n")) texto = "\n" + texto;
      if (!despues.startsWith("\n")) texto = texto + "\n";
    }
    setContenido(antes + texto + despues);
    const fin = a + texto.length;
    cursorRef.current = { a: fin, b: fin };
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(fin, fin);
    });
  }

  function insertarVariable(clave: string) {
    insertarEnCursor(`{{${clave}}}`);
    setVariablesOpen(false);
  }

  /** Abre el selector de archivos del sistema. */
  function insertarArchivo() {
    fileInputRef.current?.click();
  }

  /** Los archivos elegidos quedan en el texto, en su propia línea, donde está el cursor. */
  function archivosElegidos(lista: FileList | null) {
    if (!lista || lista.length === 0) return;
    const nuevos: AdjuntoPlantilla[] = [];
    for (const f of Array.from(lista)) {
      if (adjuntos.some((a) => a.nombre === f.name) || nuevos.some((a) => a.nombre === f.name)) continue;
      nuevos.push({ id: `adj-${adjuntos.length + nuevos.length + 1}-${f.name}`, nombre: f.name, tamano: formatoTamano(f.size) });
    }
    if (nuevos.length === 0) return;
    setAdjuntos((prev) => [...prev, ...nuevos]);
    insertarEnCursor(nuevos.map((a) => marcaArchivo(a.nombre)).join("\n"), true);
    if (fileInputRef.current) fileInputRef.current.value = "";
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

  // Email y SMS van solos: al marcarlos quedan como único canal (se desmarca lo demás solo, nada se deshabilita). Los canales
  // de mensajería se combinan entre sí (se mantiene el orden de la lista).
  function toggleCanal(canal: CanalPlantilla, on: boolean) {
    setCanales((prev) => {
      if (!on) return prev.filter((c) => c !== canal);
      if (canal === "email" || canal === "sms") return [canal];
      return CANALES_MENSAJERIA.filter((c) => c === canal || prev.includes(c));
    });
  }

  // Botón alternador del grupo de mensajería: tilda los ocho (y desmarca
  // Email/SMS) o, si ya están los ocho, los destilda.
  const todaMensajeria = CANALES_MENSAJERIA.every((c) => canales.includes(c));
  function toggleTodaMensajeria() {
    setCanales(todaMensajeria ? [] : [...CANALES_MENSAJERIA]);
  }

  function checkboxCanal(canal: CanalPlantilla) {
    return (
      <label key={canal} className="flex items-center gap-2 text-sm">
        <Checkbox
          data-testid={`plantilla-canal-${canal}`}
          checked={canales.includes(canal)}
          onCheckedChange={(v) => toggleCanal(canal, v === true)}
        />
        {t(`plantillas.canal.${canal}`)}
      </label>
    );
  }

  // Variables que puede usar quien arma la plantilla: los campos de la ficha
  // del cliente que su grupo de trabajo ve, más campaña y asesor.
  const porOrigen = useMemo(() => {
    const grupos: Record<OrigenVariable, VariablePlantilla[]> = {
      clienteBasicos: [],
      clienteContacto: [],
      clienteAdicional: [],
      campania: [],
      asesor: [],
    };
    for (const v of variablesVisiblesPara(usuarioActualId)) grupos[v.origen].push(v);
    return grupos;
  }, []);

  // Autocompletado al escribir el prefijo del cliente: usa las mismas variables
  // (ya filtradas por el permiso Ver) que "Insertar variable" ofrece en los
  // grupos "Cliente ·". Una instancia para el mensaje y otra para el asunto.
  const variablesCliente = useMemo(
    () => [...porOrigen.clienteBasicos, ...porOrigen.clienteContacto, ...porOrigen.clienteAdicional],
    [porOrigen]
  );
  const autoMensaje = useAutocompletadoVariables({
    setValor: setContenido,
    variables: variablesCliente,
    // Que "Insertar variable" siga insertando donde quedó el cursor.
    alElegir: (cursor) => (cursorRef.current = { a: cursor, b: cursor }),
  });
  const autoAsunto = useAutocompletadoVariables({
    setValor: setAsunto,
    variables: variablesCliente,
  });

  return (
    // min-h-0 + flex-1: el editor ocupa el alto del <main> y nunca lo desborda;
    // lo que no entra se desplaza dentro de cada recuadro.
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <PageHeader
        title={initial ? initial.nombre : t("plantillas.editor.nueva")}
        description={t("plantillas.editor.subtitulo")}
        backHref="/plantillas"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/plantillas">{t("common.acciones.cancelar")}</Link>
            </Button>
            <Button asChild disabled={!puedeConfirmar} className={cn(!puedeConfirmar && "cursor-not-allowed opacity-50")}>
              <Link
                href="/plantillas"
                aria-disabled={!puedeConfirmar}
                data-testid="plantilla-guardar"
                title={razonBloqueo ?? undefined}
                onClick={(e) => {
                  if (!puedeConfirmar) e.preventDefault();
                }}
              >
                {initial ? t("common.acciones.guardar") : t("plantillas.crearPlantilla")}
              </Link>
            </Button>
          </>
        }
      />

      {razonBloqueo && (
        <p className="flex items-center gap-1.5 text-sm text-destructive" data-testid="plantilla-guardar-razon">
          <AlertTriangle className="size-4 shrink-0" />
          {razonBloqueo}
        </p>
      )}

      <Tabs
        value={paso}
        onValueChange={(v) => setPaso(v as "datos" | "mensaje")}
        className="min-h-0 flex-1 gap-4"
      >
        <TabsList>
          <TabsTrigger value="datos">{t("plantillas.editor.datos")}</TabsTrigger>
          <TabsTrigger value="mensaje">{t("plantillas.editor.contenido")}</TabsTrigger>
        </TabsList>

        {/* Paso 1: Datos ------------------------------------------------ */}
        <TabsContent value="datos">
          <Card>
            <CardHeader>
              <CardTitle>{t("plantillas.editor.datos")}</CardTitle>
              <CardDescription>{t("plantillas.editor.datosAyuda")}</CardDescription>
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
                {/* Tres grupos: Email y SMS (solos) y mensajería (combinable). */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {t("plantillas.editor.grupoSolos")}
                  </span>
                  <div className="flex flex-wrap items-center gap-4" data-testid="plantilla-canales-solos">
                    {checkboxCanal("email")}
                    {checkboxCanal("sms")}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-muted-foreground">
                      {t("plantillas.editor.grupoMensajeria")}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={toggleTodaMensajeria}
                      data-testid="plantilla-canales-mensajeria-toggle-todos"
                    >
                      {todaMensajeria ? t("plantillas.editor.destildarTodos") : t("plantillas.editor.tildarTodos")}
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-4" data-testid="plantilla-canales-mensajeria">
                    {CANALES_MENSAJERIA.map(checkboxCanal)}
                  </div>
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
        <TabsContent value="mensaje" className="min-h-0 flex-1">
          {/* Ocupa el alto disponible: lo que no entra se desplaza dentro de
              cada recuadro, nunca la página. */}
          <div
            className={cn(
              "grid h-full gap-4",
              // En modo HTML la vista previa pasa a ~60% del ancho.
              modoHtml
                ? "lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
                : "lg:grid-cols-[minmax(0,1fr)_minmax(300px,400px)]"
            )}
          >
            <Card className="min-h-0 min-w-0">
              <CardHeader>
                <CardTitle>{t("plantillas.editor.contenido")}</CardTitle>
                <CardDescription>{t("plantillas.editor.contenidoAyuda")}</CardDescription>
              </CardHeader>
              <CardContent className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
                {esEmail && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pl-asunto">{t("plantillas.editor.asunto")}</Label>
                    <div className="relative">
                      <Input
                        id="pl-asunto"
                        data-testid="plantilla-asunto"
                        value={asunto}
                        onChange={(e) => {
                          setAsunto(e.target.value);
                          autoAsunto.evaluar(e.currentTarget);
                        }}
                        onSelect={(e) => autoAsunto.evaluar(e.currentTarget)}
                        onKeyDown={autoAsunto.onKeyDown}
                        onBlur={autoAsunto.cerrar}
                        autoComplete="off"
                        placeholder={t("plantillas.editor.placeholderAsunto")}
                      />
                      {autoAsunto.lista}
                    </div>
                  </div>
                )}

                {/* Solo email: el cuerpo es texto plano o código HTML. */}
                {esEmail && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pl-formato-cuerpo">{t("plantillas.editor.formatoCuerpo")}</Label>
                    <Select value={bodyFormat} onValueChange={(v) => setBodyFormat(v as FormatoCuerpo)}>
                      <SelectTrigger id="pl-formato-cuerpo" className="w-48" data-testid="plantilla-formato-cuerpo">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="texto" data-testid="plantilla-formato-cuerpo-texto">
                          {t("plantillas.editor.formatoTexto")}
                        </SelectItem>
                        <SelectItem value="html" data-testid="plantilla-formato-cuerpo-html">
                          {t("plantillas.editor.formatoHtml")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Sin min-h-0: el cuadro crece con el espacio libre pero nunca
                    se achica por debajo de su mínimo; el exceso lo desplaza el
                    recuadro. */}
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label htmlFor="pl-contenido">{t("plantillas.editor.texto")}</Label>
                  {modoHtml && (
                    <Tabs value={cuerpoTab} onValueChange={(v) => setCuerpoTab(v as "html" | "css")}>
                      <TabsList>
                        <TabsTrigger value="html" data-testid="plantilla-cuerpo-tab-html">
                          {t("plantillas.editor.cuerpoHtml")}
                        </TabsTrigger>
                        <TabsTrigger value="css" data-testid="plantilla-cuerpo-tab-css">
                          {t("plantillas.editor.cuerpoCss")}
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  )}
                  {/* En la pestaña CSS no hay nada que insertar: sin barra. */}
                  <div className={cn("flex flex-wrap items-center gap-1", editandoCss && "hidden")}>
                    {/* Barra de formato: solo en mensajería (SMS y email no la tienen). */}
                    {esMensajeria && (
                      <>
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
                    <ActionTooltip label={t("plantillas.editor.tachado")}>
                      <Button type="button" variant="outline" size="icon-sm" onClick={() => envolver("~~")}>
                        <Strikethrough className="size-4" />
                      </Button>
                    </ActionTooltip>
                    <ActionTooltip label={t("plantillas.editor.lista")}>
                      <Button type="button" variant="outline" size="icon-sm" onClick={() => listar("vineta")}>
                        <List className="size-4" />
                      </Button>
                    </ActionTooltip>
                    <ActionTooltip label={t("plantillas.editor.listaNumerada")}>
                      <Button type="button" variant="outline" size="icon-sm" onClick={() => listar("numero")}>
                        <ListOrdered className="size-4" />
                      </Button>
                    </ActionTooltip>
                    <Popover open={enlaceOpen} onOpenChange={setEnlaceOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          aria-label={t("plantillas.editor.enlace")}
                          title={t("plantillas.editor.enlace")}
                          onClick={abrirEnlace}
                        >
                          <Link2 className="size-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="flex w-80 flex-col gap-3" align="start">
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor="pl-enlace-texto">{t("plantillas.editor.enlaceTexto")}</Label>
                          <Input
                            id="pl-enlace-texto"
                            value={enlaceTexto}
                            onChange={(e) => setEnlaceTexto(e.target.value)}
                            placeholder={t("plantillas.editor.enlaceTextoPlaceholder")}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor="pl-enlace-url">{t("plantillas.editor.enlaceUrl")}</Label>
                          <Input
                            id="pl-enlace-url"
                            value={enlaceUrl}
                            onChange={(e) => setEnlaceUrl(e.target.value)}
                            placeholder="https://"
                            onKeyDown={(e) => e.key === "Enter" && insertarEnlace()}
                            aria-invalid={enlaceInvalido}
                          />
                          {enlaceInvalido && (
                            <p className="text-xs text-destructive" data-testid="plantilla-enlace-error">
                              {t("plantillas.editor.enlaceEsquemaInvalido")}
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{t("plantillas.editor.enlaceAyuda")}</p>
                        <Button type="button" size="sm" onClick={insertarEnlace} disabled={!enlaceUrl.trim() || enlaceInvalido}>
                          {t("plantillas.editor.insertarEnlace")}
                        </Button>
                      </PopoverContent>
                    </Popover>
                      </>
                    )}
                    <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          aria-label={t("plantillas.editor.emoji")}
                          title={t("plantillas.editor.emoji")}
                        >
                          <SmilePlus className="size-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        {/* Todos los emojis, con buscador y categorías. Mock con
                            emoji-picker-react; la librería definitiva y el idioma
                            del buscador (hoy busca en inglés) se definen con el
                            Architect. */}
                        <EmojiPicker
                          onEmojiClick={(e) => {
                            insertarEnCursor(e.emoji);
                            setEmojiOpen(false);
                          }}
                          searchPlaceholder={t("plantillas.editor.buscarEmoji")}
                          previewConfig={{ showPreview: false }}
                          skinTonesDisabled
                          emojiStyle={EmojiStyle.NATIVE}
                          categories={CATEGORIAS_EMOJI.map((c) => ({
                            category: c,
                            name: t(`plantillas.emojiCat.${c}`),
                          }))}
                          style={
                            {
                              "--epr-emoji-size": "20px",
                              "--epr-category-navigation-button-size": "22px",
                              "--epr-category-label-height": "28px",
                              fontSize: 13,
                            } as React.CSSProperties
                          }
                          width={300}
                          height={300}
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover open={variablesOpen} onOpenChange={setVariablesOpen}>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" size="sm" className="ml-1">
                          <Braces className="size-4" />
                          {t("plantillas.editor.insertarVariable")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0" align="start">
                        <Command>
                          <CommandInput placeholder={t("plantillas.editor.buscarVariable")} />
                          <CommandList>
                            <CommandEmpty>{t("plantillas.editor.sinVariables")}</CommandEmpty>
                            {(Object.keys(porOrigen) as OrigenVariable[])
                              .filter((origen) => porOrigen[origen].length > 0)
                              .map((origen) => (
                                <CommandGroup key={origen} heading={t(`plantillas.origen.${origen}`)}>
                                  {porOrigen[origen].map((v) => (
                                    <CommandItem
                                      key={v.clave}
                                      value={`${nombreVariable(v.clave, t)} ${v.clave}`}
                                      onSelect={() => insertarVariable(v.clave)}
                                    >
                                      <span className="flex-1">{nombreVariable(v.clave, t)}</span>
                                      <span className="max-w-[45%] truncate text-xs text-muted-foreground">
                                        {v.ejemplo}
                                      </span>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              ))}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {!esSms && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={insertarArchivo}
                        data-testid="plantilla-insertar-archivo"
                      >
                        <Paperclip className="size-4" />
                        {t("plantillas.editor.insertarArchivo")}
                      </Button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => archivosElegidos(e.target.files)}
                    />
                  </div>
                  <div className="relative flex flex-1 flex-col">
                    <Textarea
                      ref={textareaRef}
                      id="pl-contenido"
                      value={editandoCss ? cuerpoCss : contenido}
                      onChange={(e) => {
                        if (editandoCss) return setCuerpoCss(e.target.value);
                        setContenido(e.target.value);
                        autoMensaje.evaluar(e.currentTarget);
                      }}
                      onKeyDown={editandoCss ? undefined : autoMensaje.onKeyDown}
                      onBlur={autoMensaje.cerrar}
                      onSelect={(e) => {
                        // El cursor guardado es el del HTML (donde se insertan variables y archivos).
                        // En CSS no hay variables: sin autocompletado.
                        if (editandoCss) return;
                        autoMensaje.evaluar(e.currentTarget);
                        cursorRef.current = {
                          a: e.currentTarget.selectionStart,
                          b: e.currentTarget.selectionEnd,
                        };
                      }}
                      placeholder={
                        editandoCss
                          ? t("plantillas.editor.placeholderCss")
                          : modoHtml
                            ? t("plantillas.editor.placeholderHtml")
                            : t("plantillas.editor.placeholderContenido")
                      }
                      data-testid={editandoCss ? "plantilla-cuerpo-css" : "plantilla-contenido"}
                      className="min-h-[14rem] flex-1 resize-none font-mono text-sm"
                      autoFocus={paso === "mensaje"}
                    />
                    {!editandoCss && autoMensaje.lista}
                  </div>
                </div>

                {/* Contador por canal: uno por cada canal marcado (email no tiene tope). */}
                {limites.length > 0 && (
                  <div className="flex flex-col gap-1.5" data-testid="plantilla-limites">
                    <div className="flex flex-wrap gap-1.5">
                      {limites.map(({ canal, conteo }) => (
                        <span
                          key={canal}
                          data-testid={`plantilla-limite-${canal}`}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs",
                            conteo.excedido
                              ? "border-destructive/40 bg-destructive/10 text-destructive"
                              : "text-muted-foreground"
                          )}
                        >
                          {conteo.excedido && <AlertTriangle className="size-3 shrink-0" />}
                          {textoLimite(canal, conteo)}
                        </span>
                      ))}
                    </div>
                    {excedidos.length > 0 && (
                      <p className="text-xs text-destructive" role="alert" data-testid="plantilla-limites-aviso">
                        {t("plantillas.limites.aviso", { canales: nombresExcedidos })}
                      </p>
                    )}
                  </div>
                )}

                {/* Validación del HTML y el CSS del email. */}
                {modoHtml && (
                  <div className="flex flex-col gap-1.5 rounded-md border p-2" data-testid="plantilla-validacion-panel">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-medium">{t("plantillas.validacion.titulo")}</span>
                      <span
                        data-testid="plantilla-validacion-resumen"
                        className={cn(
                          "rounded-md px-1.5 py-0.5",
                          errores > 0
                            ? "bg-destructive/10 text-destructive"
                            : avisos > 0
                              ? "bg-warning/15 text-warning"
                              : "bg-success/15 text-success"
                        )}
                      >
                        {hallazgos.length === 0
                          ? t("plantillas.validacion.sinProblemas")
                          : t("plantillas.validacion.resumen", { errores, avisos })}
                      </span>
                      {hallazgos.length > 0 && (
                        <span className="text-muted-foreground">{t("plantillas.validacion.ayudaClick")}</span>
                      )}
                    </div>
                    {hallazgos.length > 0 && (
                      <ul className="flex max-h-32 flex-col gap-0.5 overflow-y-auto">
                        {hallazgos.map((h, i) => (
                          <li key={`${h.codigo}-${h.origen}-${h.linea}-${i}`}>
                            <button
                              type="button"
                              data-testid="plantilla-validacion-item"
                              data-nivel={h.nivel}
                              onClick={() => irALinea(h)}
                              className="flex w-full items-start gap-1.5 rounded-sm px-1 py-0.5 text-left text-xs hover:bg-muted"
                            >
                              <AlertTriangle
                                className={cn(
                                  "mt-0.5 size-3 shrink-0",
                                  h.nivel === "error" ? "text-destructive" : "text-warning"
                                )}
                              />
                              <span className="flex-1">{t(`plantillas.val.${h.codigo}`, h.datos ?? {})}</span>
                              <span className="shrink-0 text-muted-foreground">
                                {h.origen.toUpperCase()} · {t("plantillas.validacion.linea", { n: h.linea })}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Archivos: están en el texto; acá, la lista para quitarlos */}
                {adjuntos.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <AdjuntosChips adjuntos={adjuntos} onQuitar={quitarArchivo} />
                    <span className="text-xs text-muted-foreground">
                      {t("plantillas.editor.archivosAyuda")}
                    </span>
                  </div>
                )}

                {/* Variables: una línea; sin dato, quedan visibles para el asesor */}
                <p className="text-xs text-muted-foreground">
                  {usadas.length === 0
                    ? t("plantillas.editor.sinVariablesUsadas")
                    : t("plantillas.editor.variablesUsadas", {
                        lista: usadas.map((clave) => nombreVariable(clave, t)).join(", "),
                      })}{" "}
                  {t("plantillas.editor.variablesConfig")}
                </p>
              </CardContent>
            </Card>

            {/* Vista previa: misma altura que el cuadro del mensaje (grid) ---- */}
            <Card className="min-h-0 min-w-0">
              <CardHeader>
                <CardTitle>{t("plantillas.editor.vistaPrevia")}</CardTitle>
                <CardDescription>{t("plantillas.editor.vistaPreviaAyuda")}</CardDescription>
              </CardHeader>
              <CardContent className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                {canales.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("plantillas.editor.sinCanales")}</p>
                ) : (
                  <VistaPrevia
                    canales={canales}
                    asunto={asunto}
                    contenido={contenido}
                    adjuntos={adjuntos}
                    bodyFormat={bodyFormat}
                    cuerpoCss={cuerpoCss}
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
  bodyFormat,
  cuerpoCss,
}: {
  canales: CanalPlantilla[];
  asunto: string;
  contenido: string;
  adjuntos: AdjuntoPlantilla[];
  bodyFormat: FormatoCuerpo;
  cuerpoCss: string;
}) {
  // Ancho del iframe del email HTML: escritorio (600px) o móvil (375px), para ver el responsive.
  const [ancho, setAncho] = useState<"escritorio" | "movil">("escritorio");
  const t = useT();
  const texto = resolverVariables(contenido, datosEjemplo).texto;
  const asuntoResuelto = resolverVariables(asunto, datosEjemplo).texto;
  const partes = partesChat(texto);
  const sinArchivos = quitarArchivos(texto);
  // Email HTML: los datos se escapan al reemplazar las variables (un dato no
  // puede inyectar marcado) y HTML y CSS se sanean SIEMPRE antes de mostrarse.
  const documentoEmail = componerEmail(
    sanearHtml(quitarArchivos(resolverVariables(contenido, datosEjemplo, { transformar: escaparHtml }).texto)),
    sanearCss(cuerpoCss)
  );
  // Una solapa por tipo de render presente: chat y redes, email, SMS.
  const tipos: TipoRender[] = TIPOS_RENDER.filter((tipo) =>
    canales.some((c) => tipoRenderDeCanal(c) === tipo)
  );

  return (
    <Tabs key={tipos.join(",")} defaultValue={tipos[0]} className="min-h-0 flex-1 gap-3">
      <TabsList>
        {tipos.map((tipo) => (
          <TabsTrigger key={tipo} value={tipo}>
            {t(`plantillas.render.${tipo}`)}
          </TabsTrigger>
        ))}
      </TabsList>
      {tipos.map((canal) => (
        <TabsContent key={canal} value={canal} className="min-h-0 flex-1">
          {contenido.trim() === "" ? (
            <p className="text-sm text-muted-foreground">
              {t("plantillas.editor.vistaPreviaVacia")}
            </p>
          ) : canal === "chat" || canal === "plano" ? (
            // Chat y redes: cada archivo corta el texto y va como mensaje
            // aparte. En redes (plano) el texto sale sin formato.
            <div className="flex flex-col items-end gap-1.5">
              {canal === "plano" && (
                <p className="self-stretch text-xs text-muted-foreground">
                  {t("plantillas.editor.planoAyuda")}
                </p>
              )}
              {partes.map((parte, i) =>
                parte.tipo === "texto" ? (
                  <div
                    key={i}
                    className="max-w-[90%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-primary-foreground"
                  >
                    <MensajeRenderizado texto={parte.texto} canal={canal} />
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
            <div className="flex h-full flex-col gap-2 rounded-lg border p-3">
              {asuntoResuelto && (
                <div className="border-b pb-2 text-sm">
                  <span className="text-muted-foreground">{t("plantillas.editor.asuntoPreview")}: </span>
                  <span className="font-medium">{asuntoResuelto}</span>
                </div>
              )}
              {bodyFormat === "html" ? (
                // HTML del email: va en un iframe con sandbox vacío (sin
                // scripts, sin formularios, sin navegación), así que el código
                // del cuadro nunca se ejecuta en esta página.
                <>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="xs"
                      variant={ancho === "escritorio" ? "secondary" : "outline"}
                      onClick={() => setAncho("escritorio")}
                      data-testid="plantilla-preview-ancho-escritorio"
                    >
                      {t("plantillas.editor.anchoEscritorio")}
                    </Button>
                    <Button
                      type="button"
                      size="xs"
                      variant={ancho === "movil" ? "secondary" : "outline"}
                      onClick={() => setAncho("movil")}
                      data-testid="plantilla-preview-ancho-movil"
                    >
                      {t("plantillas.editor.anchoMovil")}
                    </Button>
                  </div>
                  {/* Fondo gris de "escritorio"; el iframe toma el ancho real, así
                      las @media del correo responden al alternador. */}
                  <div className="flex min-h-80 flex-1 justify-center rounded-md bg-muted p-2">
                    <iframe
                      title={t("plantillas.render.email")}
                      sandbox=""
                      srcDoc={documentoEmail}
                      style={{ width: ancho === "movil" ? 375 : 600 }}
                      className="h-full max-w-full rounded-sm border-0 bg-white"
                      data-testid="plantilla-preview-email-html"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{t("plantillas.editor.htmlPreviewAyuda")}</p>
                </>
              ) : (
                // Texto plano: se muestra tal cual, sin interpretar formato.
                <div className="whitespace-pre-wrap text-sm leading-relaxed" data-testid="plantilla-preview-email-texto">
                  {sinArchivos}
                </div>
              )}
              {adjuntos.length > 0 && (
                <div className="flex flex-col gap-2 border-t pt-2">
                  <AdjuntosChips adjuntos={adjuntos} />
                  <p className="flex items-start gap-1.5 text-xs text-warning">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                    {t("plantillas.editor.emailArchivosGrandes")}
                  </p>
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
