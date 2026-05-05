# Shell — Design

## Overview

The shell module replaces the bare `<Outlet />` in `__root.tsx` with a full-chrome layout component. It introduces a collapsible sidebar (desktop) and a fixed bottom-nav (mobile) without touching any existing route files. All layout components live in `src/components/layout/`.

## Architecture

```
src/
├── routes/
│   └── __root.tsx                  # Updated: renders <AppShell> wrapping <Outlet />
├── components/layout/
│   ├── app-shell.tsx               # Root composition: sidebar + content column + bottom-nav
│   ├── sidebar.tsx                 # Desktop nav rail; consumes nav-items.ts
│   ├── bottom-nav.tsx              # Mobile fixed bar; consumes nav-items.ts
│   ├── page-header.tsx             # h1 title + optional back arrow; rendered inside app-shell
│   └── nav-items.ts                # Shared nav-item definitions (label, icon, to, variant)
```

## Components & interfaces

### `<AppShell />`
- Path: `src/components/layout/app-shell.tsx`
- Props: `{ children: React.ReactNode }`
- Layout: flex-row on `md`+; single column on mobile. Mounts `<Sidebar />`, `<PageHeader />`, `<BottomNav />`, and `<Outlet />` (children).
- Reads `localStorage` key `shell:sidebar-collapsed` on mount to initialise sidebar state.
- Tokens used: `--color-background`, `--color-surface`, `--color-outline`, `--spacing-unit`

### `<Sidebar />`
- Path: `src/components/layout/sidebar.tsx`
- Props: `{ collapsed: boolean; onToggle: () => void }`
- States: expanded (width 220px) · collapsed/rail (width 56px) · link default · link active (`aria-current="page"`, left border `--color-outline-active`) · link hover (neon glow) · link focus-visible · collapsed-link tooltip on hover
- Transition: `width` 150ms linear; `motion-reduce:transition-none`
- Tokens used: `--color-surface`, `--color-outline`, `--color-outline-active`, `--color-primary`, `--color-on-surface-variant`, `--color-on-surface`

### `<BottomNav />`
- Path: `src/components/layout/bottom-nav.tsx`
- Props: none (reads router state internally)
- States: link default · link active (top border `--color-outline-active`, icon + label in `--color-primary`) · link focus-visible
- Rendered only below `md` via `md:hidden`.
- Tokens used: `--color-surface`, `--color-outline`, `--color-outline-active`, `--color-primary`

### `<PageHeader />`
- Path: `src/components/layout/page-header.tsx`
- Props: `{ title: string; showBack?: boolean }`
- States: with back arrow · without back arrow
- Back arrow: Lucide `ArrowLeft`; `aria-label="Back to bookmarks list"`; navigates to `/` via `useNavigate`.
- Tokens used: `--color-surface`, `--color-outline`, `--color-on-surface`, `--color-on-surface-variant`

### `nav-items.ts`
- Path: `src/components/layout/nav-items.ts`
- Exports: `NAV_ITEMS` — `Array<{ label: string; to: string; icon: LucideIcon; variant: "default" | "primary" }>`
- Items: `{ label: "Bookmarks", to: "/", icon: BookmarkIcon, variant: "default" }`, `{ label: "New Bookmark", to: "/bookmarks/new", icon: PlusIcon, variant: "primary" }`

## Route-title map

| Route pattern | Title | showBack |
|---|---|---|
| `/` | `BOOKMARKS` | false |
| `/bookmarks/new` | `NEW BOOKMARK` | false |
| `/bookmarks/$id` | `BOOKMARK DETAIL` | true |
| `/bookmarks/$id/edit` | `EDIT BOOKMARK` | true |
| `/design-system` | `DESIGN SYSTEM` | false |

`<AppShell />` derives title and showBack by matching `router.state.location.pathname` against the map at render time.

## Data models

No server state. Shell is pure local UI state.

```typescript
interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  variant: "default" | "primary";
}
```

Sidebar collapsed state: `boolean` via `useState`, initialised from `localStorage`.

## Error handling

No async data — no error states. If `localStorage` is unavailable (private mode), default to `collapsed: false` silently.

