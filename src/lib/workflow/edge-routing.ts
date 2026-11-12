// Ruteo ortogonal de las conexiones del lienzo, al estilo de draw.io: cada conexión va en
// tramos horizontales y verticales, rodea los nodos en vez de pasar por detrás y, cuando dos
// comparten un tramo, se separan. Se calcula para todo el flujo de una vez (no por conexión),
// así cada conexión sabe por dónde pasan las otras.
//
// Cómo: una grilla con las líneas de los bordes de cada nodo (más un margen) y las líneas del
// medio de cada pasillo entre nodos. Sobre esa grilla, A* busca el camino más corto penalizando
// los codos y los tramos que ya usa otra conexión. Al final, los tramos que quedan superpuestos
// se corren unos píxeles para que se vean por separado.

export type Point = [number, number];

export type Rect = { id: string; x: number; y: number; width: number; height: number };

// `from` es la salida (por la derecha del nodo, o por abajo en el inicio) y `to` la entrada,
// siempre por el borde de arriba del nodo de destino.
export type RouteRequest = {
  id: string;
  from: Point;
  fromSide: "right" | "bottom";
  to: Point;
};

// Distancia libre alrededor de cada nodo y largo del tramo recto al salir y al entrar.
const MARGIN = 16;
const STUB = MARGIN + 6;
// Un codo "cuesta" como este largo de línea: con eso se prefieren caminos con pocos quiebres.
const BEND_COST = 60;
// Recorrer un tramo que ya usa otra conexión cuesta este extra por cada una.
const REUSE_COST = 40;
// Peso de la distancia que falta en A*: con más de 1 la búsqueda va más derecho al destino y
// visita muchos menos estados, a cambio de rutas apenas menos cortas.
const HEURISTIC_WEIGHT = 1.5;
// Separación entre tramos superpuestos.
const NUDGE = 7;
// Topes para que un flujo muy grande no congele la pestaña: una grilla de más celdas, o una
// búsqueda que visita más estados, se resuelven con el trazado directo en ángulo recto.
const MAX_CELLS = 400_000;
const MAX_EXPANSIONS = 60_000;

export type RouteOptions = {
  // Rutas que se conservan: no se recalculan, pero las nuevas evitan ir por sus tramos.
  fixed?: Map<string, Point[]>;
  maxCells?: number;
};

type Dir = 0 | 1; // 0 = horizontal, 1 = vertical

function uniqueSorted(values: number[]): number[] {
  return [...new Set(values.map((v) => Math.round(v)))].sort((a, b) => a - b);
}

// Cola de prioridad mínima (montículo binario) para A*.
class MinHeap<T> {
  private items: { key: number; value: T }[] = [];
  get size() {
    return this.items.length;
  }
  push(key: number, value: T) {
    const items = this.items;
    items.push({ key, value });
    let i = items.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (items[parent].key <= items[i].key) break;
      [items[parent], items[i]] = [items[i], items[parent]];
      i = parent;
    }
  }
  pop(): T | undefined {
    const items = this.items;
    if (items.length === 0) return undefined;
    const top = items[0].value;
    const last = items.pop()!;
    if (items.length > 0) {
      items[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < items.length && items[l].key < items[m].key) m = l;
        if (r < items.length && items[r].key < items[m].key) m = r;
        if (m === i) break;
        [items[m], items[i]] = [items[i], items[m]];
        i = m;
      }
    }
    return top;
  }
}

// Quita los puntos que no son quiebres (tres puntos seguidos sobre la misma línea).
function simplify(points: Point[]): Point[] {
  const out: Point[] = [];
  for (const p of points) {
    const prev = out[out.length - 1];
    if (prev && prev[0] === p[0] && prev[1] === p[1]) continue;
    if (out.length >= 2) {
      const a = out[out.length - 2];
      const b = out[out.length - 1];
      if ((a[0] === b[0] && b[0] === p[0]) || (a[1] === b[1] && b[1] === p[1])) {
        out[out.length - 1] = p;
        continue;
      }
    }
    out.push(p);
  }
  return out;
}

