# Bookmarks

A single-page bookmark manager built as a stack integration test for the full `/bootstrap → /spec → /implement → /review → /ship` workflow with Claude Code.

**[→ Live demo](https://bookmarks-three-kappa.vercel.app)** · **[→ Design system](https://bookmarks-three-kappa.vercel.app/design-system)**

---

## What it does

Save, organise, and delete URL bookmarks. Tag-based filtering, full-text search, favicon auto-fetch, and a detail view — all backed by MSW mock handlers (no real backend).

## Design

Cyber-OLED Terminal — absolute black canvas, cyan/magenta neon accents, zero-radius geometry, JetBrains Mono + Space Grotesk typography.

## Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite |
| Routing | TanStack Router v1 (file-based) |
| Server state | TanStack Query v5 |
| Styling | Tailwind v4 (CSS-first `@theme`) + shadcn base-nova |
| Mocking | MSW v2 (browser worker — runs in all environments) |
| Forms | React Hook Form + Zod v4 |
| Testing | Vitest + Testing Library + Storybook 10 |
| Deploy | Vercel |

## Dev

```bash
pnpm install
pnpm dev          # Vite dev server on :5173 — MSW starts before first render
pnpm storybook    # Storybook on :6006
pnpm test         # Vitest watch
pnpm test:run     # Vitest CI
pnpm build        # tsc -b && vite build
```

## Project structure

```
src/
  components/
    bookmarks/    # BookmarkCard, BookmarkForm, BookmarkDetail, BookmarkGrid, BookmarkSearch
    layout/       # AppShell, Sidebar, BottomNav, PageHeader
    tags/         # TagCombobox, TagFilterBar
    ui/           # shadcn primitives
  hooks/          # useBookmarks, useBookmark, useCreateBookmark, useUpdateBookmark, useDeleteBookmark, useTags
  lib/
    queries/      # MSW-backed fetch functions + TanStack Query keys
  mocks/          # MSW handlers (browser + Node server)
  routes/         # File-based routes (TanStack Router v1)
  test/           # Vitest setup
```

## Workflow artifacts

- `SRS.md` — software requirements spec
- `DESIGN.md` — design system tokens (source: Stitch "Cyber-OLED Terminal")
- `.specs/` — per-module specs (requirements, design, tasks) + visual QA screenshots
