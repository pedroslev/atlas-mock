---
name: Atlas Backoffice
description: Consola operativa del contact center Atlas — control preciso sobre campañas, agentes y datos, con identidad institucional Mitrol.
colors:
  primary: "#0074B5"
  primary-hover: "#004468"
  secondary: "#807CDB"
  header: "#004468"
  header-foreground: "#FFFFFF"
  accent: "#C7E5EB"
  accent-foreground: "#004468"
  sidebar: "#FFFFFF"
  sidebar-accent: "#E8F4F7"
  neutral-bg: "#FFFFFF"
  neutral-fg: "#222222"
  neutral-muted: "#F1F1F1"
  neutral-muted-fg: "#6A6A6A"
  neutral-border: "#D0D0D0"
  destructive: "#D7373F"
  success: "#28A745"
  warning: "#FFC107"
  info: "#17A2B8"
typography:
  display:
    fontFamily: "Poppins, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: "1.3"
    letterSpacing: "normal"
  title:
    fontFamily: "Poppins, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: "1.375"
    letterSpacing: "normal"
  body:
    fontFamily: "Poppins, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.5"
    letterSpacing: "normal"
  label:
    fontFamily: "Poppins, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: "1.3"
    letterSpacing: "normal"
  mono:
    fontFamily: "Fira Code, monospace"
    fontSize: "0.8rem"
    fontWeight: 400
    lineHeight: "1.4"
    letterSpacing: "normal"
rounded:
  sm: "0.3rem"
  md: "0.4rem"
  lg: "0.5rem"
  xl: "0.7rem"
  2xl: "0.9rem"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-outline:
    backgroundColor: "{colors.neutral-bg}"
    textColor: "{colors.neutral-fg}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-destructive:
    backgroundColor: "#FDECED"
    textColor: "{colors.destructive}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  card:
    backgroundColor: "{colors.neutral-bg}"
    rounded: "{rounded.xl}"
    padding: "16px"
  badge-default:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "9999px"
    padding: "2px 8px"
    height: "20px"
  input:
    backgroundColor: "{colors.neutral-bg}"
    textColor: "{colors.neutral-fg}"
    rounded: "{rounded.lg}"
    height: "32px"
---

# Design System: Atlas Backoffice

## 1. Overview

**Creative North Star: "The Control Tower"**

Atlas Backoffice is where a tenant's operations team commands its contact center: campaigns, agents, contact lists, and every other operative entity. The system reads like a control tower, not a filing cabinet — clear sightlines over dense operational data, decisions made in seconds, zero visual noise competing with the information that actually matters. It borrows Mitrol's institutional blue identity (`#004468` header, `#0074B5` primary actions) without letting it slide into the density and gray fatigue of a legacy ERP: this is a modern, agile, tech-forward tool wearing an institutional uniform, not a bank-branch form system from 2009.

The system explicitly rejects two failure modes: the cramped, gray, hierarchy-less density of a legacy ERP (SAP-style tables, 30-field forms with no visual priority), and the opposite failure of a generic, unbranded shadcn/Vercel SaaS template with no Mitrol identity. Every screen should feel unmistakably Atlas — institutional blue app bar, violet focus ring, softly rounded corners — while staying as fast to scan as a modern ops dashboard.

> **Deliberate deviation (mock-only): radius bumped from the brand manual's 4px to 8px (`--radius: 0.5rem`).** The Manual de Marca's 4px is documented as canonical/non-negotiable for the real Design System (`atlas-docs/13-design-system-primitivos.md` §3), but this mock intentionally softens it to read as a modern, tech-forward/AI-first product rather than a legacy institutional console — that's the whole point of gathering early feedback before the real frontend is built. This is an **open decision**, not a silent override: reconcile with the DS owner per §9 before any real (non-mock) frontend adopts it.

**Key Characteristics:**
- Flat surfaces at rest; depth reserved for things that float above content (menus, dialogs, popovers)
- Institutional blue (`#004468`) owns the app bar; brand blue (`#0074B5`) owns primary actions; violet (`#807CDB`) is reserved for focus states and the secondary accent, never the dominant color
- Small, consistent radius (8px base for this mock, see deviation note above) everywhere — never fully rounded except pills/badges
- Dense data by default (compact 32px controls, 8-unit table rows), never padded out for decoration's sake
- Lean on real shadcn/Radix primitives for anything interactive (Command palette, Alert Dialog, Sheet, Combobox, Hover Card) instead of hand-rolled `<input>`/`<button>`/`<div>` approximations — that polish and behavioral correctness (focus trapping, keyboard nav, ARIA) is exactly what reads as "tech-forward" rather than "static mockup"