// Trazado directo en ángulo recto, sin mirar obstáculos: el de respaldo.
function directRoute(r: RouteRequest, start: Point, end: Point): Point[] {
  return simplify([r.from, start, [start[0], end[1]], end, r.to]);
}

/** Puntos de quiebre de cada conexión, de la salida a la entrada. */
export function routeEdges(
  nodes: Rect[],
  requests: RouteRequest[],
  options: RouteOptions = {},
): Map<string, Point[]> {
  // Bordes enteros: son líneas de la grilla, y así cada nodo tapa un rango exacto de índices.
  const boxes = nodes.map((n) => ({
    left: Math.round(n.x - MARGIN),
    right: Math.round(n.x + n.width + MARGIN),
    top: Math.round(n.y - MARGIN),
    bottom: Math.round(n.y + n.height + MARGIN),
  }));

  // Puntos donde arranca y termina la búsqueda: un tramo recto afuera del margen del nodo.
  const ends = requests.map((r) => {
    const start: Point =
      r.fromSide === "bottom" ? [r.from[0], r.from[1] + STUB] : [r.from[0] + STUB, r.from[1]];
    const end: Point = [r.to[0], r.to[1] - STUB];
    return { start, end };
  });

  // Líneas de la grilla: bordes de los nodos con su margen, los puntos de cada conexión y la
  // línea del medio de cada pasillo, que es por donde conviene que corran las conexiones.
  const withMiddles = (values: number[]) => {
    const sorted = uniqueSorted(values);
    const middles = sorted.slice(1).map((v, i) => (v + sorted[i]) / 2);
    return uniqueSorted([...sorted, ...middles]);
  };
  const outerPad = 3 * MARGIN;
  const allX = boxes.flatMap((b) => [b.left, b.right]);
  const allY = boxes.flatMap((b) => [b.top, b.bottom]);
  const xs = withMiddles([
    ...allX,
    ...ends.flatMap((e) => [e.start[0], e.end[0]]),
    Math.min(...allX, ...ends.map((e) => e.start[0])) - outerPad,
    Math.max(...allX, ...ends.map((e) => e.start[0])) + outerPad,
  ]);
  const ys = withMiddles([
    ...allY,
    ...ends.flatMap((e) => [e.start[1], e.end[1]]),
    Math.min(...allY, ...ends.map((e) => e.end[1])) - outerPad,
    Math.max(...allY, ...ends.map((e) => e.start[1])) + outerPad,
  ]);
  const W = xs.length;
  const H = ys.length;
  if (W * H > (options.maxCells ?? MAX_CELLS)) {
    return new Map(requests.map((r, k) => [r.id, directRoute(r, ends[k].start, ends[k].end)]));
  }
  const xIndex = new Map(xs.map((x, i) => [x, i]));
  const yIndex = new Map(ys.map((y, i) => [y, i]));

  // Qué puntos y qué tramos entre puntos vecinos quedan fuera de todo nodo. Cada nodo tapa un
  // rango de índices: se marca solo ese rango, sin recorrer la grilla entera por cada nodo
  // (es lo que permite recalcular mientras se arrastra).
  const free = new Uint8Array(W * H).fill(1);
  const freeRight = new Uint8Array(W * H).fill(1);
  const freeDown = new Uint8Array(W * H).fill(1);
  for (const b of boxes) {
    const iL = xIndex.get(b.left)!;
    const iR = xIndex.get(b.right)!;
    const jT = yIndex.get(b.top)!;
    const jB = yIndex.get(b.bottom)!;
    for (let j = jT; j <= jB; j++) {
      for (let i = iL; i <= iR; i++) {
        const p = j * W + i;
        const rowInside = j > jT && j < jB;
        const colInside = i > iL && i < iR;
        if (rowInside && colInside) free[p] = 0;
        if (rowInside && i < iR) freeRight[p] = 0;
        if (colInside && j < jB) freeDown[p] = 0;
      }
    }
  }

  // Cuántas conexiones ya pasan por cada tramo de la grilla (índice del punto * 2 + dir).
  const usage = new Uint16Array(W * H * 2);
  // Estado de la búsqueda, reservado una vez para todas las conexiones: `stamp` dice qué
  // búsqueda escribió cada costo, así no hace falta limpiar los arreglos entre una y otra.
  const best = new Float64Array(W * H * 2);
  const prev = new Int32Array(W * H * 2);
  const stamp = new Int32Array(W * H * 2);
  let generation = 0;

  // Índice de la línea de la grilla en `lines` más cercana a `v` (búsqueda binaria).
  const nearest = (lines: number[], v: number) => {
    let lo = 0;
    let hi = lines.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (lines[mid] < v) lo = mid + 1;
      else hi = mid;
    }
    return lo > 0 && v - lines[lo - 1] < lines[lo] - v ? lo - 1 : lo;
  };

  // Las rutas fijas ocupan los tramos de la grilla por donde pasan (o casi: pueden estar
  // corridas unos píxeles por la separación), para que las nuevas no se les superpongan.
  for (const pts of options.fixed?.values() ?? []) {
    for (let k = 1; k < pts.length - 2; k++) {
      const [a, b] = [pts[k], pts[k + 1]];
      if (a[1] === b[1]) {
        const j = nearest(ys, a[1]);
        if (Math.abs(ys[j] - a[1]) > NUDGE * 3) continue;
        const i0 = nearest(xs, Math.min(a[0], b[0]));
        const i1 = nearest(xs, Math.max(a[0], b[0]));
        for (let i = i0; i < i1; i++) usage[(j * W + i) * 2]++;
      } else {
        const i = nearest(xs, a[0]);
        if (Math.abs(xs[i] - a[0]) > NUDGE * 3) continue;
        const j0 = nearest(ys, Math.min(a[1], b[1]));
        const j1 = nearest(ys, Math.max(a[1], b[1]));
        for (let j = j0; j < j1; j++) usage[(j * W + i) * 2 + 1]++;
      }
    }
  }

  function search(start: Point, end: Point, startDir: Dir): Point[] | null {
    const si = xIndex.get(Math.round(start[0]));
    const sj = yIndex.get(Math.round(start[1]));
    const ei = xIndex.get(Math.round(end[0]));
    const ej = yIndex.get(Math.round(end[1]));
    if (si === undefined || sj === undefined || ei === undefined || ej === undefined) return null;
    const goal = ej * W + ei;
    generation++;
    const cost = (state: number) => (stamp[state] === generation ? best[state] : Infinity);
    const heap = new MinHeap<number>();
    const startState = (sj * W + si) * 2 + startDir;
    best[startState] = 0;
    prev[startState] = -1;
    stamp[startState] = generation;
    let expansions = 0;
    const h = (p: number) => Math.abs(xs[p % W] - end[0]) + Math.abs(ys[Math.floor(p / W)] - end[1]);
    heap.push(HEURISTIC_WEIGHT * h(sj * W + si), startState);

    while (heap.size > 0) {
      const state = heap.pop()!;
      if (++expansions > MAX_EXPANSIONS) return null;
      const p = state >> 1;
      const dir = (state & 1) as Dir;
      // La entrada al destino es vertical: llegar en horizontal agrega un codo.
      if (p === goal) {
        const path: Point[] = [];
        for (let s = state; s !== -1; s = prev[s]) {
          const q = s >> 1;
          path.push([xs[q % W], ys[Math.floor(q / W)]]);
        }
        return path.reverse();
      }
      const i = p % W;
      const j = Math.floor(p / W);
      const moves: [number, Dir, boolean][] = [
        [p + 1, 0, i + 1 < W && freeRight[p] === 1],
        [p - 1, 0, i > 0 && freeRight[p - 1] === 1],
        [p + W, 1, j + 1 < H && freeDown[p] === 1],
        [p - W, 1, j > 0 && freeDown[p - W] === 1],
      ];
      for (const [q, moveDir, ok] of moves) {
        if (!ok || (free[q] === 0 && q !== goal)) continue;
        const length = Math.abs(xs[q % W] - xs[i]) + Math.abs(ys[Math.floor(q / W)] - ys[j]);
        const segment = Math.min(p, q) * 2 + moveDir;
        let total = best[state] + length + usage[segment] * REUSE_COST;
        if (moveDir !== dir) total += BEND_COST;
        if (q === goal && moveDir === 0) total += BEND_COST;
        const next = q * 2 + moveDir;
        if (total < cost(next)) {
          best[next] = total;
          prev[next] = state;
          stamp[next] = generation;
          heap.push(total + HEURISTIC_WEIGHT * h(q), next);
        }
      }
    }
    return null;
  }

  function markUsage(path: Point[]) {
    for (let k = 1; k < path.length; k++) {
      const a = yIndex.get(path[k - 1][1])! * W + xIndex.get(path[k - 1][0])!;
      const b = yIndex.get(path[k][1])! * W + xIndex.get(path[k][0])!;
      const dir: Dir = path[k - 1][1] === path[k][1] ? 0 : 1;
      usage[Math.min(a, b) * 2 + dir]++;
    }
  }

  // Primero las conexiones cortas: son las que tienen menos alternativas.
  const order = requests
    .map((r, k) => ({ r, k }))
    .sort(
      (a, b) =>
        Math.abs(a.r.from[0] - a.r.to[0]) + Math.abs(a.r.from[1] - a.r.to[1]) -
        (Math.abs(b.r.from[0] - b.r.to[0]) + Math.abs(b.r.from[1] - b.r.to[1])),
    );

  const routes = new Map<string, Point[]>();
  for (const { r, k } of order) {
    const { start, end } = ends[k];
    const path = search(start, end, r.fromSide === "bottom" ? 1 : 0);
    if (path) markUsage(path);
    // Sin camino libre (un nodo encima de otro) o con una búsqueda que pasó el tope, se dibuja
    // directo, en ángulo recto.
    routes.set(r.id, path ? simplify([r.from, ...path, r.to]) : directRoute(r, start, end));
  }

  nudgeOverlaps(routes);
  return routes;
}

