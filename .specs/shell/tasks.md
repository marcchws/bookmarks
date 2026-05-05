# Shell — Tasks

## Phase 1 — Setup

- [x] 1.1 Create `src/components/layout/nav-items.ts` with `NAV_ITEMS` array (Bookmarks + New Bookmark entries, Lucide icons, variants)
  _Requirements: REQ-1, REQ-7_

- [x] 1.2 Create `src/components/layout/page-header.tsx` with `title` prop, optional back arrow (`ArrowLeft`), `aria-label`, `useNavigate`
  _Requirements: REQ-4, REQ-5, REQ-a11y-3, REQ-a11y-4, REQ-resp-3_

## Phase 2 — Implementation

- [x] 2.1 Implement `<Sidebar />` — expanded/collapsed states, toggle button with `aria-expanded`, active-link indicator, collapsed tooltip, `prefers-reduced-motion` guard
  _Requirements: REQ-1, REQ-2, REQ-7, REQ-8, REQ-resp-1, REQ-a11y-1, REQ-a11y-2, REQ-a11y-3, REQ-a11y-5, REQ-state-1, REQ-state-2_

- [x] 2.2 Implement `<BottomNav />` — mobile-only (`md:hidden`), active-link top-border indicator, touch targets ≥ 44×44px, `aria-label="Mobile navigation"`
  _Requirements: REQ-3, REQ-7, REQ-8, REQ-resp-2, REQ-resp-4, REQ-a11y-1, REQ-a11y-3, REQ-state-3_

- [x] 2.3 Implement `<AppShell />` — flex-row layout, `localStorage` sidebar state init, pathname-to-title map, pass `title`/`showBack` to `<PageHeader />`, render `<Sidebar />` + content column + `<BottomNav />`
  _Requirements: REQ-2, REQ-4, REQ-5, REQ-6, REQ-resp-1, REQ-resp-2, REQ-a11y-6_

## Phase 3 — Wire-up

- [x] 3.1 Update `src/routes/__root.tsx` to render `<AppShell>` wrapping `<Outlet />` in place of the bare `<Outlet />`; verify `/design-system` route still renders
  _Requirements: REQ-6, REQ-a11y-6_

- [x] 3.2 Remove or demote the per-route `<h1>` in `src/routes/index.tsx` (BookmarkListPage header) so the shell `<PageHeader />` is the sole `<h1>`
  _Requirements: REQ-a11y-6_

## Phase 4 — Tests & Stories

- [x] 4.1 Write `src/components/layout/sidebar.test.tsx` — collapsed toggle, active-link aria-current, keyboard nav
  _Requirements: REQ-2, REQ-8, REQ-a11y-1, REQ-a11y-2, REQ-a11y-3_

- [x] 4.2 Write `src/components/layout/bottom-nav.test.tsx` — visibility at breakpoints (jsdom), active-link indicator, touch-target size
  _Requirements: REQ-3, REQ-8, REQ-resp-4_

- [x] 4.3 Write `src/components/layout/app-shell.stories.tsx` — stories for: expanded sidebar, collapsed sidebar, mobile (bottom-nav visible), detail route (back arrow)
  _Requirements: REQ-state-1, REQ-state-2, REQ-state-3, REQ-5_