## 2. Colors

The palette is restrained and role-driven: one institutional blue owns the shell, one brand blue drives action, violet is a precision accent, and everything else is neutral gray built to disappear.

### Primary
- **Brand Blue** (`#0074B5`): primary buttons, active nav states, links, primary chart series. This is the "do the thing" color — reserve it for the single most important action on a given screen.
- **Institutional Blue** (`#004468`): the App Bar background, and the hover/active state that Brand Blue darkens into on primary buttons. This is the color of *Atlas itself*, distinct from any single action.

### Secondary
- **Precision Violet** (`#807CDB`): focus rings (2px, offset 2px) and the secondary badge/button accent. Never used for large surface fills — its job is to mark exactly where keyboard focus and selection are, nothing more.

### Neutral
- **Institutional Black** (`#222222`): all body text and headings.
- **Gray 5** (`#6A6A6A`): muted/secondary text (helper copy, table sub-labels, timestamps).
- **Gray 3** (`#D0D0D0`): default borders, input strokes, dividers.
- **Gray 1** (`#F1F1F1`): muted surface fill (disabled states, subtle section backgrounds).
- **White** (`#FFFFFF`): page background, card background, sidebar background.

### Named Rules
**The Header-Owns-Blue Rule.** Institutional Blue (`#004468`) belongs to the App Bar and to nothing else at that saturation and coverage. If a component elsewhere on the page needs "the blue," it reaches for Brand Blue (`#0074B5`) or the pale Accent tint (`#C7E5EB`), never a second solid-institutional-blue surface competing with the header.

**The Status-Color Discipline Rule.** Success (`#28A745`), Warning (`#FFC107`), Info (`#17A2B8`) and Destructive (`#D7373F`) exist only to report system/data state (campaign running, list paused, error). They never substitute for Primary or Secondary as a decorative accent.

## 3. Typography

**Display / Body Font:** Poppins (with `sans-serif` fallback)
**Label/Mono Font:** Fira Code (with `monospace` fallback), for code-like values (IDs, tokens, technical detail rows)

**Character:** A single geometric-humanist sans doing all the work, at multiple weights, rather than a display/body pairing — this keeps the interface feeling like one coherent instrument panel instead of an editorial layout. Fira Code appears only where a monospaced value earns it (IDs, timestamps in detail views).

### Hierarchy
- **Display** (600, 1.5rem, line-height 1.3): page titles in the page header component; appears once per screen.
- **Title** (500, 1rem, line-height 1.375): card titles, section headers, dialog titles.
- **Body** (400, 0.875rem, line-height 1.5): default UI text — table cells, form labels' companion text, descriptions. Cap prose blocks (help text, empty-state copy) at 65–75ch.
- **Label** (500, 0.75rem, line-height 1.3): badges, table column headers, form field labels, buttons at `sm`/`xs` size.

### Named Rules
**The One-Family Rule.** Poppins carries every text role in this system, including the page title. Weight and size create hierarchy — never introduce a second display typeface to "make it feel more designed."

## 4. Elevation

Flat by default, layered only for anything that floats above the page. Cards, table rows, and panels at rest use a 1px ring border (`ring-1 ring-foreground/10`), not a drop shadow — this keeps a data-dense screen calm instead of looking like a stack of physical cards. Depth is reserved for transient overlays: dropdown menus, popovers, and dialogs lift off the page with a shadow because they are, functionally, floating above everything else and need to read that way instantly.

### Shadow Vocabulary
- **Resting surface** (no shadow, `ring: 1px solid color-mix(foreground 10%)`): cards, table containers, the sidebar.
- **Overlay** (`box-shadow` per Radix/shadcn popover & dialog defaults): dropdown menus, popovers, command palette, dialogs. Paired with a 200ms ease-out entrance transition.

### Named Rules
**The Floats-Or-It-Doesn't Rule.** If a surface sits in the normal document flow, it gets a ring border and zero shadow. If a surface is layered on top of other content (anything rendered in a portal), it gets a shadow. There is no in-between "slightly elevated card" — that ambiguity is exactly what makes legacy ERPs feel muddy.

## 5. Components

Precise and efficient: every control is sized for scanning dense operational screens quickly, not for standalone decorative presence.

