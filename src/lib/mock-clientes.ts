// Clientes, objetivos de contacto y estrategia de salida — mock de la
// propuesta conceptual en relevamiento/clientes-y-contactaciones/insight.md
// (v3, 2026-10-05). Nada de esto está decidido: es insumo para la sesión con
// el Chief Innovation Architect. Los nombres de los tipos son del mock, no un
// modelo de datos.

export type CanalContacto = "llamada" | "whatsapp" | "sms" | "email";

export type FormaContacto = {
  tipo: "telefono" | "email" | "whatsapp" | "red";
  valor: string;
  etiqueta: string;
  principal?: boolean;
  estado: "valido" | "invalido" | "noContactar";
};

export type Cliente = {
  id: string;
  nombre: string;
  apellido: string;
  tipoDoc: "DNI" | "CUIT" | "Pasaporte";
  nroDoc: string;
  idExterno?: string;
  // Clientes globales del tenant: se ven en todos los proyectos salvo en los
  // que se les sacó la visibilidad (pedido de producto 2026-10-05).
  ocultoEn: string[];
  formasContacto: FormaContacto[];
  infoAdicional: Record<string, string>;
  creado: string;
  actualizado: string;
  actualizadoPor: string;
};

export type Interaccion = {
  id: string;
  clienteId: string;
  campaniaId: string;
  fecha: string;
  canal: CanalContacto;
  direccion: "entrante" | "saliente";
  agente?: string;
  duracion?: string;
  clasificacion: string;
  objetivoId?: string;
};

export type OrigenObjetivo = {
  tipo: "crm" | "segmentacion" | "manual" | "reprogramacion";
  detalle: string;
  quien: string;
};

export type EstadoObjetivo =
  | "programado"
  | "pendiente"
  | "enCurso"
  | "contactado"
  | "noContactado"
  | "vencido"
  | "cancelado";

export type ObjetivoContacto = {
  id: string;
  clienteId: string;
  campaniaId: string;
  cargado: string;
  origen: OrigenObjetivo;
  medios: CanalContacto[];
  desde: string;
  hasta: string;
  pasoActual: number | null;
  estado: EstadoObjetivo;
};

export type ModoPaso =
  | "predictivo"
  | "progresivo"
  | "preview"
  | "power"
  | "plantilla";

export type PasoEstrategia = {
  id: string;
  canal: CanalContacto;
  modo: ModoPaso;
  plantilla?: string;
  arranque: "inmediato" | "horasDespues" | "diaSiguiente";
  arranqueValor?: string;
  horarioDesde: string;
  horarioHasta: string;
  intentos: number;
  minutosEntreIntentos: number;
  formasAUsar: "principal" | "todasEnOrden" | "soloCelulares";
  avanzaSi: string[];
  saleSi: string[];
};

const tel = (valor: string, etiqueta = "Celular", principal = false, estado: FormaContacto["estado"] = "valido"): FormaContacto => ({
  tipo: "telefono",
  valor,
  etiqueta,
  principal,
  estado,
});
const mail = (valor: string, principal = false): FormaContacto => ({
  tipo: "email",
  valor,
  etiqueta: "Personal",
  principal,
  estado: "valido",
});
const wa = (valor: string): FormaContacto => ({
  tipo: "whatsapp",
  valor,
  etiqueta: "WhatsApp",
  estado: "valido",
});

const deuda = (producto: string, cuenta: string, monto: string, mora: string, venc: string, suc: string) => ({
  Producto: producto,
  "Nro. de cuenta": cuenta,
  Deuda: monto,
  "Días de mora": mora,
  Vencimiento: venc,
  Sucursal: suc,
});

