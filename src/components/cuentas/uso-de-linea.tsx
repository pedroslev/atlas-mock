"use client";

import { useState } from "react";
import {
  Check,
  ChevronsUpDown,
  EyeOff,
  Info,
  ListChecks,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Shuffle,
  Users,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import {
  type ModoDeSalida,
  type PoolAleatorio,
  type UsoDeLinea as TipoUso,
} from "@/lib/mock-data";
import { organizations } from "@/lib/mock-admin";
import {
  capacidadesDeRegion,
  numerosParaTenant,
  usePhoneNumbers,
} from "@/lib/mock-telefonia";

// Tenant único del backoffice (Olimpo es single-tenant) — mismo id que usa
// Zeus (mock-admin.ts, mock-telefonia.ts) para "Banco Sur".
const TENANT_ID = "org-banco-sur";

// Configuración de la línea de una cuenta, en el orden que propone la
// propuesta "Líneas telefónicas en Cuentas": PRIMERO para qué se usa la línea,
// después qué ve el destinatario, y recién al final el número — porque lo que
// se puede elegir depende de lo que permita el proveedor.
//
// Mock: las capacidades y el inventario de números salen de `mock-telefonia`
// (los mismos carriers y números que administra Zeus, no una copia aparte).
// El número aleatorio se deshabilita según lo que permita el proveedor de la
// región (`capacidadesDeRegion`) — hoy está habilitado para AR.
//
// `uso` es controlado desde afuera porque el detalle de cuenta lo necesita: si
// la línea solo origina llamadas, la solapa de derivación no se muestra.

const OPCIONES_USO: { value: TipoUso; icon: typeof PhoneIncoming }[] = [
  { value: "entrante", icon: PhoneIncoming },
  { value: "saliente", icon: PhoneOutgoing },
  { value: "ambas", icon: PhoneCall },
];

export function UsoDeLinea({
  uso,
  onUsoChange,
  defaultModoSalida,
  defaultLinea,
  defaultLineaSalida,
  defaultPoolAleatorio,
  defaultNumerosAleatorios,
}: {
  uso?: TipoUso;
  onUsoChange: (uso: TipoUso) => void;
  defaultModoSalida?: ModoDeSalida;
  defaultLinea?: string;
  defaultLineaSalida?: string;
  defaultPoolAleatorio?: PoolAleatorio;
  defaultNumerosAleatorios?: string[];
}) {
  const t = useT();
  const [modoSalida, setModoSalida] = useState<ModoDeSalida | undefined>(
    defaultModoSalida
  );
  const [linea, setLinea] = useState<string | undefined>(defaultLinea);
  const [lineaSalida, setLineaSalida] = useState<string | undefined>(
    defaultLineaSalida
  );
  // Con salida aleatoria: de dónde salen los números que rotan.
  const [poolAleatorio, setPoolAleatorio] = useState<PoolAleatorio>(
    defaultPoolAleatorio ?? "carrier"
  );
  const [numerosAleatorios, setNumerosAleatorios] = useState<string[]>(
    defaultNumerosAleatorios ?? []
  );

  // Compartido con Zeus (admin/telefonia) — ver mock-telefonia.ts. Elegir acá
  // un número libre lo asigna a este tenant, y Zeus lo ve reflejado sin
  // recargar (mismo store, no una copia).
  const { numeros, asignarTenant } = usePhoneNumbers();
  const regionId =
    organizations.find((o) => o.tenantId === TENANT_ID)?.regionId ??
    "region-ar";
  const capacidades = capacidadesDeRegion(regionId);

  const recibe = uso === "entrante" || uso === "ambas";
  const origina = uso === "saliente" || uso === "ambas";

  // Solo se ofrecen los números de este tenant en su región (asignados a él o
  // libres) que sirven para el uso elegido.
  const disponiblesPara = (paraUso: TipoUso) =>
    numerosParaTenant(numeros, TENANT_ID, regionId).filter(
      (n) => n.direction === paraUso || n.direction === "ambas",
    );

  // Un número recién elegido de la lista de libres queda asignado al tenant
  // en el momento en que se elige — no hay un paso de "guardar" separado acá.
  function elegirNumero(numero: string, set: (v: string) => void) {
    set(numero);
    const elegido = numeros.find((n) => n.number === numero);
    if (elegido) asignarTenant(elegido.id, TENANT_ID);
  }

  // Para rotar con números propios solo sirven los que YA están vinculados a
  // este tenant: los libres se vinculan desde Zeus, no desde acá.
  const propiosParaSalida = numeros.filter(
    (n) =>
      n.active &&
      n.regionId === regionId &&
      n.tenantId === TENANT_ID &&
      (n.direction === "saliente" || n.direction === "ambas"),
  );

  const motivoPropios =
    propiosParaSalida.length === 0
      ? t("cuentas.uso.sinNumerosPropios")
      : undefined;

  function alternarNumeroAleatorio(numero: string) {
    setNumerosAleatorios((cur) =>
      cur.includes(numero)
        ? cur.filter((n) => n !== numero)
        : [...cur, numero],
    );
  }

  // Qué pasos se muestran, para numerarlos sin huecos ni repetidos: con
  // salida aleatoria u oculta no hay número que elegir, así que ese paso
  // desaparece si la línea tampoco recibe.
  const muestraNumeros = recibe || (origina && modoSalida === "propio");
  const muestraPool = origina && modoSalida === "aleatorio";
  const pasoNumeros = origina ? 3 : 2;
  const pasoPool = muestraNumeros ? pasoNumeros + 1 : pasoNumeros;

  const motivoAleatorio = !capacidades.permiteAleatorio
    ? t("cuentas.uso.sinProveedorAleatorio")
    : !capacidades.tieneTarifas
      ? t("cuentas.uso.sinTarifas")
      : undefined;

  const motivoOculto = !capacidades.permiteOculto
    ? t("cuentas.uso.sinProveedorOculto")
    : !capacidades.tieneTarifas
      ? t("cuentas.uso.sinTarifas")
      : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("cuentas.uso.titulo")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("cuentas.uso.descripcion")}
        </p>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {/* Paso 1 — para qué se usa la línea */}
        <section className="flex flex-col gap-3">
          <Paso numero={1} titulo={t("cuentas.uso.paso1")} />
          <div className="grid gap-3 sm:grid-cols-3">
            {OPCIONES_USO.map(({ value, icon }) => (
              <Opcion
                key={value}
                id={`uso-${value}`}
                icon={icon}
                label={t(`cuentas.uso.${value}`)}
                description={t(`cuentas.uso.${value}Desc`)}
                elegido={uso === value}
                onSelect={() => {
                  onUsoChange(value);
                  // Al elegir un uso que origina llamadas, la primera opción de
                  // salida queda marcada: "el mismo número" si la línea también
                  // recibe, "número visible" si solo origina.
                  if (value === "ambas") setModoSalida("misma");
                  if (value === "saliente") setModoSalida("propio");
                }}
              />
            ))}
          </div>
        </section>

        {/* Paso 2 — qué ve el destinatario (solo si origina llamadas) */}
        {origina && (
          <section className="flex flex-col gap-3">
            <Paso numero={2} titulo={t("cuentas.uso.paso2")} />
            {/* Son tres opciones siempre (la primera cambia segun el uso), asi
                que van en tres columnas y no queda un hueco en la grilla. */}
            <div className="grid gap-3 sm:grid-cols-3">
              {uso === "ambas" ? (
                <Opcion
                  id="salida-misma"
                  icon={PhoneCall}
                  label={t("cuentas.uso.salidaMisma")}
                  description={t("cuentas.uso.salidaMismaDesc")}
                  elegido={modoSalida === "misma"}
                  onSelect={() => setModoSalida("misma")}
                />
              ) : (
                <Opcion
                  id="salida-numero"
                  icon={PhoneOutgoing}
                  label={t("cuentas.uso.salidaNumero")}
                  description={t("cuentas.uso.salidaNumeroDesc")}
                  elegido={modoSalida === "propio"}
                  onSelect={() => setModoSalida("propio")}
                />
              )}
              {/* Implementación real: el número que sale acá NO se elige al azar en
                  runtime — sale de la configuración de números por región/país que
                  ya tiene cargada Kamailio para ese proveedor. "Aleatorio" es solo
                  el nombre de la opción para el usuario; el backend resuelve un
                  número real de la región del destinatario contra esa config, no
                  un random genérico. */}
              <Opcion
                id="salida-aleatorio"
                icon={Shuffle}
                label={t("cuentas.uso.salidaAleatorio")}
                description={t("cuentas.uso.salidaAleatorioDesc")}
                elegido={modoSalida === "aleatorio"}
                onSelect={() => setModoSalida("aleatorio")}
                motivoDeshabilitado={motivoAleatorio}
              />
              <Opcion
                id="salida-oculto"
                icon={EyeOff}
                label={t("cuentas.uso.salidaOculto")}
                description={t("cuentas.uso.salidaOcultoDesc")}
                elegido={modoSalida === "oculto"}
                onSelect={() => setModoSalida("oculto")}
                motivoDeshabilitado={motivoOculto}
              />
            </div>
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              {t("cuentas.uso.validado")}
            </p>
          </section>
        )}

        {/* Paso 3 — recién acá se eligen los números */}
        {(!uso || muestraNumeros) && (
        <section className="flex flex-col gap-3">
          <Paso
            numero={pasoNumeros}
            titulo={t("cuentas.uso.paso3")}
            ayuda={!uso ? t("cuentas.uso.elegiUsoPrimero") : undefined}
          />


          {recibe && (
            <div className="flex flex-col gap-1.5">
              {/* El numero solo es "de entrada y salida" cuando la salida usa
                  ese mismo numero. Con aleatorio u oculto, el numero elegido
                  solo recibe. */}
              <Label htmlFor="linea-entrante">
                {uso === "ambas" && modoSalida === "misma"
                  ? t("cuentas.uso.lineaEntranteYSaliente")
                  : t("cuentas.uso.lineaEntrante")}
              </Label>
              <Select
                value={linea}
                onValueChange={(v) => elegirNumero(v, setLinea)}
              >
                <SelectTrigger id="linea-entrante" className="w-full sm:w-80">
                  <SelectValue placeholder={t("cuentas.uso.elegirLinea")} />
                </SelectTrigger>
                <SelectContent>
                  {disponiblesPara(uso === "ambas" ? "ambas" : "entrante").map(
                    (n) => (
                      <SelectItem key={n.id} value={n.number}>
                        {n.number}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t("cuentas.uso.soloDisponibles")}
              </p>
            </div>
          )}

          {origina && modoSalida === "propio" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="linea-saliente">
                {t("cuentas.uso.lineaSaliente")}
              </Label>
              <Select
                value={lineaSalida}
                onValueChange={(v) => elegirNumero(v, setLineaSalida)}
              >
                <SelectTrigger id="linea-saliente" className="w-full sm:w-80">
                  <SelectValue placeholder={t("cuentas.uso.elegirLinea")} />
                </SelectTrigger>
                <SelectContent>
                  {disponiblesPara("saliente").map((n) => (
                    <SelectItem key={n.id} value={n.number}>
                      {n.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}


          {uso && (
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              {t("cuentas.uso.notaAltaNumero")}
            </p>
          )}
        </section>
        )}

        {/* Con salida oculta no se elige ningún número en ninguna parte. */}
        {origina && modoSalida === "oculto" && !recibe && (
          <p className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
            {t("cuentas.uso.sinNumeroElegible")}
          </p>
        )}

        {/* Paso 4 (3 si la línea no recibe) — con qué números rota la salida
            aleatoria. Solo aparece con salida aleatoria: el resto de los modos
            ya resolvió su número arriba. */}
        {muestraPool && (
          <section className="flex flex-col gap-3">
            <Paso numero={pasoPool} titulo={t("cuentas.uso.paso4")} />
            <div className="grid gap-3 sm:grid-cols-3">
              <Opcion
                id="pool-carrier"
                icon={Shuffle}
                label={t("cuentas.uso.poolCarrier")}
                description={t("cuentas.uso.poolCarrierDesc")}
                elegido={poolAleatorio === "carrier"}
                onSelect={() => setPoolAleatorio("carrier")}
              />
              <Opcion
                id="pool-todos"
                icon={Users}
                label={t("cuentas.uso.poolTodos")}
                description={t("cuentas.uso.poolTodosDesc", {
                  n: propiosParaSalida.length,
                })}
                elegido={poolAleatorio === "todos"}
                onSelect={() => setPoolAleatorio("todos")}
                motivoDeshabilitado={motivoPropios}
              />
              <Opcion
                id="pool-algunos"
                icon={ListChecks}
                label={t("cuentas.uso.poolAlgunos")}
                description={t("cuentas.uso.poolAlgunosDesc")}
                elegido={poolAleatorio === "algunos"}
                onSelect={() => setPoolAleatorio("algunos")}
                motivoDeshabilitado={motivoPropios}
              />
            </div>

            {poolAleatorio === "algunos" && (
              <div className="flex flex-col gap-1.5">
                <Label>{t("cuentas.uso.elegirPropios")}</Label>
                <NumerosSelector
                  numeros={propiosParaSalida.map((n) => n.number)}
                  elegidos={numerosAleatorios}
                  onToggle={alternarNumeroAleatorio}
                />
              </div>
            )}
          </section>
        )}
      </CardContent>
    </Card>
  );
}

function Paso({
  numero,
  titulo,
  ayuda,
}: {
  numero: number;
  titulo: string;
  ayuda?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[0.65rem] font-semibold text-primary-foreground">
          {numero}
        </span>
        <span className="text-sm font-medium">{titulo}</span>
      </div>
      {ayuda && <p className="pl-7 text-xs text-muted-foreground">{ayuda}</p>}
    </div>
  );
}

function Opcion({
  id,
  icon: Icon,
  label,
  description,
  elegido,
  onSelect,
  motivoDeshabilitado,
}: {
  id: string;
  icon: typeof PhoneOutgoing;
  label: string;
  description: string;
  elegido: boolean;
  onSelect: () => void;
  motivoDeshabilitado?: string;
}) {
  const deshabilitado = Boolean(motivoDeshabilitado);
  return (
    <button
      id={id}
      type="button"
      disabled={deshabilitado}
      onClick={onSelect}
      className={`flex items-start gap-3 rounded-lg p-3 text-left ring-1 transition-colors ${
        deshabilitado
          ? "cursor-not-allowed opacity-60 ring-foreground/10"
          : elegido
            ? "bg-accent/60 ring-2 ring-primary"
            : "ring-foreground/10 hover:bg-muted/60"
      }`}
    >
      <span
        className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border ${
          elegido ? "border-primary" : "border-foreground/30"
        }`}
      >
        {elegido && <span className="size-2 rounded-full bg-primary" />}
      </span>
      <span className="flex flex-col gap-1">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Icon className="size-3.5 text-secondary" />
          {label}
        </span>
        <span className="text-xs text-muted-foreground">
          {motivoDeshabilitado ?? description}
        </span>
      </span>
    </button>
  );
}

// Selector de números para el pool "solo algunos": search-first, como el de
// estados auxiliares de Grupos de trabajo — un tenant puede tener decenas o
// cientos de números y una lista plana de casillas no sirve. La búsqueda
// funciona por prefijo, que es como vienen los rangos contratados.
function NumerosSelector({
  numeros,
  elegidos,
  onToggle,
}: {
  numeros: string[];
  elegidos: string[];
  onToggle: (numero: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const t = useT();

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal sm:w-80"
          >
            <span className={cn(elegidos.length === 0 && "text-muted-foreground")}>
              {elegidos.length > 0
                ? t("cuentas.uso.numerosElegidos", { n: elegidos.length })
                : t("cuentas.uso.buscarNumeroPlaceholder")}
            </span>
            <ChevronsUpDown className="size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
          <Command>
            <CommandInput placeholder={t("cuentas.uso.buscarNumero")} />
            <CommandList>
              <CommandEmpty>{t("cuentas.uso.sinResultados")}</CommandEmpty>
              <CommandGroup>
                {numeros.map((numero) => (
                  <CommandItem
                    key={numero}
                    value={numero}
                    onSelect={() => onToggle(numero)}
                  >
                    <Check
                      className={cn(
                        "size-4",
                        elegidos.includes(numero) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {numero}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {elegidos.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {elegidos.map((numero) => (
            <Badge key={numero} variant="outline" className="gap-1 font-normal">
              {numero}
              <button
                type="button"
                aria-label={t("cuentas.uso.quitarNumero", { numero })}
                onClick={() => onToggle(numero)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          {t("cuentas.uso.elegiAlMenosUno")}
        </p>
      )}
    </div>
  );
}
