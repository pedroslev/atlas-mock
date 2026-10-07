"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useT } from "@/lib/i18n";
import {
  modulosPermisos,
  type Permiso,
  type PermisoAccion,
  type PermisoClaveApi,
} from "@/lib/mock-data";

const ACCIONES: PermisoAccion[] = ["lectura", "escritura", "eliminacion"];

// Los módulos llegan de mock-data en español (ese archivo no se traduce): acá
// se mapean a claves de traducción. Los nombres coinciden con secciones del
// nav, así que se reusan las claves de `common.nav.*` en vez de duplicarlas.
const MODULO_KEYS: Record<string, string> = {
  "Proyectos": "common.nav.proyectos",
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
//
// La tercera sección, "Claves de acceso API", tiene sus propios cuatro
// permisos (ver, crear, editar, revocar) con la misma regla que la matriz de
// Olimpo: sin "ver" no hay ningún otro.
export function GrupoPermisos({
  initialPermisos,
  accesoHermes,
  onAccesoHermesChange,
  initialPermisosClavesApi,
}: {
  initialPermisos: Permiso[];
  accesoHermes: boolean;
  onAccesoHermesChange: (v: boolean) => void;
  initialPermisosClavesApi: PermisoClaveApi[];
}) {
  const [permisos, setPermisos] = useState<Permiso[]>(initialPermisos);
  const [permisosClavesApi, setPermisosClavesApi] = useState<PermisoClaveApi[]>(
    initialPermisosClavesApi
  );
  const t = useT();

  function tieneAccion(modulo: string, accion: PermisoAccion) {
    return permisos.some(
      (p) => p.modulo === modulo && p.acciones.includes(accion)
    );
  }

  // Sin lectura no hay nada (objetivo semanal 2026-09-14, sección 5): sacar
  // lectura saca también escritura y eliminación del módulo. Al revés, tildar
  // escritura o eliminación sin lectura la agrega sola — la matriz nunca deja
  // guardar una combinación que no cumpla la regla.
  function toggle(modulo: string, accion: PermisoAccion) {
    setPermisos((current) => {
      const existente = current.find((p) => p.modulo === modulo);
      const actuales = existente?.acciones ?? [];
      const tiene = actuales.includes(accion);

      let acciones: PermisoAccion[];
      if (accion === "lectura" && tiene) {
        acciones = [];
      } else if (tiene) {
        acciones = actuales.filter((a) => a !== accion);
      } else if (accion === "lectura") {
        acciones = [...actuales, accion];
      } else {
        acciones = actuales.includes("lectura")
          ? [...actuales, accion]
          : [...actuales, "lectura", accion];
      }

      if (acciones.length === 0) {
        return current.filter((p) => p.modulo !== modulo);
      }
      if (!existente) {
        return [...current, { modulo, acciones }];
      }
      return current.map((p) => (p.modulo === modulo ? { ...p, acciones } : p));
    });
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

        <PermisoUnico
          titulo={t("grupos.permisos.seccionHermes")}
          descripcion={t("grupos.permisos.hermesDescripcion")}
          encabezado={t("common.apps.hermes.tagline")}
          columna={t("grupos.permisos.hermesAcceso")}
          fila={t("grupos.permisos.seccionHermes")}
          aria={t("grupos.permisos.hermesAria")}
          checked={accesoHermes}
          onChange={onAccesoHermesChange}
        />

        <PermisosClavesApi
          permisos={permisosClavesApi}
          onChange={setPermisosClavesApi}
        />
      </CardContent>
    </Card>
  );
}

// Sección de un solo permiso sí/no (acceso a Hermes):
// título, explicación y una tabla de una fila con un check, con el mismo
// aspecto que la matriz de Olimpo para que la card se lea como un todo.
function PermisoUnico({
  titulo,
  descripcion,
  encabezado,
  columna,
  fila,
  aria,
  checked,
  onChange,
}: {
  titulo: string;
  descripcion: string;
  encabezado: string;
  columna: string;
  fila: string;
  aria: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-foreground">{titulo}</h3>
      <p className="text-sm text-muted-foreground">{descripcion}</p>
      <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
        <div className="grid grid-cols-[1fr_110px] items-center gap-x-2 border-b bg-muted/50 px-3 py-2 text-sm font-medium">
          <span>{encabezado}</span>
          <span className="text-center">{columna}</span>
        </div>
        <div className="grid grid-cols-[1fr_110px] items-center gap-x-2 px-3 py-2 text-sm">
          <span className="font-medium">{fila}</span>
          <span className="flex justify-center">
            <Checkbox
              checked={checked}
              onCheckedChange={() => onChange(!checked)}
              aria-label={aria}
            />
          </span>
        </div>
      </div>
    </div>
  );
}

const ACCIONES_CLAVES: PermisoClaveApi[] = ["ver", "crear", "editar", "revocar"];

// Permisos sobre las claves de acceso API: una fila con cuatro checks. Misma
// regla que la matriz de Olimpo: sacar "ver" saca todo, y tildar crear, editar
// o revocar sin "ver" lo agrega solo — nunca queda una combinación inválida.
function PermisosClavesApi({
  permisos,
  onChange,
}: {
  permisos: PermisoClaveApi[];
  onChange: (permisos: PermisoClaveApi[]) => void;
}) {
  const t = useT();
  const fila = t("grupos.permisos.seccionClavesApi");

  function toggle(accion: PermisoClaveApi) {
    const tiene = permisos.includes(accion);
    if (accion === "ver" && tiene) return onChange([]);
    if (tiene) return onChange(permisos.filter((p) => p !== accion));
    const con = new Set<PermisoClaveApi>([...permisos, accion, "ver"]);
    // Orden fijo de las columnas, no el orden en que se tildaron.
    onChange(ACCIONES_CLAVES.filter((a) => con.has(a)));
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-foreground">{fila}</h3>
      <p className="text-sm text-muted-foreground">
        {t("grupos.permisos.clavesApiDescripcion")}
      </p>
      <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
        <div className="grid grid-cols-[1fr_repeat(4,110px)] items-center gap-x-2 border-b bg-muted/50 px-3 py-2 text-sm font-medium">
          <span>{t("grupos.permisos.clavesApiEncabezado")}</span>
          {ACCIONES_CLAVES.map((accion) => (
            <span key={accion} className="text-center">
              {t(`grupos.permisos.clavesApi.${accion}`)}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-[1fr_repeat(4,110px)] items-center gap-x-2 px-3 py-2 text-sm">
          <span className="font-medium">{fila}</span>
          {ACCIONES_CLAVES.map((accion) => (
            <span key={accion} className="flex justify-center">
              <Checkbox
                checked={permisos.includes(accion)}
                onCheckedChange={() => toggle(accion)}
                aria-label={t("grupos.permisos.aria", {
                  accion: t(`grupos.permisos.clavesApi.${accion}`),
                  modulo: fila,
                })}
                data-testid={`permiso-claves-api-${accion}`}
              />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