export const clientes: Cliente[] = [
  {
    id: "cli-1",
    nombre: "María Laura",
    apellido: "Fernández",
    tipoDoc: "DNI",
    nroDoc: "28.456.789",
    idExterno: "CRM-100234",
    ocultoEn: [],
    formasContacto: [
      tel("+54 9 11 5523-4410", "Celular", true),
      tel("+54 11 4788-2210", "Laboral"),
      wa("+54 9 11 5523-4410"),
      mail("mlfernandez@mail.com"),
    ],
    infoAdicional: deuda("Tarjeta Visa", "4509-****-2231", "$ 184.320", "12", "2026-09-23", "Palermo"),
    creado: "2026-06-02T09:14:00",
    actualizado: "2026-10-05T07:02:00",
    actualizadoPor: "Input CRM 05/10",
  },
  {
    id: "cli-2",
    nombre: "Jorge",
    apellido: "Pereyra",
    tipoDoc: "DNI",
    nroDoc: "31.902.115",
    idExterno: "CRM-100871",
    ocultoEn: [],
    formasContacto: [
      tel("+54 9 11 6012-7788", "Celular", true),
      tel("+54 9 11 4400-1122", "Celular", false, "invalido"),
      wa("+54 9 11 6012-7788"),
    ],
    infoAdicional: deuda("Préstamo personal", "PP-778812", "$ 412.900", "35", "2026-08-31", "Caballito"),
    creado: "2026-05-18T11:40:00",
    actualizado: "2026-10-04T18:20:00",
    actualizadoPor: "Input CRM 04/10",
  },
  {
    id: "cli-3",
    nombre: "Lucía",
    apellido: "Gómez",
    tipoDoc: "DNI",
    nroDoc: "35.220.674",
    idExterno: "CRM-101005",
    ocultoEn: [],
    formasContacto: [tel("+54 9 351 555-0192", "Celular", true), mail("lu.gomez@mail.com")],
    infoAdicional: deuda("Tarjeta Mastercard", "5412-****-8890", "$ 58.740", "8", "2026-09-27", "Córdoba Centro"),
    creado: "2026-09-01T08:00:00",
    actualizado: "2026-10-05T07:02:00",
    actualizadoPor: "Input CRM 05/10",
  },
  {
    id: "cli-4",
    nombre: "Ricardo",
    apellido: "Sosa",
    tipoDoc: "DNI",
    nroDoc: "22.118.903",
    idExterno: "CRM-099120",
    ocultoEn: ["proj-3"],
    formasContacto: [
      tel("+54 9 11 3344-9900", "Celular", true, "noContactar"),
      mail("rsosa@empresa.com.ar", true),
    ],
    infoAdicional: deuda("Préstamo prendario", "PR-112093", "$ 1.230.000", "62", "2026-08-04", "Belgrano"),
    creado: "2026-03-10T10:00:00",
    actualizado: "2026-09-28T16:45:00",
    actualizadoPor: "Agente: Juan Pérez",
  },
  {
    id: "cli-5",
    nombre: "Ana",
    apellido: "Torres",
    tipoDoc: "DNI",
    nroDoc: "40.551.238",
    idExterno: "CRM-101188",
    ocultoEn: [],
    formasContacto: [tel("+54 9 261 444-7781", "Celular", true), wa("+54 9 261 444-7781")],
    infoAdicional: deuda("Tarjeta Visa", "4509-****-7765", "$ 23.100", "5", "2026-09-30", "Mendoza"),
    creado: "2026-10-03T07:05:00",
    actualizado: "2026-10-05T07:02:00",
    actualizadoPor: "Input CRM 05/10",
  },
  {
    id: "cli-6",
    nombre: "Martín",
    apellido: "Acosta",
    tipoDoc: "CUIT",
    nroDoc: "20-27884512-3",
    idExterno: "CRM-097754",
    ocultoEn: [],
    formasContacto: [tel("+54 11 4312-5500", "Laboral", true), mail("pagos@acostayasoc.com.ar", true)],
    infoAdicional: deuda("Cuenta corriente", "CC-55120", "$ 890.450", "41", "2026-08-25", "Microcentro"),
    creado: "2026-02-14T09:30:00",
    actualizado: "2026-10-01T10:10:00",
    actualizadoPor: "Input CRM 01/10",
  },
  {
    id: "cli-7",
    nombre: "Sofía",
    apellido: "Ramírez",
    tipoDoc: "DNI",
    nroDoc: "37.664.020",
    idExterno: "CRM-100990",
    ocultoEn: [],
    formasContacto: [tel("+54 9 11 2290-1144", "Celular", true), wa("+54 9 11 2290-1144"), mail("sofi.ramirez@mail.com")],
    infoAdicional: deuda("Tarjeta Visa", "4509-****-0012", "$ 131.870", "19", "2026-09-16", "Flores"),
    creado: "2026-07-22T12:00:00",
    actualizado: "2026-10-05T07:02:00",
    actualizadoPor: "Input CRM 05/10",
  },
  {
    id: "cli-8",
    nombre: "Diego",
    apellido: "Herrera",
    tipoDoc: "DNI",
    nroDoc: "29.003.481",
    idExterno: "CRM-098431",
    ocultoEn: [],
    formasContacto: [tel("+54 9 341 600-2233", "Celular", true)],
    infoAdicional: deuda("Préstamo personal", "PP-701233", "$ 275.000", "90", "2026-07-06", "Rosario"),
    creado: "2026-04-01T09:00:00",
    actualizado: "2026-09-20T09:00:00",
    actualizadoPor: "Input CRM 20/09",
  },
  {
    id: "cli-9",
    nombre: "Valentina",
    apellido: "Medina",
    tipoDoc: "DNI",
    nroDoc: "42.118.657",
    ocultoEn: ["proj-1"],
    formasContacto: [tel("+54 9 11 7788-1200", "Celular", true), wa("+54 9 11 7788-1200"), mail("vale.medina@mail.com")],
    infoAdicional: { Plan: "Fibra 300", Antigüedad: "3 años", Segmento: "Residencial" },
    creado: "2026-08-11T15:20:00",
    actualizado: "2026-10-02T11:30:00",
    actualizadoPor: "Agente: Laura Gómez",
  },
  {
    id: "cli-10",
    nombre: "Pablo",
    apellido: "Castro",
    tipoDoc: "DNI",
    nroDoc: "33.775.902",
    ocultoEn: ["proj-1", "proj-3"],
    formasContacto: [tel("+54 9 221 400-5566", "Celular", true)],
    infoAdicional: { Plan: "Móvil 20GB", Antigüedad: "8 meses", Segmento: "Residencial" },
    creado: "2026-09-15T10:00:00",
    actualizado: "2026-09-15T10:00:00",
    actualizadoPor: "Interacción entrante",
  },
];

