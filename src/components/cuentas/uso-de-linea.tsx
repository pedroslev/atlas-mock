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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  type UsoDeLinea,
} from "@/lib/mock-data";

// Configuración de la línea de una cuenta, en el orden que propone la
// propuesta "Líneas telefónicas en Cuentas": PRIMERO para qué se usa la línea,
// después qué ve el destinatario, y recién al final el número — porque lo que
// se puede elegir depende de lo que permita el proveedor de la región.
//
// Mock: las capacidades de la región y el inventario de líneas salen de
// `mock-data`. En AR el número oculto está permitido y el aleatorio no, para
// que se vea cómo queda una opción deshabilitada con su motivo.

const OPCIONES_USO: { value: UsoDeLinea; icon: typeof PhoneIncoming }[] = [
  { value: "entrante", icon: PhoneIncoming },
  { value: "saliente", icon: PhoneOutgoing },
  { value: "ambas", icon: PhoneCall },
];

export function UsoDeLinea({
  defaultUso,
  defaultModoSalida,
  defaultLinea,
  defaultLineaSalida,
}: {
  defaultUso?: UsoDeLinea;
  defaultModoSalida?: ModoDeSalida;
  defaultLinea?: string;
  defaultLineaSalida?: string;
}) {
  const t = useT();
  const [uso, setUso] = useState<UsoDeLinea | undefined>(defaultUso);
  const [modoSalida, setModoSalida] = useState<ModoDeSalida | undefined>(
    defaultModoSalida
  );
  const [linea, setLinea] = useState<string | undefined>(defaultLinea);
  const [lineaSalida, setLineaSalida] = useState<string | undefined>(
    defaultLineaSalida
  );
  const [numeroPropio, setNumeroPropio] = useState(false);

  const recibe = uso === "entrante" || uso === "ambas";
  const origina = uso === "saliente" || uso === "ambas";

  // Solo se ofrecen las líneas de la región del cliente que sirven para el uso
  // elegido y que todavía no están tomadas por otra cuenta.
  const disponiblesPara = (paraUso: UsoDeLinea, actual?: string) =>
    lineasDisponibles.filter(
      (l) =>
        l.region === capacidadesTelefonia.region &&
        l.usos.includes(paraUso) &&
        (!l.asignadaA || l.numero === actual)
    );

  const motivoAleatorio = !capacidadesTelefonia.permiteAleatorio
    ? t("cuentas.uso.sinProveedorAleatorio", {
        region: capacidadesTelefonia.region,
      })
    : !capacidadesTelefonia.tieneTarifas
      ? t("cuentas.uso.sinTarifas")
      : undefined;

  const motivoOculto = !capacidadesTelefonia.permiteOculto
    ? t("cuentas.uso.sinProveedorOculto", {
        region: capacidadesTelefonia.region,
      })
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
            {OPCIONES_USO.map(({ value, icon: Icon }) => {
              const elegido = uso === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setUso(value);
                    if (value !== "ambas" && modoSalida === "misma") {
                      setModoSalida(undefined);
                    }
                  }}
                  className={`flex flex-col items-start gap-1.5 rounded-lg p-3 text-left ring-1 transition-colors ${
                    elegido
                      ? "bg-accent/60 ring-2 ring-primary"
                      : "ring-foreground/10 hover:bg-muted/60"
                  }`}
                >
                  <Icon
                    className={`size-4 ${elegido ? "text-primary" : "text-secondary"}`}
                  />
                  <span className="text-sm font-medium">
                    {t(`cuentas.uso.${value}`)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t(`cuentas.uso.${value}Desc`)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Paso 2 — qué ve el destinatario (solo si origina llamadas) */}
        {origina && (
          <section className="flex flex-col gap-3">
            <Paso numero={2} titulo={t("cuentas.uso.paso2")} />
            <div className="grid gap-3 sm:grid-cols-2">
              {uso === "ambas" && (
                <OpcionSalida
                  id="salida-misma"
                  icon={PhoneCall}
                  label={t("cuentas.uso.salidaMisma")}
                  description={t("cuentas.uso.salidaMismaDesc")}
                  elegido={modoSalida === "misma"}
                  onSelect={() => setModoSalida("misma")}
                />
              )}
              <OpcionSalida
                id="salida-propio"
                icon={PhoneOutgoing}
                label={t("cuentas.uso.salidaPropio")}
                description={t("cuentas.uso.salidaPropioDesc")}
                elegido={modoSalida === "propio"}
                onSelect={() => setModoSalida("propio")}
              />
              <OpcionSalida
                id="salida-aleatorio"
                icon={Shuffle}
                label={t("cuentas.uso.salidaAleatorio")}
                description={t("cuentas.uso.salidaAleatorioDesc")}
                elegido={modoSalida === "aleatorio"}
                onSelect={() => setModoSalida("aleatorio")}
                motivoDeshabilitado={motivoAleatorio}
              />
              <OpcionSalida
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
              {t("cuentas.uso.validadoRegion", {
                region: capacidadesTelefonia.region,
              })}
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
              <Label htmlFor="linea-entrante">
                {t("cuentas.uso.lineaEntrante")}
              </Label>
              <Select value={linea} onValueChange={setLinea}>
                <SelectTrigger id="linea-entrante" className="w-full sm:w-80">
                  <SelectValue placeholder={t("cuentas.uso.elegirLinea")} />
                </SelectTrigger>
                <SelectContent>
                  {disponiblesPara(uso === "ambas" ? "ambas" : "entrante", defaultLinea).map(
                    (l) => (
                      <SelectItem key={l.numero} value={l.numero}>
                        {l.numero}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t("cuentas.uso.soloDisponibles", {
                  region: capacidadesTelefonia.region,
                })}
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
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setNumeroPropio((v) => !v)}
                className="w-fit text-xs text-primary underline-offset-4 hover:underline"
              >
                {t("cuentas.uso.noEncuentroNumero")}
              </button>
              {numeroPropio && (
                <div className="flex flex-col gap-1.5">
                  <Input
                    id="numero-propio"
                    placeholder="+54 11 0000-0000"
                    className="w-full sm:w-80"
                  />
                  <Badge
                    variant="outline"
                    className="w-fit text-[0.65rem] font-normal"
                  >
                    {t("cuentas.uso.numeroPropioAviso")}
                  </Badge>
                </div>
              )}
            </div>
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

function OpcionSalida({
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