// Corre unos píxeles los tramos internos que quedaron sobre la misma línea y se superponen,
// para que se lean como conexiones distintas. No toca el primer ni el último tramo, que están
// pegados a la salida y a la entrada.
function nudgeOverlaps(routes: Map<string, Point[]>) {
  type Seg = { id: string; k: number; vertical: boolean; at: number; lo: number; hi: number };
  const groups = new Map<string, Seg[]>();
  for (const [id, pts] of routes) {
    for (let k = 1; k < pts.length - 2; k++) {
      const [a, b] = [pts[k], pts[k + 1]];
      const vertical = a[0] === b[0];
      const at = vertical ? a[0] : a[1];
      const [lo, hi] = vertical ? [Math.min(a[1], b[1]), Math.max(a[1], b[1])] : [Math.min(a[0], b[0]), Math.max(a[0], b[0])];
      const key = `${vertical ? "v" : "h"}${at}`;
      groups.set(key, [...(groups.get(key) ?? []), { id, k, vertical, at, lo, hi }]);
    }
  }
  for (const segs of groups.values()) {
    if (segs.length < 2) continue;
    // Cada tramo toma el primer carril libre entre los que se le superponen.
    segs.sort((a, b) => a.lo - b.lo);
    const lanes: Seg[][] = [];
    const laneOf = new Map<Seg, number>();
    for (const s of segs) {
      let lane = lanes.findIndex((l) => l.every((o) => o.hi <= s.lo || o.lo >= s.hi || o.id === s.id));
      if (lane === -1) lane = lanes.push([]) - 1;
      lanes[lane].push(s);
      laneOf.set(s, lane);
    }
    if (lanes.length < 2) continue;
    for (const s of segs) {
      const offset = (laneOf.get(s)! - (lanes.length - 1) / 2) * NUDGE;
      const pts = routes.get(s.id)!;
      const c = s.vertical ? 0 : 1;
      pts[s.k] = c === 0 ? [s.at + offset, pts[s.k][1]] : [pts[s.k][0], s.at + offset];
      pts[s.k + 1] = c === 0 ? [s.at + offset, pts[s.k + 1][1]] : [pts[s.k + 1][0], s.at + offset];
    }
  }
}