// Hoy en el mock: 2026-10-05.
export const interacciones: Interaccion[] = [
  { id: "int-1", clienteId: "cli-1", campaniaId: "camp-1", fecha: "2026-10-05T10:12:00", canal: "llamada", direccion: "saliente", duracion: "—", clasificacion: "No contesta", objetivoId: "obj-1" },
  { id: "int-2", clienteId: "cli-1", campaniaId: "camp-1", fecha: "2026-10-05T12:15:00", canal: "llamada", direccion: "saliente", duracion: "—", clasificacion: "Contestador", objetivoId: "obj-1" },
  { id: "int-3", clienteId: "cli-1", campaniaId: "camp-4", fecha: "2026-10-03T16:40:00", canal: "llamada", direccion: "entrante", agente: "Laura Gómez", duracion: "06:21", clasificacion: "Consulta de resumen" },
  { id: "int-4", clienteId: "cli-1", campaniaId: "camp-1", fecha: "2026-09-22T11:05:00", canal: "llamada", direccion: "saliente", agente: "Juan Pérez", duracion: "04:02", clasificacion: "Promesa de pago", objetivoId: "obj-20" },
  { id: "int-5", clienteId: "cli-2", campaniaId: "camp-2", fecha: "2026-10-04T15:30:00", canal: "whatsapp", direccion: "saliente", clasificacion: "Enviado — sin respuesta", objetivoId: "obj-2" },
  { id: "int-6", clienteId: "cli-2", campaniaId: "camp-2", fecha: "2026-10-03T10:02:00", canal: "llamada", direccion: "saliente", duracion: "—", clasificacion: "Número equivocado", objetivoId: "obj-2" },
  { id: "int-7", clienteId: "cli-3", campaniaId: "camp-1", fecha: "2026-10-05T09:40:00", canal: "llamada", direccion: "saliente", agente: "Juan Pérez", duracion: "03:15", clasificacion: "Promesa de pago", objetivoId: "obj-3" },
  { id: "int-8", clienteId: "cli-6", campaniaId: "camp-3", fecha: "2026-10-01T14:20:00", canal: "llamada", direccion: "saliente", agente: "Ana Martínez", duracion: "11:48", clasificacion: "Acepta refinanciación", objetivoId: "obj-6" },
  { id: "int-9", clienteId: "cli-7", campaniaId: "camp-1", fecha: "2026-10-04T18:10:00", canal: "whatsapp", direccion: "entrante", agente: "Juan Pérez", clasificacion: "Consulta saldo" },
  { id: "int-10", clienteId: "cli-8", campaniaId: "camp-2", fecha: "2026-09-29T10:00:00", canal: "llamada", direccion: "saliente", duracion: "—", clasificacion: "No contesta", objetivoId: "obj-8" },
  { id: "int-11", clienteId: "cli-8", campaniaId: "camp-2", fecha: "2026-09-30T10:00:00", canal: "sms", direccion: "saliente", clasificacion: "Enviado", objetivoId: "obj-8" },
  { id: "int-12", clienteId: "cli-9", campaniaId: "camp-4", fecha: "2026-10-02T11:20:00", canal: "llamada", direccion: "entrante", agente: "Laura Gómez", duracion: "08:40", clasificacion: "Reclamo técnico" },
];

