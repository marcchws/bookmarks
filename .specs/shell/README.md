# Shell Module — Dev Guide

## Overview

Wraps all routes in `__root.tsx` with a full-chrome layout: collapsible sidebar (desktop) + fixed bottom-nav (mobile) + page header with route title and optional back arrow. No API calls — pure local UI state.

## Public exports

| Export | Path | Description |
|--------|------|-------------|
| `<AppShell />` | `src/components/layout/app-shell.tsx` | Root layout: sidebar + content column + bottom-nav; reads localStorage for sidebar state |
| `<Sidebar />` | `src/components/layout/sidebar.tsx` | Desktop nav rail; collapsible; active-link indicator; tooltip on collapsed items |
| `<BottomNav />` | `src/components/layout/bottom-nav.tsx` | Mobile fixed bar (`md:hidden`); top-border active indicator; ≥44px touch targets |
| `<PageHeader />` | `src/components/layout/page-header.tsx` | Props: `{ title, showBack? }` — Space Grotesk uppercase h1 + optional ArrowLeft back button |
| `NavItem`, `NAV_ITEMS` | `src/components/layout/nav-items.ts` | Shared nav definitions (label, to, icon, variant) |

## Route-title map

| Route | Title | showBack |
|-------|-------|----------|
| `/` | `BOOKMARKS` | false |
| `/bookmarks/new` | `NEW BOOKMARK` | false |
| `/bookmarks/$id` | `BOOKMARK DETAIL` | true |
| `/bookmarks/$id/edit` | `EDIT BOOKMARK` | true |
| `/design-system` | `DESIGN SYSTEM` | false |

## Key implementation notes

- **localStorage key:** `shell:sidebar-collapsed` (boolean string). Defaults to `false` (expanded) if unavailable.
- **Active link detection:** `useRouterState` from `@tanstack/react-router` → `router.state.location.pathname`; exact match on `/` and `/bookmarks/new`.
- **Sidebar widths:** expanded `220px`, collapsed `56px`; `transition-[width] duration-150 ease-linear motion-reduce:transition-none`.
- **Tooltip:** `@base-ui/react` Tooltip — `delay` on `Tooltip.Trigger`; target via `render` prop (no `asChild` in base-ui v1).
- **h1 demotion:** `src/routes/index.tsx` BookmarkListPage heading changed to `<h2 className="sr-only">` — shell `<PageHeader />` is the sole `<h1>` per REQ-a11y-6.

## Flags

- **Pre-existing typecheck/lint errors:** 4–5 errors in test/story files from previous modules — not introduced by shell build.
- **No MSW handlers:** shell has no API calls; no seed file needed.
- **`react-refresh/only-export-components`:** pre-existing lint warning in all route files; not a shell regression.
