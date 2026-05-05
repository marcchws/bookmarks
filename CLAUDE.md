# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project — Bookmarks

A single-page bookmark manager (save, organise, delete URL bookmarks). Stack integration test for the full `/bootstrap → /spec → /implement → /review → /ship` workflow.

## Commands

```bash
pnpm dev              # Vite dev server (port 5173) — MSW browser worker starts before app renders
pnpm build            # tsc -b && vite build
pnpm typecheck        # tsc -b --noEmit
pnpm lint             # eslint .
pnpm format           # prettier --write .
pnpm test:run         # Vitest (jsdom project, no browser, CI-safe)
pnpm test             # Vitest watch mode
pnpm storybook        # Storybook dev server (port 6006)
pnpm storybook:build  # Storybook static build (used as quality gate)
```

Run a single test file:
```bash
pnpm exec vitest run src/path/to/file.test.tsx
```

Run only the jsdom project (skips Storybook/browser tests):
```bash
pnpm exec vitest run --project=default
```

Regenerate route tree after adding/removing route files:
```bash
pnpm exec tsr generate
```

Add a shadcn component:
```bash
pnpm dlx shadcn@latest add <component>
```

## Architecture

### Entry point & providers

`src/main.tsx` bootstraps in this order:
1. `enableMocking()` — awaits MSW `worker.start()` before mounting (DEV only). This guarantees all `fetch()` calls are intercepted from the first render.
2. `QueryClientProvider` wraps the entire tree.
3. `RouterProvider` renders the TanStack Router.
4. `ReactQueryDevtools` and `TanStackRouterDevtools` mount in DEV only.

### Routing

File-based routing under `src/routes/`. Every route file exports a `Route` constant via `createFileRoute("/<path>")`. The generated `src/routeTree.gen.ts` is committed and must be regenerated after structural changes (`pnpm exec tsr generate`). The Vite plugin (`tanstackRouter`) handles this automatically during `pnpm dev`.

Route files follow the TanStack Router v1 file convention: `index.tsx` → `/`, `$id.tsx` → `/:id`, `_layout.tsx` → layout routes.

### Server state

`src/lib/queryClient.ts` exports a singleton `QueryClient` with global defaults (`staleTime: 60_000`, `retry: 1`). Override per-query using `useQuery({ staleTime: ... })`. Per-resource stale times from the SRS: bookmarks = 30 s, tags = 5 min.

### Mocking (MSW v2)

- `src/mocks/handlers.ts` — single source of truth for all HTTP handlers. Add feature handlers here.
- `src/mocks/browser.ts` — browser worker (dev + Storybook).
- `src/mocks/server.ts` — Node server (Vitest).
- `src/test/setup.ts` — calls `server.listen({ onUnhandledRequest: "error" })` so unhandled requests fail tests loudly.

### Styling

Tailwind v4 CSS-first config via `@theme inline` block in `src/index.css`. No `tailwind.config.js`. Token-only rule: no raw hex/px/radius outside `@theme`. Dark mode uses the `.dark` class (`@custom-variant dark (&:is(.dark *))`).

shadcn style is `base-nova` (neutral base color, CSS variables). Components live in `src/components/ui/`. The `src/components/ui/` directory is excluded from ESLint (shadcn-generated; not owned code).

### Testing

`vitest.config.ts` defines two projects:
- **default** (jsdom) — co-located `*.test.tsx` files, uses MSW Node server from setup.
- **storybook** (Chromium via Playwright) — runs stories as tests via `@storybook/addon-vitest`.

`pnpm test:run` runs both projects. For CI or quick iteration, use `--project=default` to skip the browser project.

### Storybook

Stories co-located with components as `*.stories.tsx`. MSW is wired into Storybook via `msw-storybook-addon` in `.storybook/preview.tsx` — the same `handlers` array from `src/mocks/handlers.ts` is the default for all stories.

## Design system

Visual identity: `DESIGN.md` at project root (source: Stitch — "Cyber-OLED Terminal").
Component HTML references: `.specs/stitch/` (see `index.md` for index).

**Every agent must read `DESIGN.md` in full before any visual implementation.**

## Workflow

See `~/.claude/CLAUDE.md` for the full feature workflow. After bootstrap:
1. `/spec --srs SRS.md` — generates `.specs/design-system-brief.md` + module specs
2. Take `.specs/design-system-brief.md` to Stitch → create the design system (manual)
3. `/personalize "Bookmarks"` — wires design tokens into `src/index.css`

Workflow artifacts: `.specs/` (committed, except `*/visual-qa/`), `logs/` (gitignored).