export const objetivosContacto: ObjetivoContacto[] = [
  { id: "obj-1", clienteId: "cli-1", campaniaId: "camp-1", cargado: "2026-10-05T07:02:00", origen: { tipo: "crm", detalle: "Input CRM 05/10", quien: "Integración CRM" }, medios: ["llamada", "whatsapp"], desde: "2026-10-05", hasta: "2026-10-09", pasoActual: 1, estado: "enCurso" },
  { id: "obj-3", clienteId: "cli-3", campaniaId: "camp-1", cargado: "2026-10-05T07:02:00", origen: { tipo: "crm", detalle: "Input CRM 05/10", quien: "Integración CRM" }, medios: ["llamada"], desde: "2026-10-05", hasta: "2026-10-09", pasoActual: null, estado: "contactado" },
  { id: "obj-5", clienteId: "cli-5", campaniaId: "camp-1", cargado: "2026-10-05T07:02:00", origen: { tipo: "crm", detalle: "Input CRM 05/10", quien: "Integración CRM" }, medios: ["whatsapp", "llamada"], desde: "2026-10-06", hasta: "2026-10-10", pasoActual: null, estado: "programado" },
  { id: "obj-7", clienteId: "cli-7", campaniaId: "camp-1", cargado: "2026-10-05T07:02:00", origen: { tipo: "crm", detalle: "Input CRM 05/10", quien: "Integración CRM" }, medios: ["llamada", "whatsapp", "email"], desde: "2026-10-05", hasta: "2026-10-09", pasoActual: null, estado: "pendiente" },
  { id: "obj-4", clienteId: "cli-4", campaniaId: "camp-1", cargado: "2026-09-29T08:00:00", origen: { tipo: "segmentacion", detalle: "No contactados sem. 39", quien: "Sup. Carla Ruiz" }, medios: ["email"], desde: "2026-09-29", hasta: "2026-10-03", pasoActual: null, estado: "vencido" },
  { id: "obj-20", clienteId: "cli-1", campaniaId: "camp-1", cargado: "2026-09-21T07:00:00", origen: { tipo: "crm", detalle: "Input CRM 21/09", quien: "Integración CRM" }, medios: ["llamada"], desde: "2026-09-22", hasta: "2026-09-26", pasoActual: null, estado: "contactado" },
  { id: "obj-2", clienteId: "cli-2", campaniaId: "camp-2", cargado: "2026-10-03T07:00:00", origen: { tipo: "segmentacion", detalle: "Promesas incumplidas sept.", quien: "Sup. Carla Ruiz" }, medios: ["llamada", "whatsapp"], desde: "2026-10-03", hasta: "2026-10-10", pasoActual: 2, estado: "enCurso" },
  { id: "obj-8", clienteId: "cli-8", campaniaId: "camp-2", cargado: "2026-09-28T07:00:00", origen: { tipo: "crm", detalle: "Input CRM 28/09", quien: "Integración CRM" }, medios: ["llamada", "sms"], desde: "2026-09-29", hasta: "2026-10-03", pasoActual: null, estado: "noContactado" },
  { id: "obj-9", clienteId: "cli-8", campaniaId: "camp-2", cargado: "2026-10-04T10:30:00", origen: { tipo: "reprogramacion", detalle: "Reprogramado desde obj. del 28/09", quien: "Sup. Carla Ruiz" }, medios: ["llamada"], desde: "2026-10-07", hasta: "2026-10-11", pasoActual: null, estado: "programado" },
  { id: "obj-6", clienteId: "cli-6", campaniaId: "camp-3", cargado: "2026-09-30T09:00:00", origen: { tipo: "manual", detalle: "Carga manual", quien: "Sup. Carla Ruiz" }, medios: ["llamada"], desde: "2026-10-01", hasta: "2026-10-03", pasoActual: null, estado: "contactado" },
  { id: "obj-10", clienteId: "cli-2", campaniaId: "camp-1", cargado: "2026-09-15T07:00:00", origen: { tipo: "crm", detalle: "Input CRM 15/09", quien: "Integración CRM" }, medios: ["llamada"], desde: "2026-09-15", hasta: "2026-09-19", pasoActual: null, estado: "cancelado" },
];

