import type { Metadata } from "next";
import { Poppins, Fira_Code } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const firaCode = Fira_Code({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Olimpo - Mitrol",
  description: "Mock navegable de Olimpo, el backoffice de Atlas, con datos de prueba.",
  icons: {
    icon: "/brand/logo-mitrol-aguila-roja.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${poppins.variable} ${firaCode.variable} h-full antialiased`}
      // El script anti-flash de tema agrega "dark" antes de hidratar — el
      // mismatch resultante es esperado (patrón estándar next-themes-style).
      suppressHydrationWarning
    >
      <head>
        {/* Lee el tema guardado antes del primer paint para evitar flash de tema incorrecto. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('atlas-theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body className="flex h-full flex-col">
        <AppRouterCacheProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
