import Link from "next/link";
import { notFound } from "next/navigation";
import { BotonConfirmar, CamposUnicos, CampoUnico } from "@/components/layout/campos-unicos";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listasExclusion, usosListaExclusion } from "@/lib/mock-data";
import { T } from "@/lib/i18n";
import { ContactosExcluidos } from "./contactos-excluidos";

export function generateStaticParams() {
  return listasExclusion.map((l) => ({ id: l.id }));
}

// Detalle de una lista de exclusión (ATLAS-1444): sin tipo; nombre y
// descripción editables; "Dónde se usa"; contactos con canal y sentido.
export default async function EditarListaExclusionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lista = listasExclusion.find((l) => l.id === id);
  if (!lista) notFound();
  const usos = usosListaExclusion(id);
  const sinUsos = usos.proyectos.length === 0 && usos.campanias.length === 0;

  return (
    <CamposUnicos>
    <div className="flex flex-col gap-6">
      <PageHeader
        title={lista.nombre}
        backHref="/listas-de-exclusion"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/listas-de-exclusion">
                <T k="common.acciones.cancelar" />
              </Link>
            </Button>
            <BotonConfirmar href="/listas-de-exclusion">
              <T k="common.acciones.confirmar" />
            </BotonConfirmar>
          </>
        }
      />

      {/* Cards lado a lado a ancho completo, no apiladas (feedback 2026-07-16). */}
      <div className="grid gap-6 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>
                <T k="listas.datos" />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nombre">
                  <T k="common.comunes.nombre" />
                </Label>
                <CampoUnico
                  id="nombre"
                  existentes={listasExclusion.filter((l) => l.id !== id).map((l) => l.nombre)}
                  defaultValue={lista.nombre}
                  obligatorio
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="descripcion">
                  <T k="common.comunes.descripcion" />
                </Label>
                <Textarea id="descripcion" rows={3} defaultValue={lista.descripcion} />
              </div>
            </CardContent>
          </Card>

          <Card className="h-fit">
            <CardHeader>
              <CardTitle>
                <T k="listas.usos.titulo" />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm">
              {sinUsos ? (
                <p className="text-muted-foreground">
                  <T k="listas.usos.vacio" />
                </p>
              ) : (
                <>
                  {usos.proyectos.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium text-muted-foreground">
                        <T k="listas.usos.proyectos" />
                      </span>
                      {usos.proyectos.map((p) => (
                        <Link key={p.id} href={`/proyectos/${p.id}`} className="hover:underline">
                          {p.nombre}
                        </Link>
                      ))}
                    </div>
                  )}
                  {usos.campanias.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium text-muted-foreground">
                        <T k="listas.usos.campanias" />
                      </span>
                      {usos.campanias.map(({ campania, heredada }) => (
                        <div key={campania.id} className="flex flex-wrap items-center gap-2">
                          <Link href={`/campanias/${campania.id}`} className="hover:underline">
                            {campania.nombre}
                          </Link>
                          {heredada && (
                            <Badge variant="neutral">
                              <T k="listas.usos.heredada" />
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>
              <T k="listas.contactos.titulo" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ContactosExcluidos
              initialContactos={lista.contactos}
              listaId={lista.id}
              listaNombre={lista.nombre}
            />
          </CardContent>
        </Card>
      </div>
    </div>
    </CamposUnicos>
  );
}
