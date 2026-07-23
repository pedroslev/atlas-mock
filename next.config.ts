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
};

export default nextConfig;
