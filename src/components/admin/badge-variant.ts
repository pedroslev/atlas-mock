import type { badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";

// Variante tonal del Badge (default | secondary | destructive | outline |
// ghost | link | success | warning | info | neutral). Se usa para diferenciar
// regiones y estados por token, nunca por hex crudo (DESIGN.md).
export type BadgeVariant = NonNullable<
  VariantProps<typeof badgeVariants>["variant"]
>;