// ¿El tramo de `a` a `b` (horizontal o vertical) pasa por dentro del rectángulo?
function crosses(a: Point, b: Point, r: Rect): boolean {
  const [x0, x1] = [Math.min(a[0], b[0]), Math.max(a[0], b[0])];
  const [y0, y1] = [Math.min(a[1], b[1]), Math.max(a[1], b[1])];
  return x1 > r.x && x0 < r.x + r.width && y1 > r.y && y0 < r.y + r.height;
}

/**
 * Qué conexiones hay que volver a rutear, como en draw.io: las que no tienen ruta, las que tienen
 * la salida o la entrada en otro lugar y, si `crossing`, las que quedaron pasando por un nodo. Las
 * demás conservan su trazado: al soltar un nodo, sus conexiones quedan como venían del arrastre.
 */
export function edgesToReroute(
  routes: Map<string, Point[]>,
  requests: RouteRequest[],
  nodes: Rect[],
  crossing: boolean,
): Set<string> {
  const near = (p: Point, q: Point) => Math.abs(p[0] - q[0]) < 0.5 && Math.abs(p[1] - q[1]) < 0.5;
  const result = new Set<string>();
  for (const r of requests) {
    const pts = routes.get(r.id);
    if (!pts || !near(pts[0], r.from) || !near(pts[pts.length - 1], r.to)) {
      result.add(r.id);
      continue;
    }
    if (!crossing) continue;
    for (let k = 1; k < pts.length - 2 && !result.has(r.id); k++) {
      if (nodes.some((n) => crosses(pts[k], pts[k + 1], n))) result.add(r.id);
    }
  }
  return result;
}