## Public exports

- `<AppShell />` — `src/components/layout/app-shell.tsx`
- `<Sidebar />` — `src/components/layout/sidebar.tsx`
- `<BottomNav />` — `src/components/layout/bottom-nav.tsx`
- `<PageHeader />` — `src/components/layout/page-header.tsx`
- `NAV_ITEMS` — `src/components/layout/nav-items.ts`

## Decisions

- **Layout in `__root.tsx`, not a layout route file.** All routes already hang from `__root`; inserting a `_layout.tsx` would require route restructuring. Wrapping `<Outlet />` in `__root.tsx` is zero-disruption.
- **Route-title map instead of per-route `meta`.** TanStack Router v1 `meta` requires each route file to declare its title; mutating those files is out of scope. A pathname-keyed map in `<AppShell />` keeps shell self-contained.
- **`localStorage` for sidebar state, not query param.** Sidebar state is a UI preference, not shareable URL state. `localStorage` survives navigation and page refresh with no router pollution.
- **Tooltip for collapsed sidebar links.** A rail with icon-only links drops label context; a plain `title` attribute is insufficient for screen readers — a Base-UI tooltip with `aria-label` fulfils REQ-a11y-2 and REQ-state-2. (Ref: TIDAL sidebar — icon-only collapsed rail pattern)
- **Nav link labels use `label-caps` token.** DESIGN.md §Typography: "label-caps: JetBrains Mono 12px 700 0.1em" for terminal clarity. Sidebar and bottom-nav link labels use this token, not `body-sans`. (Ref: TIDAL sidebar section headers)
- **Page header `<h1>` uses Space Grotesk uppercase.** DESIGN.md §Typography: "All headings uppercase." The route title in `<PageHeader />` renders in `h1` with `uppercase font-headline` (Space Grotesk 700). (Ref: Airbnb page header — title + back arrow layout)
- **Bottom-nav top-border active indicator, not underline.** Brilliant iOS bottom-nav uses top-border + icon+label highlight for the active tab. Adopted verbatim: 2px top border `--color-outline-active` (neon cyan) on active item; inactive items use `--color-on-surface-variant`. (Ref: Brilliant · iOS bottom tab bar)

## References

<<<REFERENCES_START>>>
## References

### Sidebar Navigation (expanded + collapsed states)
- **TIDAL · web (desktop)** — Dark sidebar (~#2a2a2a dark gray). Expanded state: labels + icons, section headers in `label-caps`. Collapsed state: icon-only rail at ~80px width. Active indicator: icon highlight + neon glow. **Adopt:** Fixed left sidebar; `label-caps` token for nav labels; `--color-surface` (#131313) for rail bg; `--color-outline-active` (cyan) active left-border + glow. https://refero.design/pages/7bda80b6-3c40-469e-872c-3a19b994cef8

### Bottom Navigation (mobile)
- **Brilliant · iOS** — Fixed bottom tab bar with equal-width segments. Active tab: icon + label + top-border (purple, adopted as cyan #00ffff). Inactive: muted. Spacing: 12px vertical padding, icon 24px, label 12px. Zero-radius geometry. **Adopt:** Fixed bottom bar, `--color-outline-active` top-border on active, icon + label stacked, ≥44px touch targets. https://refero.design/screens/756038b9-5084-4e5c-9652-7b65ecd379ec

### Page Header with back arrow
- **Airbnb · web** — Back arrow left-aligned, bold heading left, border-bottom separator. **Adopt:** `<ArrowLeft />` button + `<h1>` title + 1px `--color-outline` border-bottom; Space Grotesk uppercase for title; back arrow navigates to `/`. https://refero.design/pages/ad8268e1-0de2-4e60-9b96-cbb1afc44323

### Gaps
- Icon-only rail with hover tooltip — no exact Refero ref; implement with `@base-ui/react` Tooltip (already in project) wrapping each collapsed nav item.
- Sidebar collapse transition — no exact dark-mode collapse animation in Refero; implement as `width` 150ms linear with `motion-reduce:transition-none`.
<<<REFERENCES_END>>>
