// Regla de los campos que no se pueden repetir (ATLAS-1291, relevamiento/clonar-elementos):
// dos valores son iguales sin distinguir mayúsculas ni espacios de los extremos. Un campo
// vacío nunca cuenta como repetido.
// MOCK: compara contra los datos de ejemplo, en el navegador.
// REAL: olimpo-api valida al guardar y rechaza el repetido; el front solo adelanta el aviso.

function normalizar(valor: string) {
  return valor.trim().toLocaleLowerCase("es-AR");
}

export function seRepite(valor: string, existentes: (string | undefined)[]) {
  const buscado = normalizar(valor);
  if (!buscado) return false;
  return existentes.some((e) => e !== undefined && normalizar(e) === buscado);
}
