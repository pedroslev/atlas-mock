"use client";

import { useState } from "react";
import { Building2, LayoutDashboard, Settings, Users2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ACCENTS,
  CRM_MOCK,
  TICKETS_MOCK,
  type SistemaExternoConfig,
} from "@/lib/pad-mock/sistema-externo-data";

const NAV_GENERICA = [
  { label: "Inicio", icon: LayoutDashboard },
  { label: "Clientes", icon: Users2 },
  { label: "Cuentas", icon: Building2 },
  { label: "Configuración", icon: Settings },
];

function TopBar({ config }: { config: SistemaExternoConfig }) {
  const accent = ACCENTS[config.accent];
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-900">
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-bold",
          accent.badge
        )}
      >
        {config.vendor[0]}
      </span>
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {config.vendor}
        </span>
        <span className="truncate text-[0.65rem] text-neutral-500 dark:text-neutral-400">{config.tagline}</span>
      </div>
      <nav className="ml-6 hidden items-center gap-4 text-xs font-medium text-neutral-500 sm:flex dark:text-neutral-400">
        {NAV_GENERICA.map((n) => (
          <span key={n.label} className="flex items-center gap-1.5">
            <n.icon className="size-3.5" />
            {n.label}
          </span>
        ))}
      </nav>
      <span className="ml-auto shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-[0.65rem] text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
        soporte@{config.vendor.toLowerCase().replace(/\s+/g, "")}.io
      </span>
    </header>
  );
}

function NoticeBanner() {
  return (
    <div className="shrink-0 border-b border-dashed border-neutral-300 bg-neutral-50 px-4 py-1.5 text-center text-[0.7rem] text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-500">
      Vista simulada de un sistema externo — no es parte de Hermes/Atlas. Se abre embebida (&quot;frame&quot;) o en
      pestaña aparte (&quot;blank&quot;) según cómo se configuró el acceso.
    </div>
  );
}

