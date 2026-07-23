// Motivo visual "tech" del login de Atlas — SOLO decorativo (aria-hidden).
// Una constelación de nodos y conexiones sobre una grilla finísima, atenuada
// hacia los bordes con una máscara radial. Los nodos "accent" laten con
// desfases orgánicos y llevan un halo suave para dar profundidad y sensación
// de tiempo real. Todo con tokens / opacidades sobre el fondo oscuro de marca
// (bg-header) — sin hex hardcodeado.
export function ConnectionMotif({ className }: { className?: string }) {
  // Nodos del grafo (coordenadas en el viewBox 400x400). Los `accent` se pintan
  // con el primario, laten y proyectan un halo. `delay` desfasa el pulso.
  const nodes = [
    { x: 48, y: 72, r: 2.5, accent: false, delay: 0 },
    { x: 132, y: 44, r: 3.5, accent: true, delay: 0.4 },
    { x: 226, y: 78, r: 2.5, accent: false, delay: 0 },
    { x: 320, y: 52, r: 3, accent: false, delay: 0 },
    { x: 368, y: 128, r: 2.5, accent: false, delay: 0 },
    { x: 84, y: 158, r: 3.5, accent: true, delay: 1.1 },
    { x: 196, y: 196, r: 6, accent: true, delay: 0 },
    { x: 300, y: 168, r: 3, accent: false, delay: 0 },
    { x: 40, y: 268, r: 2.5, accent: false, delay: 0 },
    { x: 150, y: 300, r: 3.5, accent: true, delay: 1.8 },
    { x: 262, y: 288, r: 3, accent: false, delay: 0 },
    { x: 356, y: 316, r: 2.5, accent: false, delay: 0 },
    { x: 224, y: 356, r: 3, accent: true, delay: 0.8 },
    { x: 96, y: 360, r: 2.5, accent: false, delay: 0 },
  ];

  // Aristas (índices sobre `nodes`) — el hub central (6) irradia hacia el resto.
  const edges: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [1, 6],
    [5, 6],
    [6, 7],
    [4, 7],
    [0, 5],
    [5, 8],
    [6, 9],
    [8, 9],
    [9, 10],
    [7, 10],
    [10, 11],
    [9, 12],
    [12, 10],
    [8, 13],
    [13, 9],
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
          id="atlas-grid"
          width="32"
          height="32"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M32 0H0V32"
            fill="none"
            className="stroke-white/[0.04]"
            strokeWidth="1"
          />
        </pattern>
        {/* Degradé de línea: de un blanco tenue al primario, para las aristas. */}
        <linearGradient id="atlas-edge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" className="[stop-color:var(--color-primary)]" stopOpacity="0.35" />
          <stop offset="100%" stopColor="white" stopOpacity="0.12" />
        </linearGradient>
        {/* Máscara radial: la escena se desvanece hacia los bordes. */}
        <radialGradient id="atlas-fade" cx="46%" cy="42%" r="72%">
          <stop offset="0%" stopColor="white" stopOpacity="0.95" />
          <stop offset="70%" stopColor="white" stopOpacity="0.5" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="atlas-mask">
          <rect width="400" height="400" fill="url(#atlas-fade)" />
        </mask>
        {/* Halo suave para los nodos acentuados. */}
        <filter id="atlas-glow" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grilla de fondo, atenuada hacia los bordes con la máscara radial. */}
      <rect
        width="400"
        height="400"
        fill="url(#atlas-grid)"
        mask="url(#atlas-mask)"
      />

      {/* Grafo de conexión. */}
      <g mask="url(#atlas-mask)">
        {edges.map(([a, b], i) => (
          <line
            key={i}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke="url(#atlas-edge)"
            strokeWidth="1"
          />
        ))}
        {nodes.map((n, i) =>
          n.accent ? (
            <circle
              key={i}
              cx={n.x}
              cy={n.y}
              r={n.r}
              filter="url(#atlas-glow)"
              className="fill-primary animate-pulse [animation-duration:3.2s]"
              style={{ animationDelay: `${n.delay}s` }}
            />
          ) : (
            <circle
              key={i}
              cx={n.x}
              cy={n.y}
              r={n.r}
              className="fill-white/35"
            />
          ),
        )}
      </g>
    </svg>
  );
}