export type EdgeGeometry = { points: Point[]; remove: Point; label: Point };

/**
 * Cómo se dibuja una conexión: la ruta calculada si sigue pegada a la salida y la entrada de
 * ahora, o si no un trazado simple en ángulo recto (antes de medir los nodos, o un instante
 * después de que se movieron). La cruz para quitarla va en el medio del tramo más largo; la
 * etiqueta de un retorno, pegada a la salida.
 */
export function edgeGeometry(
  route: Point[] | undefined,
  source: Point,
  target: Point,
  fromBottom: boolean,
): EdgeGeometry {
  const near = (p: Point, q: Point) => Math.abs(p[0] - q[0]) < 1 && Math.abs(p[1] - q[1]) < 1;
  const gx = fromBottom ? source[0] : source[0] + 14;
  const points: Point[] =
    route && near(route[0], source) && near(route[route.length - 1], target)
      ? route
      : [source, [gx, source[1]], [gx, target[1] - 16], [target[0], target[1] - 16], target];
  let remove = source;
  let longest = -1;
  for (let k = 1; k < points.length; k++) {
    const length =
      Math.abs(points[k][0] - points[k - 1][0]) + Math.abs(points[k][1] - points[k - 1][1]);
    if (length > longest) {
      longest = length;
      remove = [(points[k][0] + points[k - 1][0]) / 2, (points[k][1] + points[k - 1][1]) / 2];
    }
  }
  return { points, remove, label: [points[1][0] + 10, points[1][1]] };
}
