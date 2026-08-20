import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite acceder al dev server desde otras máquinas de la LAN.
  allowedDevOrigins: ["192.168.1.96"],
  // Evita que Turbopack infiera la raíz del workspace hacia arriba (hay otro
  // package-lock.json suelto en la raíz del repo de documentación).
  turbopack: {
    root: path.join(__dirname),
  },
  // El indicador de Next (solo dev, nunca en producción) por defecto va
  // abajo a la izquierda — justo donde el pad tiene "Mi turno"/"Historial"
  // en el menú lateral, y los tapaba.
  devIndicators: {
    position: "bottom-right",
  },
};

export default nextConfig;
