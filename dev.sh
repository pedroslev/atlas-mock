#!/usr/bin/env bash
# Levanta el mock del Backoffice en modo dev (hot reload) para ir viendo los
# cambios en vivo mientras se itera sobre las pantallas.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

PORT="${PORT:-3000}"

if [ ! -d node_modules ]; then
  echo "Instalando dependencias (primera vez)..."
  npm install
fi

# Libera el puerto si quedó un proceso colgado de una corrida anterior.
lsof -ti ":$PORT" | xargs -r kill 2>/dev/null || true

echo "Abrí http://localhost:$PORT"
npm run dev -- -p "$PORT"
