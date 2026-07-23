import { cn } from "@/lib/utils";

// Wordmark "Atlas" del login — letterform tech y memorable, no un simple bold.
// Distintivo por tracking negativo marcado y un punto "vivo" primario como
// acento superíndice. El texto usa `currentColor`, así rinde legible tanto
// sobre el panel oscuro (hereda blanco) como en el branding mobile (hereda
// slate). Sin hex hardcodeado.
export function AtlasWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex select-none items-start font-sans text-8xl font-bold leading-[0.85] tracking-[-0.06em]",
        className,
      )}
    >
      <span>Atlas</span>
      {/* Acento "vivo": punto primario escalado en `em` (sigue al font-size). */}
      <span aria-hidden className="relative ml-[0.12em] mt-[0.14em] flex size-[0.13em]">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60 [animation-duration:2.4s]" />
        <span className="relative inline-flex size-full rounded-full bg-primary" />
      </span>
    </span>
  );
}
