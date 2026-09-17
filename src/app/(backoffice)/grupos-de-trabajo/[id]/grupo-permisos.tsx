"use client";

import { useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useT } from "@/lib/i18n";
import { modulosPermisos, type Permiso, type PermisoAccion } from "@/lib/mock-data";

const ACCIONES: PermisoAccion[] = ["lectura", "escritura", "eliminacion"];

// Los módulos llegan de mock-data en español (ese archivo no se traduce): acá
// se mapean a claves de traducción. Los nombres coinciden con secciones del
// nav, así que se reusan las claves de `common.nav.*` en vez de duplicarlas.
const MODULO_KEYS: Record<string, string> = {
  "Proyectos": "common.buscador.proyectos",
  "Campañas": "common.nav.campanias",
  "Cuentas": "common.nav.cuentas",
  "Clasificaciones": "common.nav.clasificaciones",
  "Marcas": "common.nav.marcas",
  "Feriados": "common.nav.feriados",
  "Listas de exclusión": "common.nav.listasExclusion",
  "Agentes y roles": "common.nav.usuarios",
  "Grupos de trabajo": "common.nav.gruposRoles",
  "Estados auxiliares": "common.nav.estadosAuxiliares",
};

// Árbol de checkboxes lectura/escritura/eliminación por módulo → construye el
// working_groups.permissions real (ver ADR-FUNDAMENTOS-007). Grid explícito
// para que los títulos queden perfectamente centrados sobre su columna de
// checkboxes (feedback 2026-07-16). Estado local, sin persistencia.
//
// Además de los permisos de Olimpo (por módulo), la card tiene una segunda
// sección "Hermes": un único check de acceso, porque el PAD no tiene
// permisos por sección como el backoffice — o el grupo entra, o no entra.
//
// `accesoHermes` viene controlado desde afuera (GrupoDetalleTabs) porque
// también decide si se muestra la solapa "Config. Hermes": sin acceso al
// PAD no tiene sentido configurar nada de lo que el grupo ve ahí adentro.
export function GrupoPermisos({
  initialPermisos,
  accesoHermes,
  onAccesoHermesChange,
}: {
  initialPermisos: Permiso[];
  accesoHermes: boolean;
  onAccesoHermesChange: (v: boolean) => void;
}) {
  const [permisos, setPermisos] = useState<Permiso[]>(initialPermisos);
  const extrasAntesDeQuitarLectura = useRef<Record<string, PermisoAccion[]>>(
    {}
  );
  const t = useT();

  function tieneAccion(modulo: string, accion: PermisoAccion) {
    return permisos.some(
      (p) => p.modulo === modulo && p.acciones.includes(accion)
    );
  }

  // Sin lectura no hay nada: sacar lectura saca también escritura y
  // eliminación. Tildar lectura por primera vez marca las tres; si se
  // destildó por error y se vuelve a tildar antes de Confirmar, escritura y
  // eliminación vuelven a como estaban (ATLAS-778).
  function setModulo(modulo: string, acciones: PermisoAccion[]) {
    setPermisos((current) => {
      if (acciones.length === 0) {
        return current.filter((p) => p.modulo !== modulo);
      }
      if (current.some((p) => p.modulo === modulo)) {
        return current.map((p) => (p.modulo === modulo ? { ...p, acciones } : p));
      }
      return [...current, { modulo, acciones }];
    });
  }

  function toggle(modulo: string, accion: PermisoAccion) {
    const tieneLectura = tieneAccion(modulo, "lectura");
    if (accion !== "lectura" && !tieneLectura) {
      return;
    }
    if (accion === "lectura") {
      if (tieneLectura) {
        const extras = (
          permisos.find((p) => p.modulo === modulo)?.acciones ?? []
        ).filter((a) => a !== "lectura");
        extrasAntesDeQuitarLectura.current[modulo] = extras;
        setModulo(modulo, []);
        return;
      }
      if (
        Object.prototype.hasOwnProperty.call(
          extrasAntesDeQuitarLectura.current,
          modulo
        )
      ) {
        const extras = extrasAntesDeQuitarLectura.current[modulo];
        delete extrasAntesDeQuitarLectura.current[modulo];
        setModulo(modulo, ["lectura", ...extras]);
        return;
      }
      setModulo(modulo, ["lectura", "escritura", "eliminacion"]);
      return;
    }
    const existente = permisos.find((p) => p.modulo === modulo);
    const accionesActuales = existente?.acciones ?? ["lectura"];
    const tiene = accionesActuales.includes(accion);
    const acciones = tiene
      ? accionesActuales.filter((a) => a !== accion)
      : [...accionesActuales, accion];
    setModulo(modulo, acciones);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("grupos.permisos.titulo")}</CardTitle>
        <CardDescription>{t("grupos.permisos.descripcion")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            {t("grupos.permisos.seccionOlimpo")}
          </h3>
          <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
            <div className="grid grid-cols-[1fr_repeat(3,110px)] items-center gap-x-2 border-b bg-muted/50 px-3 py-2 text-sm font-medium">
              <span>{t("grupos.permisos.modulo")}</span>
              {ACCIONES.map((accion) => (
                <span key={accion} className="text-center">
                  {t(`grupos.permiso.${accion}`)}
                </span>
              ))}
            </div>
            {modulosPermisos.map((modulo, index) => {
              const nombreModulo = t(MODULO_KEYS[modulo] ?? modulo);
              return (
                <div
                  key={modulo}
                  className={
                    "grid grid-cols-[1fr_repeat(3,110px)] items-center gap-x-2 px-3 py-2 text-sm" +
                    (index > 0 ? " border-t" : "")
                  }
                >
                  <span className="font-medium">{nombreModulo}</span>
                  {ACCIONES.map((accion) => (
                    <span key={accion} className="flex justify-center">
                      <Checkbox
                        checked={tieneAccion(modulo, accion)}
                        disabled={accion !== "lectura" && !tieneAccion(modulo, "lectura")}
                        onCheckedChange={() => toggle(modulo, accion)}
                        aria-label={t("grupos.permisos.aria", {
                          accion: t(`grupos.permiso.${accion}`),
                          modulo: nombreModulo,
                        })}
                      />
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            {t("grupos.permisos.seccionHermes")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("grupos.permisos.hermesDescripcion")}
          </p>
          <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
            <div className="grid grid-cols-[1fr_110px] items-center gap-x-2 border-b bg-muted/50 px-3 py-2 text-sm font-medium">
              <span>{t("common.apps.hermes.tagline")}</span>
              <span className="text-center">{t("grupos.permisos.hermesAcceso")}</span>
            </div>
            <div className="grid grid-cols-[1fr_110px] items-center gap-x-2 px-3 py-2 text-sm">
              <span className="font-medium">{t("grupos.permisos.seccionHermes")}</span>
              <span className="flex justify-center">
                <Checkbox
                  checked={accesoHermes}
                  onCheckedChange={() => onAccesoHermesChange(!accesoHermes)}
                  aria-label={t("grupos.permisos.hermesAria")}
                />
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
