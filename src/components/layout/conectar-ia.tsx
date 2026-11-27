"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BotonCopiar } from "@/app/(backoffice)/configuracion/claves-api/componentes";
import { useT } from "@/lib/i18n";

// URL MCP de la región, la misma para todos los tenants (ADR-FUNDAMENTOS-016): {region_url}/mcp/olimpo.
// El tenant se resuelve en el login, por el email, como en ui-router.
const URL_MCP = "https://atlas.mitrol.dev/mcp/olimpo";

// Un cliente de IA soportado: cómo se agrega el MCP en él. `comando` es lo que se
// copia y pega; los clientes sin terminal muestran solo los pasos.
type Cliente = { id: string; nombre: string; comando?: string; pasosKey: string };

const CLIENTES: Cliente[] = [
  {
    id: "claude-code",
    nombre: "Claude Code",
    comando: `claude mcp add --transport http atlas-olimpo ${URL_MCP}`,
    pasosKey: "common.conectarIa.pasos.claudeCode",
  },
  { id: "claude", nombre: "Claude", pasosKey: "common.conectarIa.pasos.claude" },
  { id: "chatgpt", nombre: "ChatGPT", pasosKey: "common.conectarIa.pasos.chatgpt" },
  {
    id: "codex",
    nombre: "Codex",
    comando: `codex mcp add atlas-olimpo --url ${URL_MCP}`,
    pasosKey: "common.conectarIa.pasos.codex",
  },
  {
    id: "gemini",
    nombre: "Gemini CLI",
    comando: `gemini mcp add --transport http atlas-olimpo ${URL_MCP}`,
    pasosKey: "common.conectarIa.pasos.gemini",
  },
  { id: "otro", nombre: "Otro", pasosKey: "common.conectarIa.pasos.otro" },
];

// Diálogo "Conectar con IA" del menú del avatar: muestra la URL MCP del tenant y
// cómo agregarla en cada cliente. El login lo hace el cliente de IA contra Atlas.
export function ConectarIa({
  abierto,
  onAbiertoChange,
}: {
  abierto: boolean;
  onAbiertoChange: (abierto: boolean) => void;
}) {
  const t = useT();
  return (
    <Dialog open={abierto} onOpenChange={onAbiertoChange}>
      <DialogContent className="sm:max-w-lg" data-testid="conectar-ia-dialogo">
        <DialogHeader>
          <DialogTitle>{t("common.conectarIa.titulo")}</DialogTitle>
          <DialogDescription>{t("common.conectarIa.descripcion")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">{t("common.conectarIa.url")}</span>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-md bg-muted px-3 py-2 font-mono text-sm" data-testid="conectar-ia-url">
              {URL_MCP}
            </code>
            <BotonCopiar
              valor={URL_MCP}
              etiqueta={t("common.conectarIa.copiarUrl")}
              testId="conectar-ia-copiar-url"
            />
          </div>
        </div>

        <Tabs defaultValue="claude-code">
          <TabsList>
            {CLIENTES.map((c) => (
              <TabsTrigger key={c.id} value={c.id} data-testid={`conectar-ia-tab-${c.id}`}>
                {c.nombre}
              </TabsTrigger>
            ))}
          </TabsList>
          {CLIENTES.map((c) => (
            <TabsContent key={c.id} value={c.id} className="flex flex-col gap-2 pt-2">
              <p className="text-sm text-muted-foreground">{t(c.pasosKey)}</p>
              {c.comando && (
                <div className="flex items-start gap-2">
                  <code
                    className="flex-1 break-all rounded-md bg-muted px-3 py-2 font-mono text-xs"
                    data-testid={`conectar-ia-comando-${c.id}`}
                  >
                    {c.comando}
                  </code>
                  <BotonCopiar
                    valor={c.comando}
                    etiqueta={t("common.conectarIa.copiarComando")}
                    testId={`conectar-ia-copiar-comando-${c.id}`}
                  />
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <p className="text-xs text-muted-foreground">{t("common.conectarIa.permisos")}</p>
      </DialogContent>
    </Dialog>
  );
}
