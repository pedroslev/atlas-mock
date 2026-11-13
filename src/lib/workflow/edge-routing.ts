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
  pending: RouteRequest[],
  options: RouteOptions = {},
): Map<string, Point[]> {
  // Salidas y entradas en píxeles enteros: son líneas de la grilla, y un punto con decimales
  // (un punto de conexión con borde) no se encontraría en ella.
  const requests = pending.map((r) => ({
    ...r,
    from: [Math.round(r.from[0]), Math.round(r.from[1])] as Point,
    to: [Math.round(r.to[0]), Math.round(r.to[1])] as Point,
  }));
  // Bordes enteros: son líneas de la grilla, y así cada nodo tapa un rango exacto de índices.
  const boxes = nodes.map((n) => ({
    left: Math.round(n.x - MARGIN),
    right: Math.round(n.x + n.width + MARGIN),
    top: Math.round(n.y - MARGIN),
    bottom: Math.round(n.y + n.height + MARGIN),
  }));

  // Puntos donde arranca y termina la búsqueda: un tramo recto afuera del margen del nodo. La
  // salida puede estar sobre el borde o adentro del nodo (un punto al lado del nombre de la
  // salida): el tramo inicial llega siempre hasta afuera del margen del nodo de origen.
  const ends = requests.map((r) => {
    const origin = boxes.find(
      (b) => r.from[0] >= b.left && r.from[0] <= b.right && r.from[1] >= b.top && r.from[1] <= b.bottom,
    );
    const start: Point =
      r.fromSide === "bottom"
        ? [r.from[0], Math.max(r.from[1] + STUB, (origin?.bottom ?? -Infinity) + STUB - MARGIN)]
        : [Math.max(r.from[0] + STUB, (origin?.right ?? -Infinity) + STUB - MARGIN), r.from[1]];
    const end: Point = [r.to[0], r.to[1] - STUB];
    // Altura preferida del tramo horizontal: a mitad de camino entre la salida y la entrada,
    // solo si el destino queda abajo (una conexión hacia adelante).
    const middle = Math.round((r.from[1] + r.to[1]) / 2);
    const preferredY = end[1] > start[1] && middle > start[1] && middle < end[1] ? middle : undefined;
    return { start, end, preferredY };
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
    ...ends.flatMap((e) => [e.start[1], e.end[1], ...(e.preferredY === undefined ? [] : [e.preferredY])]),
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

  // Entradas a las que llega más de una conexión (contando las que se conservan): ahí cada una
  // tiene que llegar por su lado y juntarse recién en el último tramo corto, no bajar todas por la
  // misma vertical (se verían como una sola línea).
  const toKey = (p: Point) => `${Math.round(p[0])},${Math.round(p[1])}`;
  const incoming = new Map<string, number>();
  for (const p of [...requests.map((r) => r.to), ...[...(options.fixed?.values() ?? [])].map((pts) => pts[pts.length - 1])]) {
    incoming.set(toKey(p), (incoming.get(toKey(p)) ?? 0) + 1);
  }

  function search(start: Point, end: Point, startDir: Dir, sharedEntry = false): Point[] | null {
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
        // Entrada compartida: por la vertical de la entrada solo se baja el último tramo corto.
        if (sharedEntry && moveDir === 1 && i === ei && !(q === goal && length <= 2 * MARGIN)) continue;
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

  // Tramos de la grilla (índice del punto * 2 + dir) que recorre un camino de punto a punto.
  function segmentsOf(path: Point[]): number[] {
    const result: number[] = [];
    for (let k = 1; k < path.length; k++) {
      const [x0, y0] = path[k - 1];
      const [x1, y1] = path[k];
      if (y0 === y1) {
        const j = yIndex.get(y0)!;
        const [i0, i1] = [xIndex.get(Math.min(x0, x1))!, xIndex.get(Math.max(x0, x1))!];
        for (let i = i0; i < i1; i++) result.push((j * W + i) * 2);
      } else {
        const i = xIndex.get(x0)!;
        const [j0, j1] = [yIndex.get(Math.min(y0, y1))!, yIndex.get(Math.max(y0, y1))!];
        for (let j = j0; j < j1; j++) result.push((j * W + i) * 2 + 1);
      }
    }
    return result;
  }

  function markUsage(path: Point[]) {
    for (const segment of segmentsOf(path)) usage[segment]++;
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
    const { start, end, preferredY } = ends[k];
    const sharedEntry = (incoming.get(toKey(r.to)) ?? 0) > 1;
    // Hacia adelante y con el camino libre, la conexión va en Z con el tramo horizontal a mitad de
    // camino, como en el trazado acordado del editor; si algún nodo lo tapa (o la entrada es
    // compartida), la busca A*.
    const middle: Point[] | null =
      preferredY === undefined || sharedEntry
        ? null
        : [start, [start[0], preferredY], [end[0], preferredY], end];
    const middleFree =
      middle !== null &&
      middle.every((p, m) => m === 0 || !boxes.some((b) => crossesBox(middle[m - 1], p, b))) &&
      segmentsOf(middle).every((segment) => usage[segment] === 0);
    const path = middleFree ? middle : search(start, end, r.fromSide === "bottom" ? 1 : 0, sharedEntry);
    if (path) markUsage(path);
    // Sin camino libre (un nodo encima de otro) o con una búsqueda que pasó el tope, se dibuja
    // directo, en ángulo recto.
    routes.set(r.id, path ? simplify([r.from, ...path, r.to]) : directRoute(r, start, end));
  }

  nudgeOverlaps(routes, options.fixed);
  return routes;
}

// Corre unos píxeles los tramos internos que quedaron sobre la misma línea y se superponen,
// para que se lean como conexiones distintas. No toca el primer ni el último tramo, que están
// pegados a la salida y a la entrada.
function nudgeOverlaps(routes: Map<string, Point[]>, fixed?: Map<string, Point[]>) {
  type Seg = { id: string; k: number; vertical: boolean; at: number; lo: number; hi: number; kept: boolean };
  const segments: Seg[] = [];
  const all: [string, Point[], boolean][] = [
    ...[...(fixed ?? [])].map(([id, pts]) => [id, pts, true] as [string, Point[], boolean]),
    ...[...routes].map(([id, pts]) => [id, pts, false] as [string, Point[], boolean]),
  ];
  for (const [id, pts, kept] of all) {
    for (let k = 1; k < pts.length - 2; k++) {
      const [a, b] = [pts[k], pts[k + 1]];
      const vertical = a[0] === b[0];
      const at = vertical ? a[0] : a[1];
      const [lo, hi] = vertical ? [Math.min(a[1], b[1]), Math.max(a[1], b[1])] : [Math.min(a[0], b[0]), Math.max(a[0], b[0])];
      segments.push({ id, k, vertical, at, lo, hi, kept });
    }
  }
  const groups = new Map<string, Seg[]>();
  for (const g of segments) {
    const key = `${g.vertical ? "v" : "h"}${g.at}`;
    groups.set(key, [...(groups.get(key) ?? []), g]);
  }
  for (const segs of groups.values()) {
    if (segs.length < 2) continue;
    const base = segs[0].at;
    // Cada tramo toma el primer carril libre entre los que se le superponen. Los de las rutas
    // que se conservan van primero y no se mueven: las nuevas se corren a su lado.
    segs.sort((a, b) => Number(b.kept) - Number(a.kept) || a.lo - b.lo);
    const lanes: Seg[][] = [];
    const laneOf = new Map<Seg, number>();
    for (const s of segs) {
      let lane = lanes.findIndex((l) => l.every((o) => o.hi <= s.lo || o.lo >= s.hi || o.id === s.id));
      if (lane === -1) lane = lanes.push([]) - 1;
      lanes[lane].push(s);
      laneOf.set(s, lane);
    }
    if (lanes.length < 2) continue;
    const anyKept = segs.some((s) => s.kept);
    for (const s of segs) {
      if (s.kept) continue;
      // Con tramos que se conservan, las nuevas se corren hacia un lado; si no, se reparten
      // alrededor de la línea de referencia.
      const offset = (laneOf.get(s)! - (anyKept ? 0 : (lanes.length - 1) / 2)) * NUDGE;
      const pts = routes.get(s.id)!;
      const c = s.vertical ? 0 : 1;
      pts[s.k] = c === 0 ? [base + offset, pts[s.k][1]] : [pts[s.k][0], base + offset];
      pts[s.k + 1] = c === 0 ? [base + offset, pts[s.k + 1][1]] : [pts[s.k + 1][0], base + offset];
      s.at = base + offset;
    }
  }
  // Tramos paralelos que se pisan sobre líneas distintas pero a menos de NUDGE (una línea de la
  // grilla y la del medio del pasillo, a 3 px): a esa distancia se verían como una sola. Se aleja
  // el tramo nuevo hasta NUDGE del otro, hacia el lado en que ya estaba.
  for (const s of segments) {
    if (s.kept) continue;
    for (const o of segments) {
      if (o === s || o.id === s.id || o.vertical !== s.vertical) continue;
      const gap = s.at - o.at;
      if (gap === 0 || Math.abs(gap) >= NUDGE || Math.min(s.hi, o.hi) - Math.max(s.lo, o.lo) <= 2) continue;
      s.at = o.at + Math.sign(gap) * NUDGE;
      const pts = routes.get(s.id)!;
      pts[s.k] = s.vertical ? [s.at, pts[s.k][1]] : [pts[s.k][0], s.at];
      pts[s.k + 1] = s.vertical ? [s.at, pts[s.k + 1][1]] : [pts[s.k + 1][0], s.at];
    }
  }
}

// Si el tramo a-b pasa por adentro de una caja (un nodo con su margen); tocar el borde no cuenta.
function crossesBox(a: Point, b: Point, box: { left: number; right: number; top: number; bottom: number }): boolean {
  const [x0, x1] = [Math.min(a[0], b[0]), Math.max(a[0], b[0])];
  const [y0, y1] = [Math.min(a[1], b[1]), Math.max(a[1], b[1])];
  return x1 > box.left && x0 < box.right && y1 > box.top && y0 < box.bottom;
}

// ¿El tramo de `a` a `b` (horizontal o vertical) pasa por dentro del rectángulo?
function crosses(a: Point, b: Point, r: Rect): boolean {
  const [x0, x1] = [Math.min(a[0], b[0]), Math.max(a[0], b[0])];
  const [y0, y1] = [Math.min(a[1], b[1]), Math.max(a[1], b[1])];
  return x1 > r.x && x0 < r.x + r.width && y1 > r.y && y0 < r.y + r.height;
}

/**
 * Qué conexiones hay que volver a rutear, como en draw.io: las que no tienen ruta, las que tienen
 * la salida o la entrada en otro lugar y, si `crossing`, las que quedaron pasando por un nodo o
 * encima de un tramo de una ruta de `avoid` (las acomodadas a mano: la que se movió queda donde se
 * dejó y las demás se corren). Las demás conservan su trazado: al soltar un nodo, sus conexiones
 * quedan como venían del arrastre.
 */
export function edgesToReroute(
  routes: Map<string, Point[]>,
  requests: RouteRequest[],
  nodes: Rect[],
  crossing: boolean,
  avoid: Map<string, Point[]> = new Map(),
): Set<string> {
  const avoided = [...avoid.values()].flatMap((pts) => pts.slice(1, -2).map((p, k) => [p, pts[k + 2]] as [Point, Point]));
  // Hasta un píxel de diferencia: las rutas arrancan y terminan en píxeles enteros.
  const near = (p: Point, q: Point) => Math.abs(p[0] - q[0]) < 1 && Math.abs(p[1] - q[1]) < 1;
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
      else if (avoided.some(([a, b]) => overlapsSegment(pts[k], pts[k + 1], a, b))) result.add(r.id);
    }
  }
  return result;
}

// Si los tramos a-b y c-d van en la misma dirección, a menos de NUDGE uno del otro (a esa
// distancia se ven como una sola línea), y se pisan en más de un par de píxeles.
function overlapsSegment(a: Point, b: Point, c: Point, d: Point): boolean {
  const vertical = a[0] === b[0];
  if (vertical !== (c[0] === d[0])) return false;
  const [at, ct] = vertical ? [a[0], c[0]] : [a[1], c[1]];
  if (Math.abs(at - ct) >= NUDGE) return false;
  const axis = vertical ? 1 : 0;
  const lo = Math.max(Math.min(a[axis], b[axis]), Math.min(c[axis], d[axis]));
  const hi = Math.min(Math.max(a[axis], b[axis]), Math.max(c[axis], d[axis]));
  return hi - lo > 2;
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

/**
 * Vuelve a pegar una ruta acomodada a mano a la salida y la entrada de ahora (se movió un nodo):
 * solo se estiran el primer y el último tramo, el resto queda donde se dejó. Devuelve
 * `undefined` si la ruta tiene muy pocos tramos para estirarla sin desarmarla.
 */
export function anchorRoute(
  route: Point[],
  from: Point,
  to: Point,
  fromSide: "right" | "bottom",
): Point[] | undefined {
  // Una L (salida por la derecha que dobla una vez y baja a la entrada): el codo sigue a las dos
  // puntas. Una vertical directa solo sirve mientras la salida siga encima de la entrada.
  if (route.length === 3 && fromSide === "right") return [from, [to[0], from[1]], to];
  if (route.length === 2) return from[0] === to[0] ? [from, to] : undefined;
  if (route.length < 4) return undefined;
  const pts = route.map((p) => [p[0], p[1]] as Point);
  const last = pts.length - 1;
  pts[0] = from;
  // El primer tramo sale horizontal por la derecha (vertical por abajo en el inicio).
  pts[1] = fromSide === "bottom" ? [from[0], pts[1][1]] : [pts[1][0], from[1]];
  // El último entra vertical por arriba del destino.
  pts[last - 1] = [to[0], pts[last - 1][1]];
  pts[last] = to;
  return pts;
}

/**
 * Tramos de una ruta que se pueden arrastrar: todos menos el primero y el último, que van
 * pegados a la salida y a la entrada. `axis` dice hacia dónde se mueve: "x" un tramo vertical
 * (a los costados), "y" uno horizontal (arriba y abajo).
 */
export function draggableSegments(route: Point[]): { index: number; axis: "x" | "y" }[] {
  const result: { index: number; axis: "x" | "y" }[] = [];
  for (let k = 1; k < route.length - 2; k++) {
    result.push({ index: k, axis: route[k][0] === route[k + 1][0] ? "x" : "y" });
  }
  return result;
}

/**
 * Corre el tramo `index` (entre los puntos `index` e `index + 1`) a `value`: la x si es
 * vertical, la y si es horizontal. Un tramo horizontal no baja más allá de justo arriba del
 * destino ni sube más allá de justo abajo de una salida por abajo, para que la línea siga
 * entrando y saliendo por esos bordes. El tramo vertical que sigue a una salida por la derecha
 * no se acerca a menos del margen del borde derecho del nodo de origen (`originRight`): si no,
 * la línea quedaría saliendo por debajo del nodo y no se vería de dónde sale.
 */
export function moveSegment(route: Point[], index: number, value: number, originRight?: number): Point[] {
  return simplify(shiftSegment(route, index, value, originRight));
}

// Distancia hasta la que un tramo que se suelta se pega a la altura de la salida o a la vertical
// de la entrada, antes que a la grilla.
const ALIGN_SNAP = 8;

/**
 * A dónde cae un tramo que se suelta en `value`: a la altura de la salida (si es horizontal) o a
 * la vertical de la entrada (si es vertical) cuando queda a menos de ALIGN_SNAP, así la línea se
 * puede dejar recta aunque la salida no esté sobre la grilla; si no, a la grilla (`grid`) o
 * donde se soltó.
 */
export function snapSegment(route: Point[], index: number, value: number, grid?: number): number {
  const vertical = route[index][0] === route[index + 1][0];
  const from = route[0];
  const to = route[route.length - 1];
  const anchors = vertical ? [to[0], from[0]] : [from[1]];
  const anchor = anchors.find((a) => Math.abs(a - value) <= ALIGN_SNAP);
  if (anchor !== undefined) return anchor;
  return grid ? Math.round(value / grid) * grid : value;
}

function shiftSegment(route: Point[], index: number, value: number, originRight?: number): Point[] {
  const pts = route.map((p) => [p[0], p[1]] as Point);
  const vertical = pts[index][0] === pts[index + 1][0];
  if (vertical) {
    const leavesRight = index === 1 && pts[0][1] === pts[1][1];
    const x = leavesRight && originRight !== undefined ? Math.max(value, originRight + MARGIN) : value;
    pts[index] = [x, pts[index][1]];
    pts[index + 1] = [x, pts[index + 1][1]];
    return pts;
  }
  let y = value;
  const to = pts[pts.length - 1];
  if (index + 1 === pts.length - 2) y = Math.min(y, to[1] - STUB);
  const from = pts[0];
  if (index === 1 && pts[0][0] === pts[1][0]) y = Math.max(y, from[1] + STUB);
  pts[index] = [pts[index][0], y];
  pts[index + 1] = [pts[index + 1][0], y];
  return pts;
}
