# Formateur AI — Frontend **V2** (Neo-Brutalist)

A second, visually redesigned front-end for **Formateur AI** — same Angular 21 app, same features,
same .NET 8 backend, but a **completely different look**: neo-brutalist.

> V1 (`../frontend`) = vibrant purple gradients + glassmorphism.
> **V2 (this) = neo-brutalist**: flat bold colours, thick ink borders, hard offset shadows,
> chunky grotesque type (Space Grotesk + Space Mono), a warm paper background with a dot grid.

Everything else is identical to V1 — routing, services, auth, admin, the live Anam.ai avatar, and the
`environment.useMockData` switch. Only the **visual layer** changed (design tokens, layouts, and
component styles).

## Run

```bash
npm install        # already installed if you received node_modules
npm start          # ng serve → http://localhost:4201   (V1 uses 4200, so both can run at once)
```

By default `ng serve` uses the real API (`environment.development.ts` → `useMockData: false`); make
sure the backend is running, or set `useMockData: true` to run standalone on seed data.

## Build

```bash
ng build --configuration development
ng build --configuration production   # compiles clean within budgets
```

## What changed vs V1

| Area | V1 | V2 |
|------|----|----|
| Palette | purple/violet/pink gradients | flat electric-blue / coral / lime / yellow + ink |
| Surfaces | glassmorphism, soft shadows, blur | solid panels, **2–3px ink borders**, **hard offset shadows** |
| Cards | rounded, gradient covers, lift on hover | bordered, flat colour covers, **translate + grow-shadow** on hover |
| Type | Sora + Inter | **Space Grotesk** (display) + **Space Mono** (labels) + Inter |
| Background | radial gradient glows | warm paper + **dot grid** |
| Buttons | soft filled | chunky bordered, press/pop interaction |

The design lives almost entirely in [`src/styles.scss`](src/styles.scss) (tokens + utility classes +
Material overrides) plus per-component style tweaks — the same CSS-variable names as V1 are reused
with neo-brutalist values, so the whole app re-skins from the design system.

See the [root README](../README.md) for the full stack, backend, and API integration.