export const estrategiasPorCampania: Record<string, PasoEstrategia[]> = {
  "camp-1": [
    {
      id: "paso-1",
      canal: "llamada",
      modo: "predictivo",
      arranque: "inmediato",
      horarioDesde: "09:00",
      horarioHasta: "20:00",
      intentos: 3,
      minutosEntreIntentos: 120,
      formasAUsar: "todasEnOrden",
      avanzaSi: ["noContesta", "ocupado", "contestador"],
      saleSi: ["Promesa de pago", "Pagó", "No llamar más"],
    },
    {
      id: "paso-2",
      canal: "whatsapp",
      modo: "plantilla",
      plantilla: "Recordatorio de deuda",
      arranque: "diaSiguiente",
      arranqueValor: "10:00",
      horarioDesde: "10:00",
      horarioHasta: "19:00",
      intentos: 1,
      minutosEntreIntentos: 0,
      formasAUsar: "principal",
      avanzaSi: ["sinRespuesta24"],
      saleSi: ["Respondió", "No llamar más"],
    },
    {
      id: "paso-3",
      canal: "llamada",
      modo: "preview",
      arranque: "horasDespues",
      arranqueValor: "48",
      horarioDesde: "09:00",
      horarioHasta: "18:00",
      intentos: 2,
      minutosEntreIntentos: 240,
      formasAUsar: "todasEnOrden",
      avanzaSi: [],
      saleSi: ["Promesa de pago", "Pagó", "No llamar más", "Número equivocado"],
    },
  ],
  "camp-2": [
    {
      id: "paso-1",
      canal: "llamada",
      modo: "progresivo",
      arranque: "inmediato",
      horarioDesde: "09:00",
      horarioHasta: "18:00",
      intentos: 2,
      minutosEntreIntentos: 180,
      formasAUsar: "principal",
      avanzaSi: ["noContesta", "contestador"],
      saleSi: ["Promesa de pago", "Pagó"],
    },
    {
      id: "paso-2",
      canal: "whatsapp",
      modo: "plantilla",
      plantilla: "Mora tardía — último aviso",
      arranque: "diaSiguiente",
      arranqueValor: "11:00",
      horarioDesde: "11:00",
      horarioHasta: "18:00",
      intentos: 1,
      minutosEntreIntentos: 0,
      formasAUsar: "principal",
      avanzaSi: [],
      saleSi: ["Respondió"],
    },
  ],
};

