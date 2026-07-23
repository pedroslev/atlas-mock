"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Kbd } from "@/components/ui/kbd";
import { ConnectionMotif } from "@/components/auth/connection-motif";
import { AtlasWordmark } from "@/components/auth/atlas-wordmark";
import { useT } from "@/lib/i18n";

// Pantalla de login de Atlas (Mitrol). SOLO visual: no valida credenciales ni
// pega a ninguna API. "Ingresar" navega al backoffice con un <Link>.
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const t = useT();

  return (
    <div className="grid min-h-full lg:grid-cols-[1.15fr_1fr]">
      {/* ── Panel de marca (desktop) — fondo oscuro premium mitrol-dark. ── */}
      <aside className="relative hidden overflow-hidden bg-header text-header-foreground lg:flex lg:flex-col lg:justify-between lg:p-16">
        {/* Motivo tech: grilla + constelación de nodos/conexiones. */}
        <ConnectionMotif className="pointer-events-none absolute inset-0 size-full" />
        {/* Profundidad: glows de marca (acento primario + luz fría) con blur, y
            un velo vertical que asienta el contenido sobre el fondo. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-48 size-[34rem] rounded-full bg-primary/25 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-48 -left-32 size-[30rem] rounded-full bg-white/[0.05] blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-header via-transparent to-header/40"
        />

        {/* Header del panel: logo Mitrol grande. */}
        <div className="relative flex items-center">
          <Image
            src="/brand/logo-mitrol-aguila-roja.png"
            alt="Mitrol"
            width={1200}
            height={675}
            className="h-20 w-auto drop-shadow-xl xl:h-24"
            priority
          />
        </div>

        {/* Centro: wordmark Atlas (letterform tech) + mensaje punchy. */}
        <div className="relative flex max-w-xl flex-col gap-8">
          <div className="relative">
            {/* Halo por token detrás del wordmark, para dar profundidad. */}
            <div
              aria-hidden
              className="pointer-events-none absolute -left-6 top-1/2 size-72 -translate-y-1/2 rounded-full bg-primary/20 blur-[90px]"
            />
            <AtlasWordmark className="relative" />
          </div>

          {/* Regla de acento sutil, degradé por token. */}
          <span
            aria-hidden
            className="h-px w-20 bg-gradient-to-r from-primary via-primary/50 to-transparent"
          />

          <div className="flex flex-col gap-3">
            <p className="text-4xl font-semibold leading-[1.05] tracking-tight text-header-foreground xl:text-[2.75rem]">
              {t("login.marca.tagline")}
              <span className="text-primary">.</span>
            </p>
            <p className="max-w-md text-base leading-relaxed text-header-foreground/55">
              {t("login.marca.bajada")}
            </p>
          </div>
        </div>

        {/* Pie: firma discreta que asienta la composición. */}
        <div className="relative font-mono text-xs tracking-wide text-header-foreground/40">
          © {new Date().getFullYear()} Mitrol
        </div>
      </aside>

      {/* ── Columna del formulario. ── */}
      <main className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          {/* Branding compacto para mobile (el panel de marca está oculto). */}
          <div className="mb-10 flex flex-col items-start gap-4 lg:hidden">
            <Image
              src="/brand/logo-mitrol-aguila-roja.png"
              alt="Mitrol"
              width={1200}
              height={675}
              className="h-16 w-auto"
              priority
            />
            <div className="flex flex-col gap-1">
              <AtlasWordmark className="text-4xl" />
              <p className="text-sm font-medium text-muted-foreground">
                {t("login.marca.tagline")}
                <span className="text-primary">.</span>
              </p>
            </div>
          </div>

          <div className="mb-8 flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
              {t("login.kicker")}
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {t("login.titulo")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("login.descripcion")}
            </p>
          </div>

          <form className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">{t("login.email")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={t("login.emailPlaceholder")}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("login.password")}</Label>
                <Link
                  href="/login"
                  className="text-sm text-primary hover:underline"
                >
                  {t("login.passwordOlvidada")}
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                  aria-label={
                    showPassword
                      ? t("login.passwordOcultar")
                      : t("login.passwordMostrar")
                  }
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="recordarme" />
              <Label htmlFor="recordarme" className="font-normal">
                {t("login.recordarme")}
              </Label>
            </div>

            {/* SOLO visual: navega al backoffice, sin lógica de credenciales. */}
            <Button asChild className="group w-full">
              <Link href="/">
                {t("login.ingresar")}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </form>

          <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
            <p className="font-mono text-xs text-muted-foreground">
              © {new Date().getFullYear()} Mitrol · Atlas
            </p>
            <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
              {t("login.enviarCon")} <Kbd>↵</Kbd>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