### Buttons
- **Shape:** 8px radius (`rounded-lg`, `--radius-lg: 0.5rem`) at default/large size; smaller sizes (`xs`/`sm`) round slightly tighter to stay proportional at 24–28px height.
- **Primary:** Brand Blue (`#0074B5`) background, white text, 32px height (default), 8px icon-to-label gap. Hover/active darken toward Institutional Blue (`#004468`).
- **Secondary:** Precision Violet (`#807CDB`) fill, white text — reserved for the second-priority action next to a primary (e.g. "Guardar y cerrar" next to "Guardar").
- **Outline / Ghost:** transparent or white background, gray border (outline) or none (ghost); hover fills with Gray 1 (`#F1F1F1`). Default choice for any non-primary, non-destructive action in a toolbar or row.
- **Destructive:** pale red fill (`#D7373F` at 10% opacity) with red text at rest, deepening on hover — never a solid red button; the softness is deliberate so destructive actions don't visually dominate a screen before the user commits to them.

### Chips / Badges
- **Style:** fully rounded pill (`rounded-4xl`), 20px height, 8px horizontal padding, label-weight text (500, 0.75rem).
- **State:** default variant is solid Brand Blue; secondary variant is solid Violet; outline variant is used for neutral/informational tags (e.g. entity type) where color would be noise.

### Cards / Containers
- **Corner Style:** 11px radius (`rounded-xl`, `--radius-xl: 0.7rem`) — one step softer than buttons/inputs, giving cards a slightly larger visual "container" feel.
- **Background:** white, ring-bordered (see Elevation).
- **Shadow Strategy:** none at rest; see Elevation section.
- **Border:** 1px ring at 10% foreground opacity, not a solid gray stroke — softer separation than a hard border.
- **Internal Padding:** 16px default, 12px in the compact (`size=sm`) variant used inside dense dashboard grids.

### Inputs / Fields
- **Style:** white background, Gray 3 (`#D0D0D0`) border, 8px radius, 32px height to match buttons so toolbars and forms align on a single control height.
- **Focus:** 2px Precision Violet ring with 2px offset — the single most consistent "you are here" signal across the whole system.
- **Error / Disabled:** error state swaps the border/ring to Destructive Red; disabled drops to 50% opacity with pointer-events removed, no separate disabled color token.

### Navigation
- **Style:** white sidebar (`--sidebar: #FFFFFF`) with Institutional Blue active/selected state and a pale blue hover (`#E8F4F7`); top App Bar is solid Institutional Blue with white text/icons and the Mitrol eagle isologo (never the app name in text). The top-right app switcher (Google Workspace–style grid) moves between Backoffice, Pad, and any other app the user's role can access.

## 6. Do's and Don'ts

### Do:
- **Do** keep the App Bar solid Institutional Blue (`#004468`) — it's the one fixed anchor of Atlas identity across every screen and every frontend (Backoffice, Pad).
- **Do** use the 2px Precision Violet focus ring (`#807CDB`, 2px offset) as the only focus treatment in the system — never substitute a generic blue outline.
- **Do** keep resting surfaces flat (ring border, no shadow) and reserve shadows strictly for portal-rendered overlays (dropdown, popover, dialog).
- **Do** size interactive controls (buttons, inputs, badges) to align on shared heights (32px default) so toolbars and forms read as one calm row, not a jumble of mismatched control sizes.
- **Do** keep every wireframe scoped to a single tenant's data (Banco Sur) — never mix tenant names or campaigns in the same mock.
- **Do** use real shadcn/Radix primitives for anything that looks interactive: `Command` (cmdk) for search/Cmd+K, `AlertDialog` for any destructive confirmation, `Sheet` for off-canvas panels, `Combobox` (Popover+Command) for long selects, `HoverCard` for rich previews. A hand-rolled `<input>` or plain `<div>` standing in for one of these is the "static mockup" tell this system explicitly avoids.
- **Do** wrap every table in the same ring-bordered container the `Card` primitive uses (`ring-1 ring-foreground/10`, `rounded-xl`) — never a plain Tailwind `border`.
- **Do** give every card/section title a real heading level (`h2`/`h3`) via `CardTitle`'s heading prop — visual style stays the Title token regardless of level.

### Don't:
- **Don't** build cramped, gray, hierarchy-less tables or 30-field forms with no visual priority — the "dense old ERP" anti-reference this system explicitly rejects.
- **Don't** ship an unstyled or default-shadcn look — Institutional Blue, Brand Blue, and Precision Violet are load-bearing identity, not swappable theme decoration.
- **Don't** use a solid red button for destructive actions; destructive stays a pale red fill until the user is in a confirmation state.
- **Don't** introduce a second display typeface or a serif pairing — Poppins carries every role, including page titles.
- **Don't** add a drop shadow to a resting card or table row; if it's not in a portal, it doesn't float.
- **Don't** hardcode a hex value in a component — every color must resolve through the Mitrol shadcn tokens.
