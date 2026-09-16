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
import {
  capacidadesTelefonia,
  lineasDisponibles,
  type ModoDeSalida,
  type UsoDeLinea as TipoUso,
} from "@/lib/mock-data";

// Configuración de la línea de una cuenta, en el orden que propone la
// propuesta "Líneas telefónicas en Cuentas": PRIMERO para qué se usa la línea,
// después qué ve el destinatario, y recién al final el número — porque lo que
// se puede elegir depende de lo que permita el proveedor.
//
// Mock: las capacidades y el inventario de líneas salen de `mock-data`. El
// número aleatorio está deshabilitado a propósito, para que se vea cómo queda
// una opción que el proveedor no permite.
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

  const recibe = uso === "entrante" || uso === "ambas";
  const origina = uso === "saliente" || uso === "ambas";

  // Solo se ofrecen las líneas que sirven para el uso elegido y que todavía no
  // están tomadas por otra cuenta.
  const disponiblesPara = (paraUso: TipoUso, actual?: string) =>
    lineasDisponibles.filter(
      (l) =>
        l.usos.includes(paraUso) && (!l.asignadaA || l.numero === actual)
    );

  const motivoAleatorio = !capacidadesTelefonia.permiteAleatorio
    ? t("cuentas.uso.sinProveedorAleatorio")
    : !capacidadesTelefonia.tieneTarifas
      ? t("cuentas.uso.sinTarifas")
      : undefined;

  const motivoOculto = !capacidadesTelefonia.permiteOculto
    ? t("cuentas.uso.sinProveedorOculto")
    : !capacidadesTelefonia.tieneTarifas
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
              <Select value={linea} onValueChange={setLinea}>
                <SelectTrigger id="linea-entrante" className="w-full sm:w-80">
                  <SelectValue placeholder={t("cuentas.uso.elegirLinea")} />
                </SelectTrigger>
                <SelectContent>
                  {disponiblesPara(
                    uso === "ambas" ? "ambas" : "entrante",
                    defaultLinea
                  ).map((l) => (
                    <SelectItem key={l.numero} value={l.numero}>
                      {l.numero}
                    </SelectItem>
                  ))}
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
              <Select value={lineaSalida} onValueChange={setLineaSalida}>
                <SelectTrigger id="linea-saliente" className="w-full sm:w-80">
                  <SelectValue placeholder={t("cuentas.uso.elegirLinea")} />
                </SelectTrigger>
                <SelectContent>
                  {disponiblesPara("saliente", defaultLineaSalida).map((l) => (
                    <SelectItem key={l.numero} value={l.numero}>
                      {l.numero}
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