export const clasificacionesSalida = [
  "Promesa de pago",
  "Pagó",
  "Acepta refinanciación",
  "Respondió",
  "No llamar más",
  "Número equivocado",
];

export const condicionesAvance = ["noContesta", "ocupado", "contestador", "sinRespuesta24"] as const;

export const plantillasMensaje = [
  "Recordatorio de deuda",
  "Mora tardía — último aviso",
  "Propuesta de refinanciación",
];

// Notas del cliente: quedan en el cliente (no en una interacción puntual) para
// que el próximo agente las vea. Se cargan y se ven desde Hermes (el pad), no
// desde la ficha de Olimpo — decisión de producto 2026-10-08. Datos listos
// para cuando se mockee el pad.
export type NotaCliente = {
  id: string;
  clienteId: string;
  texto: string;
  autor: string;
  desde: "Hermes" | "Olimpo";
  fecha: string;
  fijada?: boolean;
};

export const notasClientes: NotaCliente[] = [
  { id: "nota-1", clienteId: "cli-1", texto: "Prefiere que la contacten por WhatsApp; en horario laboral no atiende llamadas.", autor: "Juan Pérez", desde: "Hermes", fecha: "2026-09-22T11:10:00", fijada: true },
  { id: "nota-2", clienteId: "cli-1", texto: "Consultó por el resumen de septiembre en Atención; quedó conforme.", autor: "Laura Gómez", desde: "Hermes", fecha: "2026-10-03T16:48:00" },
  { id: "nota-3", clienteId: "cli-4", texto: "Pidió no ser llamado al celular. Solo contacto por mail, a pedido del titular.", autor: "Sup. Carla Ruiz", desde: "Olimpo", fecha: "2026-09-28T16:50:00", fijada: true },
  { id: "nota-4", clienteId: "cli-6", texto: "Atiende el contador, Sr. Roldán. Pedir por él.", autor: "Ana Martínez", desde: "Hermes", fecha: "2026-10-01T14:35:00" },
];

export function getNotasDeCliente(clienteId: string) {
  return notasClientes
    .filter((n) => n.clienteId === clienteId)
    .sort((a, b) => Number(!!b.fijada) - Number(!!a.fijada) || b.fecha.localeCompare(a.fecha));
}

export function visibleEn(c: Cliente, proyectoId: string) {
  return !c.ocultoEn.includes(proyectoId);
}

export function getCliente(id: string) {
  return clientes.find((c) => c.id === id);
}

export function nombreCompleto(c: Cliente) {
  return `${c.nombre} ${c.apellido}`;
}

export function telefonoPrincipal(c: Cliente) {
  return (
    c.formasContacto.find((f) => f.tipo === "telefono" && f.principal) ??
    c.formasContacto.find((f) => f.tipo === "telefono")
  )?.valor;
}

export function getInteraccionesDeCliente(clienteId: string) {
  return interacciones
    .filter((i) => i.clienteId === clienteId)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export function getObjetivosDeCliente(clienteId: string) {
  return objetivosContacto
    .filter((o) => o.clienteId === clienteId)
    .sort((a, b) => b.cargado.localeCompare(a.cargado));
}

export function getObjetivosDeCampania(campaniaId: string) {
  return objetivosContacto
    .filter((o) => o.campaniaId === campaniaId)
    .sort((a, b) => b.cargado.localeCompare(a.cargado));
}

export function getInteraccionesDeObjetivo(objetivoId: string) {
  return interacciones
    .filter((i) => i.objetivoId === objetivoId)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export function esActivo(o: ObjetivoContacto) {
  return o.estado === "programado" || o.estado === "pendiente" || o.estado === "enCurso";
}

export function formatFecha(iso: string, conHora = false) {
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  const fecha = d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
  if (!conHora) return fecha;
  const hora = d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  return `${fecha} ${hora}`;
}