function CrmBody({ accent }: { accent: (typeof ACCENTS)[keyof typeof ACCENTS] }) {
  const [tab, setTab] = useState<"datos" | "oportunidades" | "casos">("datos");
  const c = CRM_MOCK;
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 overflow-y-auto p-5">
      <div className={cn("rounded-lg border border-neutral-200 p-4 ring-1 dark:border-neutral-800", accent.ring)}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{c.cliente.nombre}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {c.cliente.id} · {c.cliente.plan} · Cliente desde {c.cliente.clienteDesde}
            </p>
          </div>
          <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[0.7rem] font-medium", accent.chip)}>
            Cuenta activa
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-neutral-600 dark:text-neutral-400">
          <span>{c.cliente.telefono}</span>
          <span className="text-right">{c.cliente.mail}</span>
        </div>
      </div>

      <div className="flex gap-1 border-b border-neutral-200 dark:border-neutral-800">
        {(["datos", "oportunidades", "casos"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-xs font-medium capitalize transition-colors",
              tab === t
                ? cn("border-current", accent.text)
                : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "datos" && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <dt className="text-neutral-500 dark:text-neutral-400">Plan contratado</dt>
          <dd className="text-right text-neutral-800 dark:text-neutral-200">{c.cliente.plan}</dd>
          <dt className="text-neutral-500 dark:text-neutral-400">Cliente desde</dt>
          <dd className="text-right text-neutral-800 dark:text-neutral-200">{c.cliente.clienteDesde}</dd>
        </dl>
      )}
      {tab === "oportunidades" && (
        <div className="flex flex-col gap-2">
          {c.oportunidades.map((o) => (
            <div
              key={o.nombre}
              className="flex items-center justify-between gap-2 rounded-md border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-800"
            >
              <span className="text-neutral-800 dark:text-neutral-200">{o.nombre}</span>
              <span className="shrink-0 text-neutral-500 dark:text-neutral-400">{o.etapa}</span>
              <span className="shrink-0 font-medium text-neutral-900 dark:text-neutral-100">{o.valor}</span>
            </div>
          ))}
        </div>
      )}
      {tab === "casos" && (
        <div className="flex flex-col gap-2">
          {c.casos.map((cs) => (
            <div
              key={cs.id}
              className="flex items-center justify-between gap-2 rounded-md border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-800"
            >
              <span className="font-mono text-neutral-500 dark:text-neutral-400">{cs.id}</span>
              <span className="flex-1 text-neutral-800 dark:text-neutral-200">{cs.asunto}</span>
              <span className="shrink-0 text-neutral-500 dark:text-neutral-400">{cs.estado}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TicketsBody({ accent }: { accent: (typeof ACCENTS)[keyof typeof ACCENTS] }) {
  const [seleccionado, setSeleccionado] = useState(TICKETS_MOCK[0].id);
  const ticket = TICKETS_MOCK.find((t) => t.id === seleccionado) ?? TICKETS_MOCK[0];
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-3 overflow-y-auto p-5">
      <div className="flex flex-col gap-1.5">
        {TICKETS_MOCK.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSeleccionado(t.id)}
            className={cn(
              "flex items-center gap-2 rounded-md border px-3 py-2 text-left text-xs transition-colors",
              t.id === seleccionado
                ? cn("border-transparent", accent.chip)
                : "border-neutral-200 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800/50"
            )}
          >
            <span className="font-mono text-neutral-500 dark:text-neutral-400">{t.id}</span>
            <span className="flex-1 truncate font-medium">{t.asunto}</span>
            <span className="shrink-0">{t.prioridad}</span>
            <span className="shrink-0">{t.estado}</span>
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-neutral-200 p-4 text-xs dark:border-neutral-800">
        <p className="mb-2 font-mono text-neutral-500 dark:text-neutral-400">{ticket.id}</p>
        <p className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">{ticket.asunto}</p>
        <dl className="grid grid-cols-2 gap-y-1.5">
          <dt className="text-neutral-500 dark:text-neutral-400">Prioridad</dt>
          <dd className="text-right text-neutral-800 dark:text-neutral-200">{ticket.prioridad}</dd>
          <dt className="text-neutral-500 dark:text-neutral-400">Estado</dt>
          <dd className="text-right text-neutral-800 dark:text-neutral-200">{ticket.estado}</dd>
          <dt className="text-neutral-500 dark:text-neutral-400">Asignado a</dt>
          <dd className="text-right text-neutral-800 dark:text-neutral-200">{ticket.asignado}</dd>
        </dl>
      </div>
    </div>
  );
}

function GenericoBody({
  config,
  accent,
}: {
  config: SistemaExternoConfig;
  accent: (typeof ACCENTS)[keyof typeof ACCENTS];
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 overflow-y-auto p-5">
      {config.campos && config.campos.length > 0 && (
        <div className={cn("rounded-lg border border-neutral-200 p-4 ring-1 dark:border-neutral-800", accent.ring)}>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            {config.campos.map((c) => (
              <div key={c.label} className="contents">
                <dt className="text-neutral-500 dark:text-neutral-400">{c.label}</dt>
                <dd className="text-right font-medium text-neutral-800 dark:text-neutral-200">{c.valor}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      {config.filas && config.filas.length > 0 && (
        <div className="flex flex-col gap-2">
          {config.filas.map((f) => (
            <div
              key={f.titulo}
              className="flex items-center gap-3 rounded-md border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-800"
            >
              <span className="flex-1 text-neutral-800 dark:text-neutral-200">
                <span className="font-medium">{f.titulo}</span>
                {f.detalle && <span className="block text-neutral-500 dark:text-neutral-400">{f.detalle}</span>}
              </span>
              {f.estado && (
                <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[0.7rem] font-medium", accent.chip)}>
                  {f.estado}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      {!config.campos?.length && !config.filas?.length && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">Sin datos de ejemplo cargados para esta vista.</p>
      )}
    </div>
  );
}

// Vista genérica de "sistema externo" — a propósito con otra paleta/otro
// look que Hermes, para que se note que es un sistema de terceros y no una
// pantalla más del pad. Un mismo componente cubre los tres "kind" (crm,
// tickets, generico) que reusan varias integraciones del pad (ver
// sistema-externo-data.ts).
export function SistemaExternoView({ config }: { config: SistemaExternoConfig }) {
  const accent = ACCENTS[config.accent];
  return (
    <div className="flex h-full min-h-0 flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <TopBar config={config} />
      <NoticeBanner />
      {config.kind === "crm" && <CrmBody accent={accent} />}
      {config.kind === "tickets" && <TicketsBody accent={accent} />}
      {config.kind === "generico" && <GenericoBody config={config} accent={accent} />}
    </div>
  );
}
