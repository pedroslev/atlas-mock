"use client";

import { useState } from "react";
import {
  EyeOff,
  Info,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Shuffle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useT } from "@/lib/i18n";
import { type ModoDeSalida, type UsoDeLinea as TipoUso } from "@/lib/mock-data";
import { organizations } from "@/lib/mock-admin";
import {
  capacidadesDeRegion,
  numerosParaTenant,
  usePhoneNumbers,
  useOcupacionDeNumeros,
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
}: {
  uso?: TipoUso;
  onUsoChange: (uso: TipoUso) => void;
  defaultModoSalida?: ModoDeSalida;
  defaultLinea?: string;
  defaultLineaSalida?: string;
}) {
  const t = useT();
  const [modoSalida, setModoSalida] = useState<ModoDeSalida | undefined>(
    defaultModoSalida
  );
  const [linea, setLinea] = useState<string | undefined>(defaultLinea);
  const [lineaSalida, setLineaSalida] = useState<string | undefined>(
    defaultLineaSalida
  );

  // Compartido con Zeus (admin/telefonia) — ver mock-telefonia.ts. Elegir acá
  // un número libre NO lo asigna a este tenant: la reserva (`numbers.tenant_id`)
  // solo la toca Zeus. Lo que cambia es la ocupación, que es lo que hace que el
  // número deje de ofrecerse a los demás tenants de la región (ADR-BD-005).
  const { numeros } = usePhoneNumbers();
  const { ocupacion, ocupar } = useOcupacionDeNumeros();
  const regionId =
    organizations.find((o) => o.tenantId === TENANT_ID)?.regionId ??
    "region-ar";
  const capacidades = capacidadesDeRegion(regionId);

  const recibe = uso === "entrante" || uso === "ambas";
  const origina = uso === "saliente" || uso === "ambas";

  // Solo se ofrecen los números de este tenant en su región (asignados a él o
  // libres) que sirven para el uso elegido.
  const disponiblesPara = (paraUso: TipoUso) =>
    numerosParaTenant(numeros, ocupacion, TENANT_ID, regionId).filter(
      (n) => n.direction === paraUso || n.direction === "ambas",
    );

  // Elegir un número lo marca como ocupado por este tenant. `ocupar` es el
  // guard: si otro tenant lo tomó entre que se cargó la lista y este click, no
  // se pisa y la selección se descarta — el backend real devuelve 409 acá y el
  // usuario tiene que elegir de nuevo sobre la lista refrescada.
  function elegirNumero(numero: string, set: (v: string) => void) {
    if (!ocupar(numero, TENANT_ID)) return;
    set(numero);
  }

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
        <section className="flex flex-col gap-3">
          <Paso
            numero={origina ? 3 : 2}
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

          {origina && (modoSalida === "aleatorio" || modoSalida === "oculto") && (
            <p className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
              {t("cuentas.uso.sinNumeroElegible")}
            </p>
          )}

          {uso && (
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              {t("cuentas.uso.notaAltaNumero")}
            </p>
          )}
        </section>
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
