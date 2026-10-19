// Causas de corte Q.850 → tipificaciones de sistema (propuesta 2026-10-16,
// relevamiento/criterios-recontacto; fuente: hoja CRITERIOS del sheet "DB
// ATLAS"). A validar con Pedro.
//
// Cada carrier informa por qué terminó una llamada con un código Q.850. Mitrol
// define desde Zeus qué tipificación de sistema le corresponde a cada código
// (igual para todos los tenants y, por ahora, para todos los carriers; el
// tenant no lo ve). Los códigos
// sin tipificación no afectan al contacto: se descartan o son alertas de
// operación (problemas de carrier o de configuración).
//
// "Contestador automático" no aparece acá: no viene de un código Q.850, lo
// detecta el discador.

export type CausaQ850 = {
  codigo: number;
  nombre: string;
  explicacion: string;
};

export const causasQ850: CausaQ850[] = [
  { codigo: 0, nombre: "Causa no recibida", explicacion: "La llamada se cortó sin que la red informara el motivo." },
  { codigo: 1, nombre: "Número no asignado", explicacion: "El número tiene formato válido pero no está asignado a nadie." },
  { codigo: 2, nombre: "Sin ruta a la red de tránsito", explicacion: "La red no tiene ruta hacia la red intermedia." },
  { codigo: 3, nombre: "Sin ruta al destino", explicacion: "La red no encuentra cómo llegar al número, aunque esté bien formado." },
  { codigo: 4, nombre: "Tono de información especial", explicacion: "La red avisa que el número no es válido o no está en servicio." },
  { codigo: 5, nombre: "Prefijo de troncal mal marcado", explicacion: "Se marcó un prefijo de troncal incorrecto." },
  { codigo: 6, nombre: "Canal inaceptable", explicacion: "El canal propuesto no es aceptable para el equipo que recibe." },
  { codigo: 7, nombre: "Llamada entregada en canal establecido", explicacion: "No es un error: la llamada se entrega por un canal en uso." },
  { codigo: 8, nombre: "Prefijo 0 no permitido", explicacion: "El abonado no tiene permiso para usar el prefijo 0." },
  { codigo: 9, nombre: "Prefijo 1 no permitido", explicacion: "El abonado no tiene permiso para usar el prefijo 1." },
  { codigo: 10, nombre: "Prefijo 1 no requerido", explicacion: "Se marcó el prefijo 1 cuando no hacía falta." },
  { codigo: 11, nombre: "Más dígitos de los permitidos", explicacion: "Sobran dígitos, pero la llamada sigue." },
  { codigo: 16, nombre: "Corte normal", explicacion: "Uno de los dos lados colgó. Es el corte más común." },
  { codigo: 17, nombre: "Usuario ocupado", explicacion: "El destino está ocupado en otra llamada." },
  { codigo: 18, nombre: "Usuario no responde", explicacion: "El destino fue alertado pero no contestó a tiempo." },
  { codigo: 19, nombre: "Sin respuesta del usuario", explicacion: "Sonó y nadie atendió antes de que venciera el tiempo." },
  { codigo: 20, nombre: "Abonado ausente", explicacion: "Desconectado o no localizable: celular apagado o sin cobertura." },
  { codigo: 21, nombre: "Llamada rechazada", explicacion: "El destino rechazó la llamada o un filtro la bloqueó." },
  { codigo: 22, nombre: "Número cambiado", explicacion: "El número ya no está en uso y fue reemplazado por otro." },
  { codigo: 23, nombre: "Cobro revertido rechazado", explicacion: "El destino no aceptó una llamada con cobro revertido." },
  { codigo: 24, nombre: "Llamada suspendida", explicacion: "La llamada quedó en espera a nivel de red." },
  { codigo: 25, nombre: "Llamada reanudada", explicacion: "Se retomó una llamada suspendida." },
  { codigo: 26, nombre: "Corte de usuario no seleccionado", explicacion: "Otro usuario candidato atendió primero." },
  { codigo: 27, nombre: "Destino fuera de servicio", explicacion: "El equipo de destino no está operativo." },
  { codigo: 28, nombre: "Formato de número inválido", explicacion: "El número está incompleto o mal formado." },
  { codigo: 29, nombre: "Facilidad rechazada", explicacion: "La red no brinda el servicio suplementario pedido." },
  { codigo: 30, nombre: "Respuesta a consulta de estado", explicacion: "Respuesta del protocolo; no es un corte real." },
  { codigo: 31, nombre: "Normal sin especificar", explicacion: "Terminación normal sin motivo más específico." },
  { codigo: 33, nombre: "Circuito fuera de servicio", explicacion: "Un circuito necesario no está operativo." },
  { codigo: 34, nombre: "Sin circuito o canal disponible", explicacion: "Troncal llena: no hay canal libre." },
  { codigo: 35, nombre: "Destino inalcanzable", explicacion: "No se puede llegar al destino por un problema temporal." },
  { codigo: 37, nombre: "Servicio degradado", explicacion: "La red opera con calidad reducida." },
  { codigo: 38, nombre: "Red fuera de servicio", explicacion: "La red del carrier está caída." },
  { codigo: 39, nombre: "Retardo de tránsito no alcanzable", explicacion: "La red no cumple el retardo pedido." },
  { codigo: 40, nombre: "Caudal no alcanzable", explicacion: "La red no garantiza el caudal pedido." },
  { codigo: 41, nombre: "Falla temporal", explicacion: "Fallo momentáneo de la red; se puede reintentar enseguida." },
  { codigo: 42, nombre: "Congestión del conmutador", explicacion: "El equipo del carrier está saturado." },
  { codigo: 43, nombre: "Información de acceso descartada", explicacion: "Se descartó información de acceso; la llamada sigue." },
  { codigo: 44, nombre: "Canal solicitado no disponible", explicacion: "El canal específico pedido no está libre." },
  { codigo: 45, nombre: "Llamada desalojada", explicacion: "Cortada para dar prioridad a otra (uso militar o de emergencia)." },
  { codigo: 46, nombre: "Llamada de precedencia bloqueada", explicacion: "No había recurso de precedencia disponible." },
  { codigo: 47, nombre: "Recurso no disponible", explicacion: "Falta algún recurso, sin motivo más concreto." },
  { codigo: 49, nombre: "Calidad de servicio no disponible", explicacion: "La red no brinda la calidad pedida." },
  { codigo: 50, nombre: "Facilidad no contratada", explicacion: "Se pidió un servicio que el contrato no incluye." },
  { codigo: 51, nombre: "Cobro revertido no permitido", explicacion: "El abonado no tiene habilitado el cobro revertido." },
  { codigo: 52, nombre: "Llamadas salientes bloqueadas", explicacion: "La cuenta del carrier tiene bloqueado el saliente." },
  { codigo: 53, nombre: "Salientes bloqueadas en grupo cerrado", explicacion: "Bloqueo dentro de un grupo cerrado de usuarios." },
  { codigo: 54, nombre: "Llamadas entrantes bloqueadas", explicacion: "El destino tiene bloqueadas las llamadas entrantes." },
  { codigo: 55, nombre: "Entrantes bloqueadas en grupo cerrado", explicacion: "El destino no acepta llamadas dentro de su grupo cerrado." },
  { codigo: 56, nombre: "Llamada en espera no contratada", explicacion: "El abonado no tiene llamada en espera." },
  { codigo: 57, nombre: "Capacidad de portador no autorizada", explicacion: "Tipo de llamada (codec o media) no autorizado para la cuenta." },
  { codigo: 58, nombre: "Capacidad de portador no disponible", explicacion: "Tipo de llamada soportado pero no disponible ahora." },
  { codigo: 63, nombre: "Servicio no disponible", explicacion: "El servicio pedido no está disponible, sin más detalle." },
  { codigo: 65, nombre: "Servicio de portador no implementado", explicacion: "La red no soporta el tipo de llamada pedido." },
  { codigo: 66, nombre: "Tipo de canal no implementado", explicacion: "La red no soporta el tipo de canal pedido." },
  { codigo: 69, nombre: "Facilidad no implementada", explicacion: "La red no implementa el servicio pedido." },
  { codigo: 79, nombre: "Servicio no implementado", explicacion: "El servicio no está implementado, sin más detalle." },
  { codigo: 81, nombre: "Referencia de llamada inválida", explicacion: "Error de protocolo de la troncal." },
  { codigo: 88, nombre: "Destino incompatible", explicacion: "Del otro lado hay un fax o un módem." },
  { codigo: 90, nombre: "Falta dirección de destino", explicacion: "Se intentó llamar sin número." },
  { codigo: 95, nombre: "Mensaje inválido", explicacion: "Mensaje de señalización inválido." },
  { codigo: 96, nombre: "Falta elemento obligatorio", explicacion: "Mensaje de señalización incompleto." },
  { codigo: 97, nombre: "Tipo de mensaje no implementado", explicacion: "Mensaje de señalización desconocido." },
  { codigo: 99, nombre: "Elemento de información inexistente", explicacion: "Campo desconocido; la llamada sigue." },
  { codigo: 100, nombre: "Contenido de elemento inválido", explicacion: "Un campo llegó con valor inválido." },
  { codigo: 101, nombre: "Mensaje incompatible con el estado", explicacion: "El mensaje no corresponde al estado de la llamada." },
  { codigo: 102, nombre: "Vencimiento de temporizador", explicacion: "El otro lado dejó de responder (timeout)." },
  { codigo: 111, nombre: "Error de protocolo", explicacion: "Error de protocolo sin más detalle." },
  { codigo: 127, nombre: "Interfuncionamiento sin especificar", explicacion: "La red no pudo traducir el motivo real del corte." },
];

/** Código Q.850 → id de la tipificación de sistema (sólo los vinculados). */
export type MapeoCausas = Record<number, string>;

// Mapeo por defecto: las causas "verdes" de la hoja CRITERIOS. Quedaron
// afuera a propósito 2 y 3 (problemas de carrier o de carga del dato) y 4
// (en duda: equivale a la 1).
export const mapeoPorDefecto: MapeoCausas = {
  1: "sys-inexistente",
  17: "sys-ocupado",
  18: "sys-no-contesta",
  19: "sys-no-contesta",
  20: "sys-apagado",
  21: "sys-rechazada",
  22: "sys-cambiado",
  27: "sys-apagado",
  28: "sys-inexistente",
  35: "sys-apagado",
  54: "sys-no-acepta",
  88: "sys-fax",
};

