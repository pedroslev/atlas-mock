"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

// 404 global de Atlas: vive en la raíz del app dir, así que se muestra fuera
// del shell del backoffice (sin sidebar ni header) para cualquier URL que no
// exista. Juega con el lenguaje de marca — la constelación de nodos del login —
// para contar un "nodo perdido": la conexión se cortó justo acá. Marca 100% por
// tokens del design system Mitrol, así funciona en light y dark.
export default function NotFound() {
  const t = useT();

  return (
    <main className="relative flex min-h-full flex-1 flex-col items-center justify-center overflow-hidden bg-background px-6 py-16 text-center">
      {/* Motivo tech de fondo: grilla + constelación con un nodo desconectado. */}
      <LostNodeMotif className="pointer-events-none absolute inset-0 size-full text-foreground" />

      {/* Halo de marca sutil detrás del contenido */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,var(--accent),transparent)] opacity-70"
      />

      <div className="relative flex w-full max-w-md flex-col items-center gap-6">
        <Image
          src="/brand/logo-mitrol-aguila-roja.png"
          alt="Mitrol"
          width={1200}
          height={675}
          className="h-12 w-auto"
          priority
        />

        {/* 404 con el 0 central convertido en un nodo que "late" y se apaga. */}
        <div className="relative flex items-center justify-center font-mono text-7xl font-bold tracking-tight text-primary sm:text-8xl">
          <span aria-hidden>4</span>
          <span className="relative mx-1 inline-flex size-[1em] items-center justify-center">
            {/* Halo del nodo perdido */}
            <span
              aria-hidden
              className="absolute inset-0 animate-ping rounded-full bg-primary/20"
              style={{ animationDuration: "2.4s" }}
            />
            <span
              aria-hidden
              className="absolute inset-[0.18em] rounded-full border-2 border-primary/40"
            />
            <span className="sr-only">0</span>
            <Radio className="relative size-[0.5em] text-primary" aria-hidden />
          </span>
          <span aria-hidden>4</span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
            {t("common.404.kicker")}
          </span>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            {t("common.404.titulo")}
          </h1>
          <p className="text-balance text-sm text-muted-foreground sm:text-base">
            {t("common.404.descripcion")}
          </p>
        </div>

        <Button asChild size="lg">
          <Link href="/">
            <ArrowLeft className="size-4" />
            {t("common.404.volver")}
          </Link>
        </Button>
      </div>
    </main>
  );
}

// Constelación decorativa (aria-hidden) para el 404: la misma grilla + grafo de
// nodos del login, pero con un nodo desconectado y una arista cortada (dashed)
// que refuerzan la idea de "señal perdida". Usa currentColor / tokens para
// adaptarse a light y dark; se desvanece hacia los bordes con una máscara radial.
function LostNodeMotif({ className }: { className?: string }) {
  const nodes = [
    { x: 60, y: 80, r: 2.5, accent: false, delay: 0 },
    { x: 150, y: 52, r: 3.5, accent: true, delay: 0.4 },
    { x: 250, y: 90, r: 2.5, accent: false, delay: 0 },
    { x: 340, y: 60, r: 3, accent: false, delay: 0 },
    { x: 96, y: 168, r: 3.5, accent: true, delay: 1.1 },
    { x: 300, y: 178, r: 3, accent: false, delay: 0 },
    { x: 48, y: 288, r: 2.5, accent: false, delay: 0 },
    { x: 160, y: 316, r: 3.5, accent: true, delay: 1.8 },
    { x: 272, y: 300, r: 3, accent: false, delay: 0 },
    { x: 356, y: 330, r: 2.5, accent: false, delay: 0 },
  ];

  // El nodo perdido: vive suelto, sin conectar al grafo. Late y se apaga.
  const lost = { x: 210, y: 210, r: 5 };

  const edges: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [0, 4],
    [4, 1],
    [4, 6],
    [6, 7],
    [7, 8],
    [8, 5],
    [5, 3],
    [8, 9],
  ];

  return (
    <svg
      aria-hidden
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid slice"
      className={className}
    >
      <defs>
        <pattern
          id="nf-grid"
          width="32"
          height="32"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M32 0H0V32"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.05"
            strokeWidth="1"
          />
        </pattern>
        <radialGradient id="nf-fade" cx="50%" cy="46%" r="70%">
          <stop offset="0%" stopColor="white" stopOpacity="0.9" />
          <stop offset="65%" stopColor="white" stopOpacity="0.4" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="nf-mask">
          <rect width="400" height="400" fill="url(#nf-fade)" />
        </mask>
      </defs>

      {/* Grilla de fondo, atenuada hacia los bordes. */}
      <rect width="400" height="400" fill="url(#nf-grid)" mask="url(#nf-mask)" />

      <g mask="url(#nf-mask)">
        {/* Aristas del grafo conectado. */}
        {edges.map(([a, b], i) => (
          <line
            key={i}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke="currentColor"
            strokeOpacity="0.14"
            strokeWidth="1"
          />
        ))}

        {/* Arista cortada hacia el nodo perdido: dashed, tenue. */}
        <line
          x1={nodes[4].x}
          y1={nodes[4].y}
          x2={lost.x}
          y2={lost.y}
          className="stroke-primary"
          strokeOpacity="0.35"
          strokeWidth="1"
          strokeDasharray="4 6"
        />

        {/* Nodos del grafo. */}
        {nodes.map((n, i) =>
          n.accent ? (
            <circle
              key={i}
              cx={n.x}
              cy={n.y}
              r={n.r}
              className="fill-primary animate-pulse [animation-duration:3.2s]"
              style={{ animationDelay: `${n.delay}s` }}
            />
          ) : (
            <circle
              key={i}
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill="currentColor"
              fillOpacity="0.3"
            />
          ),
        )}

        {/* Nodo perdido: aro + núcleo que late suave. */}
        <circle
          cx={lost.x}
          cy={lost.y}
          r={lost.r + 5}
          fill="none"
          className="stroke-primary"
          strokeOpacity="0.3"
        />
        <circle
          cx={lost.x}
          cy={lost.y}
          r={lost.r}
          className="fill-primary animate-pulse [animation-duration:2.4s]"
        />
      </g>
    </svg>
  );
}
