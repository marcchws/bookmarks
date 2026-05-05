# Shell

## Goal

Wrap every app route in a persistent navigation chrome that gives users immediate access to their bookmarks list and the new-bookmark action from any screen.

## User stories

- As a user on desktop, I want a collapsible sidebar with nav links so that I can navigate without leaving my current context.
- As a user on mobile, I want a bottom navigation bar so that I can reach primary destinations with my thumb.
- As a user on any route, I want a page header showing the current page title so that I always know where I am.
- As a user on a detail or edit route, I want a back arrow in the page header so that I can return to the bookmark list without the browser back button.
- As a user, I want a prominent "New Bookmark" link always reachable so that I can archive a URL in one tap.

## Requirements

### Functional

- **REQ-1:** Sidebar renders on `md` breakpoint and above with nav links: "Bookmarks" (links to `/`) and "New Bookmark" (links to `/bookmarks/new`). Acceptance: sidebar is visible and links are functional at viewport width ≥ 768px.
- **REQ-2:** Sidebar has a toggle button that collapses it to an icon-only rail (width ~56px) and expands it to full label-visible state (width ~220px). Acceptance: clicking toggle cycles between collapsed and expanded; state persists in `localStorage` under key `shell:sidebar-collapsed`.
- **REQ-3:** Bottom-nav bar renders on viewports below `md` breakpoint with the same two links as the sidebar. Acceptance: bar is visible and functional at viewport width < 768px; bar is hidden at ≥ 768px.
- **REQ-4:** A page header renders at the top of the content area on every route. It shows the route title (see route-title map). Acceptance: `h1` text matches the route-title map for each of the four routes.
- **REQ-5:** On routes `/bookmarks/$id` and `/bookmarks/$id/edit` the page header shows a back arrow `<` that navigates to `/`. Acceptance: clicking the arrow calls `router.navigate({ to: "/" })`; arrow not present on `/` and `/bookmarks/new`.
- **REQ-6:** The shell layout is applied via `__root.tsx` `component` — all existing routes continue to render their content inside the `<Outlet />` without modification. Acceptance: `/`, `/bookmarks/new`, `/bookmarks/$id`, `/bookmarks/$id/edit`, and `/design-system` each render their existing content unchanged within the shell.
- **REQ-7:** The "New Bookmark" link is visually distinct (primary neon style) from the "Bookmarks" nav link on both sidebar and bottom-nav. Acceptance: "New Bookmark" uses `--color-primary` border and text; "Bookmarks" uses `--color-on-surface-variant` default text.
- **REQ-8:** Active nav link is highlighted to reflect the current route. Acceptance: the link whose `to` matches the current pathname gets `aria-current="page"` and a `--color-outline-active` left-border indicator (sidebar) or top-border indicator (bottom-nav).

### Responsive

- **REQ-resp-1:** At `md`+ the layout is a two-column flex row: sidebar (fixed or sticky left) + main content area that grows to fill remaining space. Acceptance: sidebar and content share the viewport row with no vertical stacking at ≥ 768px.
- **REQ-resp-2:** At below `md` the layout is a single column with content above and bottom-nav fixed to the bottom. Content area has `padding-bottom` large enough to clear the bottom-nav bar (≥ 56px). Acceptance: content is not obscured by the bar at any scroll position.
- **REQ-resp-3:** The page header is always full-width within the content column. Acceptance: header spans 100% of the content area at all breakpoints.
- **REQ-resp-4:** Touch targets in bottom-nav are ≥ 44×44px per WCAG 2.5.5. Acceptance: each nav item's clickable area measures ≥ 44px in both dimensions.

### Accessibility

- **REQ-a11y-1:** The sidebar `<nav>` element has `aria-label="Main navigation"`. The bottom-nav `<nav>` has `aria-label="Mobile navigation"`. Acceptance: both elements have distinct, non-empty `aria-label` values.
- **REQ-a11y-2:** The sidebar toggle button has `aria-expanded` reflecting the collapsed state and `aria-label` of "Collapse sidebar" / "Expand sidebar". Acceptance: screen reader announces the correct state on each toggle.
- **REQ-a11y-3:** All interactive elements (nav links, toggle button, back arrow) have visible focus rings matching `--color-ring` / `--color-outline-active`. Acceptance: `focus-visible` pseudo-class triggers a `box-shadow` or `outline` using the active neon token.
- **REQ-a11y-4:** The back-arrow button has `aria-label="Back to bookmarks list"`. Acceptance: no icon-only button is missing a text alternative.
- **REQ-a11y-5:** `prefers-reduced-motion` is respected on the sidebar collapse transition and any glow animations. Acceptance: sidebar width transition and neon glow pulses are wrapped in a `motion-reduce:` variant that disables them.
- **REQ-a11y-6:** Page header `<h1>` is the first heading on every route. Acceptance: each route has exactly one `<h1>` which is inside the shell header (existing per-route `<h1>` elements must be removed or demoted after shell wires up).

### States

- **REQ-state-1:** Sidebar expanded — full labels visible; left-border active indicator on current route link.
- **REQ-state-2:** Sidebar collapsed — icon-only rail; active indicator still present; tooltip with link label on hover.
- **REQ-state-3:** Mobile bottom-nav — labels and icons visible; top-border active indicator on current link.

## Out of scope

- User authentication / account menu in the sidebar.
- Nested nav sections or accordion groups.
- Route-level breadcrumbs beyond the single back arrow.
- Sidebar resize via drag.
- Any modification to route component internals (`index.tsx`, `$id.tsx`, etc.).
- Notification badges or unread counts.
