"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ActionTooltip } from "@/components/layout/action-tooltip";
import { EntityCombobox } from "./entity-combobox";
import { useT } from "@/lib/i18n";
import {
  clasificacionGrupos,
  marcadorGrupos,
  feriados,
  listasExclusion,
  getClasificacionesDeGrupo,
  getMarcadoresDeGrupo,
  getFeriado,
  getListaExclusion,
} from "@/lib/mock-data";

type Grupo = "clasificacion" | "bookmarks" | "feriados" | "exclusion" | null;

// Campos de herencia de una campaña: cada uno es un Combobox "asignar por
// referencia" (nunca edita el contenido del grupo) más un botón "Ver" que
// abre un modal de solo lectura con lo que hay adentro. Editar el contenido
// de un grupo pasa por su propia pantalla (/clasificaciones, /marcadores,
// /feriados) — feedback de producto 2026-07-16.
export function CampaniaHerencia({
  nombreProyecto,
  initialGrupoClasificacionId,
  initialGrupoBookmarksId,
  initialFeriadosId,
  initialListaExclusionId,
}: {
  nombreProyecto?: string;
  initialGrupoClasificacionId?: string;
  initialGrupoBookmarksId?: string;
  initialFeriadosId?: string;
  initialListaExclusionId?: string;
}) {
  const t = useT();
  const [grupoClasificacionId, setGrupoClasificacionId] = useState(
    initialGrupoClasificacionId
  );
  const [grupoBookmarksId, setGrupoBookmarksId] = useState(
    initialGrupoBookmarksId
  );
  const [feriadosId, setFeriadosId] = useState(initialFeriadosId);
  const [listaExclusionId, setListaExclusionId] = useState(
    initialListaExclusionId
  );
  const [verGrupo, setVerGrupo] = useState<Grupo>(null);

  const heredaCopy = nombreProyecto
    ? t("campanias.heredaDe", { proyecto: nombreProyecto })
    : t("campanias.sinAsignar");

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="grupo-clasificacion">
            {t("campanias.grupoClasificaciones")}
          </Label>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <EntityCombobox
              id="grupo-clasificacion"
              items={clasificacionGrupos}
              value={grupoClasificacionId}
              onChange={setGrupoClasificacionId}
              placeholder={heredaCopy}
              searchPlaceholder={t("campanias.buscarGrupoClasificaciones")}
              emptyLabel={t("campanias.vacioGrupoClasificaciones")}
            />
            <ActionTooltip label={t("campanias.verClasificaciones")}>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={!grupoClasificacionId}
                onClick={() => setVerGrupo("clasificacion")}
              >
                <Eye />
              </Button>
            </ActionTooltip>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="grupo-bookmarks">{t("campanias.grupoMarcas")}</Label>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <EntityCombobox
              id="grupo-bookmarks"
              items={marcadorGrupos}
              value={grupoBookmarksId}
              onChange={setGrupoBookmarksId}
              placeholder={heredaCopy}
              searchPlaceholder={t("campanias.buscarGrupoMarcas")}
              emptyLabel={t("campanias.vacioGrupoMarcas")}
            />
            <ActionTooltip label={t("campanias.verMarcas")}>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={!grupoBookmarksId}
                onClick={() => setVerGrupo("bookmarks")}
              >
                <Eye />
              </Button>
            </ActionTooltip>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="feriados">{t("common.nav.feriados")}</Label>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <EntityCombobox
              id="feriados"
              items={feriados}
              value={feriadosId}
              onChange={setFeriadosId}
              placeholder={heredaCopy}
              searchPlaceholder={t("campanias.buscarFeriados")}
              emptyLabel={t("campanias.vacioFeriados")}
            />
            <ActionTooltip label={t("campanias.verFeriados")}>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={!feriadosId}
                onClick={() => setVerGrupo("feriados")}
              >
                <Eye />
              </Button>
            </ActionTooltip>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lista-exclusion">
            {t("campanias.listaExclusion")}
          </Label>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <EntityCombobox
              id="lista-exclusion"
              items={listasExclusion}
              value={listaExclusionId}
              onChange={setListaExclusionId}
              placeholder={t("campanias.sinAsignar")}
              searchPlaceholder={t("campanias.buscarListaExclusion")}
              emptyLabel={t("campanias.vacioListaExclusion")}
            />
            <ActionTooltip label={t("campanias.verContactos")}>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={!listaExclusionId}
                onClick={() => setVerGrupo("exclusion")}
              >
                <Eye />
              </Button>
            </ActionTooltip>
          </div>
        </div>
      </div>

      <Dialog open={verGrupo !== null} onOpenChange={(open) => !open && setVerGrupo(null)}>
        <DialogContent>
          {verGrupo === "clasificacion" && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {t("campanias.dialogo.clasificaciones", {
                    nombre:
                      clasificacionGrupos.find(
                        (g) => g.id === grupoClasificacionId
                      )?.nombre ?? "",
                  })}
                </DialogTitle>
                <DialogDescription>
                  {t("campanias.soloLecturaClasificaciones")}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                {getClasificacionesDeGrupo(grupoClasificacionId ?? "").map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{c.nombre}</span>
                    <Badge variant="outline">{c.tipo}</Badge>
                  </div>
                ))}
              </div>
            </>
          )}

          {verGrupo === "bookmarks" && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {t("campanias.dialogo.marcas", {
                    nombre:
                      marcadorGrupos.find((g) => g.id === grupoBookmarksId)
                        ?.nombre ?? "",
                  })}
                </DialogTitle>
                <DialogDescription>
                  {t("campanias.soloLecturaMarcas")}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                {getMarcadoresDeGrupo(grupoBookmarksId ?? "").map((m) => (
                  <div
                    key={m.id}
                    className="flex flex-col gap-0.5 rounded-md border px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{m.nombre}</span>
                    {m.descripcion && (
                      <span className="text-xs text-muted-foreground">
                        {m.descripcion}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {verGrupo === "feriados" && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {t("campanias.dialogo.feriados", {
                    nombre: getFeriado(feriadosId ?? "")?.nombre ?? "",
                  })}
                </DialogTitle>
                <DialogDescription>
                  {t("campanias.soloLecturaFeriados")}
                </DialogDescription>
              </DialogHeader>
              <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
                {getFeriado(feriadosId ?? "")?.holidays.map((h) => (
                  <div
                    key={h.date}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <span className="font-medium">
                      {new Date(h.date).toLocaleDateString(
                        t("campanias.localeFecha"),
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {h.description}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {verGrupo === "exclusion" && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {t("campanias.dialogo.exclusion", {
                    nombre:
                      getListaExclusion(listaExclusionId ?? "")?.nombre ?? "",
                  })}
                </DialogTitle>
                <DialogDescription>
                  {t("campanias.soloLecturaExclusion")}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                {getListaExclusion(listaExclusionId ?? "")?.contactos.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{c.contacto}</span>
                    <Badge variant="outline" className="uppercase">
                      {c.tipo}
                    </Badge>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
