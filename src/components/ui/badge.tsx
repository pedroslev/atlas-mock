import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
        // Tonos suaves para diferenciar tipos/estados en tablas (feedback
        // 2026-07-16: "distintos colores si son diferentes"). Resuelven por
        // los tokens de estado semánticos (§3: success #22C55E, warning
        // #F59E0B, info #3B82F6, destructive #EF4444), nunca hex crudo. En
        // light el texto se oscurece sobre el tint para mantener contraste AA;
        // en dark se aclara sobre la superficie slate.
        success:
          "border-transparent bg-success/15 text-[color-mix(in_oklab,var(--success),black_32%)] dark:bg-success/20 dark:text-[color-mix(in_oklab,var(--success),white_35%)]",
        warning:
          "border-transparent bg-warning/18 text-[color-mix(in_oklab,var(--warning),black_45%)] dark:bg-warning/20 dark:text-warning",
        info: "border-transparent bg-info/15 text-[color-mix(in_oklab,var(--info),black_28%)] dark:bg-info/20 dark:text-[color-mix(in_oklab,var(--info),white_35%)]",
        neutral: "border-border bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
