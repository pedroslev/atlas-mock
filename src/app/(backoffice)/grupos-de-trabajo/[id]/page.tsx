import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { T } from "@/lib/i18n";
import { gruposTrabajo, getGrupoTrabajo, agentes } from "@/lib/mock-data";
import { GrupoMiembros } from "./grupo-miembros";
import { GrupoPermisos } from "./grupo-permisos";
import { GrupoConfigHermesTab } from "../grupo-config-hermes";

export function generateStaticParams() {
  return gruposTrabajo.map((g) => ({ id: g.id }));
}

export default async function EditarGrupoTrabajoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const grupo = getGrupoTrabajo(id);
  if (!grupo) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={grupo.nombre}
        backHref="/grupos-de-trabajo"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/grupos-de-trabajo">
                <T k="common.acciones.cancelar" />
              </Link>
            </Button>
            <Button>
              <T k="common.acciones.confirmar" />
            </Button>
          </>
        }
      />

      {/* A pedido: mismas secciones que Campañas, salvo General + Usuarios
          que van juntas acá — la info general de un grupo es liviana
          (nombre y descripción nomás, a diferencia de Campañas) así que no
          justifica solapa propia; queda al lado de sus usuarios. */}
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">
            <T k="grupos.tab.general" />
          </TabsTrigger>
          <TabsTrigger value="permisos">
            <T k="grupos.tab.permisos" />
          </TabsTrigger>
          <TabsTrigger value="config-hermes">
            <T k="grupos.tab.configHermes" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <T k="grupos.infoGeneral" />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex max-w-xl flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nombre">
                  <T k="common.comunes.nombre" />
                </Label>
                <Input id="nombre" defaultValue={grupo.nombre} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="descripcion">
                  <T k="common.comunes.descripcion" />
                </Label>
                <Textarea id="descripcion" defaultValue={grupo.descripcion} rows={3} />
              </div>
            </CardContent>
          </Card>

          <GrupoMiembros agentes={agentes} initialUsuarioIds={grupo.usuarioIds} />
        </TabsContent>

        <TabsContent value="permisos">
          <GrupoPermisos
            initialPermisos={grupo.permisos}
            initialAccesoHermes={grupo.accesoHermes}
          />
        </TabsContent>

        <TabsContent value="config-hermes">
          <GrupoConfigHermesTab
            initialEstadosAuxiliares={grupo.estadosAuxiliares}
            initialShortcutButtons={grupo.shortcutButtons}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
