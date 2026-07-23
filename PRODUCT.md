# Product

## Register

product

## Platform

web

## Users

Two staff groups of the tenant (never the tenant's own end customers) share the Atlas contact-center platform. **Agentes** work the **Pad**, the console used to handle live voice/chat/omnichannel interactions with the final customer — answering calls, changing ACD status, tipifying interactions, using bookmarks. **Supervisores y administradores operativos** work the **Backoffice**, configuring campaigns, agents, projects, accounts, contact lists, classifications, working groups, and the rest of the operative entities that the Pad depends on. Both groups are equally primary: the Backoffice has no value without agents working the Pad, and the Pad has no campaigns to work without the Backoffice.

## Product Purpose

Atlas replaces Mitrol's legacy, technically fragmented contact-center stack with a single coherent platform where a tenant runs their entire operation — from configuring a campaign to answering the call it generates — without leaving one coherent product. The Backoffice and Pad are two frontends of that same product, sharing authentication, design tokens, and an app switcher, so a supervisor and an agent never feel like they're using apps built by different teams.

**This repo is a visual mock, not the product.** There is no API, no backend, no real state — every screen runs on static/mock data (`src/lib/mock-data.ts`) with no real persistence, auth, or business logic behind it. The explicit goal is a first navigable version of the Atlas visual language to gather product feedback fast and iterate on it cheaply. Once a screen's design settles, a separate frontend engineering effort rebuilds it for real (wired to the actual API, with real state, validation, and edge-case handling) — this repo is their starting reference, not code they extend in place. Practically: prioritize visual fidelity, IA, and interaction *feel* (states like hover/focus/selected can be mocked with local component state) over anything that implies real backend behavior (no real persistence, no real async loading/error states from a network, no auth). Don't build out backend-shaped scaffolding (loading skeletons for real fetches, form submission handlers, API error boundaries) that has no server behind it to justify it.

## Product Naming

Product-facing app names (as of 2026-07-16 feedback round): the Backoffice is branded **Olimpo** (where the operation is controlled from — Mount Olympus), the Pad is branded **Hermes** (mythological messenger, fitting the agent handling live interactions). "Backoffice" and "Pad" remain the internal/technical names used in code, folder names, and this document; **Olimpo**/**Hermes** are what users see in the UI (tab title, app switcher, sidebar header). Don't rename the repo or route folders — only user-visible copy.

## Positioning

One coherent console for the whole contact-center operation, not a set of "cousin" apps that happen to share a login screen.

## Brand Personality

Modern, agile, tech-forward — closer to a sharp SaaS product than to a heavy legacy enterprise console, while still carrying Mitrol's institutional blue/violet identity. Confident and efficient in tone, never playful or decorative for its own sake.

## Anti-references

Must not look or feel like a dense, dated ERP (SAP-style cramped gray tables, 30-field forms with no hierarchy, legacy iconography). Equally, must not look like a generic, unbranded shadcn/Vercel SaaS template — the Mitrol institutional blue (`#004468`), secondary violet (`#807CDB`), and 4px radius are load-bearing identity, not optional theming.

## Design Principles

- **Tool-first**: every action a user can take in the UI must exist as a documented API tool first — the UI is just another client of that API, same as an AI agent would be.
- **One product, not two apps**: Pad and Backoffice must never visually or behaviorally diverge — same app switcher (top-right, Google Workspace–style grid), same auth, same design tokens.
- **Single-tenant realism in every mock**: wireframes are drawn from the perspective of one tenant (Banco Sur) at a time; never mix names or data from other tenants in the same screen.
- **Zero hardcoded styling**: color, spacing, and radius always resolve through the Mitrol shadcn tokens (see `atlas-docs/13-design-system-primitivos.md`); no ad-hoc hex values in components.
- **Screen contracts are already decided**: table row-action menus, campaign edit tabs, and similar per-screen contracts are specified in `fronted/README.md` — follow them rather than improvising new patterns.

## Accessibility & Inclusion

Target WCAG 2.1 AA as the working bar for contrast, focus states, and keyboard navigation, even though this is currently a wireframe/mock stage rather than production code.
