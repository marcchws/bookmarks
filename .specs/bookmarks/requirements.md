# Bookmarks

## Goal

Enable users to save, browse, and manage URL bookmarks with full CRUD, search, tag filtering, and inline tag creation.

## User stories

- As a user, I want to see all my bookmarks in a card grid so that I can browse them at a glance.
- As a user, I want to search and filter bookmarks by tag so that I can find the one I need quickly.
- As a user, I want to save a new bookmark with title, URL, description, and tags so that I can organise my links.
- As a user, I want to edit an existing bookmark so that I can correct or enrich its data.
- As a user, I want to delete a bookmark with a confirmation step so that I don't lose data accidentally.
- As a user, I want to view full bookmark details including formatted dates so that I can review what I saved.

## Requirements

### Functional

- **REQ-1:** List view renders bookmarks in a card grid — 2 columns on mobile, 3 columns at ≥ md breakpoint. Trigger: route `/` loads. Acceptance: grid reflows at `md` breakpoint and each card shows favicon, title, truncated URL, tag chips, relative creation date.
- **REQ-2:** Favicon loaded from `https://www.google.com/s2/favicons?domain=<domain>` extracted from the bookmark URL. Acceptance: `<img>` src attribute matches the pattern; `alt` is empty string (decorative).
- **REQ-3:** Search input debounced 300 ms writes to `?q=` query param; `GET /bookmarks?q=<value>` is fired. Acceptance: network call fires at most once per 300 ms burst; browser back/forward restores the param.
- **REQ-4:** Tag filter is a multi-select chip bar (`<TagFilterBar />` from tags module) above the grid; selected slugs update `?tag=` query param. Acceptance: param persists on navigation back; multiple tags append as `?tag=a&tag=b`.
- **REQ-5:** Create form collects URL (required, valid URL), Title (required, max 120 chars), Description (optional, max 300 chars), Tags (multi-select via `<TagCombobox />`). Acceptance: Zod schema rejects invalid URL and over-length values before submit; field errors render adjacent to the field.
- **REQ-6:** URL auto-populate — when user pastes a URL into the URL field the Title field is populated from the MSW-simulated `document.title` response. Acceptance: `GET /bookmarks/meta?url=<url>` is called and title field value is set; user can override the pre-filled title.
- **REQ-7:** Successful create navigates to `/bookmarks/:id`. Acceptance: `useNavigate` routes to the new resource ID returned by `POST /bookmarks`.
- **REQ-8:** Edit form pre-populates all fields from the existing bookmark fetched via `GET /bookmarks/:id`. Acceptance: each field initial value matches the stored data.
- **REQ-9:** Successful edit navigates to `/bookmarks/:id`. Acceptance: `useNavigate` routes to the same ID after `PATCH /bookmarks/:id` resolves.
- **REQ-10:** Delete is accessible from the detail view action bar and the card kebab menu. Trigger: user clicks Delete. Acceptance: a confirmation dialog appears before any `DELETE` request is sent.
- **REQ-11:** Confirmed deletion calls `DELETE /bookmarks/:id`, invalidates the bookmarks cache, and navigates to `/`. Acceptance: deleted card no longer appears in the list.
- **REQ-12:** Detail view shows all fields — URL (external link), title, description, tags, formatted `createdAt` and `updatedAt`. Action bar has Edit button, Delete button, "Open URL" external link. Acceptance: all fields rendered; "Open URL" opens in a new tab with `rel="noopener noreferrer"`.
- **REQ-13:** TanStack Query `staleTime` for bookmarks list and single-bookmark queries is 30 000 ms. Acceptance: query key options confirm `staleTime: 30_000`.

### Accessibility

- **REQ-a11y-1:** All interactive elements (buttons, links, inputs, combobox trigger, kebab menu trigger) have a visible focus ring using token `--ring`. Acceptance: `:focus-visible` styles apply the ring; no element relies solely on colour to show focus.
- **REQ-a11y-2:** Search input has `aria-label="Search bookmarks"`. Tag filter bar region has `role="group"` and `aria-label="Filter by tag"`. Acceptance: no missing label warnings in axe.
- **REQ-a11y-3:** Confirmation dialog traps focus inside the dialog until dismissed; first focus lands on the cancel button. Acceptance: Tab cycles within the dialog; Escape dismisses without deleting.
- **REQ-a11y-4:** Card kebab menu button has `aria-label="Bookmark actions for <title>"`. Acceptance: screen reader announces the bookmark title in the label.
- **REQ-a11y-5:** All touch targets (card actions, filter chips, form submit) are ≥ 44 × 44 px. Acceptance: computed height/width in dev tools ≥ 44 px.
- **REQ-a11y-6:** `prefers-reduced-motion` disables card entrance animations and transitions. Acceptance: `@media (prefers-reduced-motion: reduce)` removes all `transition` and `animation` declarations on cards and the grid.
- **REQ-a11y-7:** Skeleton loading cards use `aria-busy="true"` on the grid container and `aria-hidden="true"` on individual skeleton elements. Acceptance: screen reader announces loading state via the busy container, not each skeleton.
- **REQ-a11y-8:** Colour contrast meets WCAG AA — 4.5:1 for text, 3:1 for UI elements (borders, icons). Acceptance: design tokens enforce contrast; no raw colour values outside `@theme`.

### Responsive

- **REQ-resp-1:** Layout is mobile-first starting at 375 px; card grid is 1 column below `sm`, 2 columns at `sm`–`md`, 3 columns at ≥ `md`. Acceptance: grid columns verified at 375 px, 640 px, and 1024 px viewports.
- **REQ-resp-2:** Search input and tag filter bar stack vertically on mobile, arrange inline (search + filter side by side) at ≥ `md`. Acceptance: flex-direction switches at `md` breakpoint.
- **REQ-resp-3:** Detail view action bar stacks vertically on mobile, renders as a horizontal row at ≥ `sm`. Acceptance: button group wraps at narrow widths and aligns at wider widths.

### States

- **REQ-state-1:** Empty state — no bookmarks returned from `GET /bookmarks`. Shows a centred illustration, "No bookmarks yet" heading, and a "Save your first bookmark" button linking to `/bookmarks/new`. Acceptance: rendered when list data is `[]`.
- **REQ-state-2:** Loading state — `GET /bookmarks` in flight. Shows a 2/3-column skeleton grid of 6 cards matching the card layout. Acceptance: skeleton renders during the loading phase; disappears when data resolves.
- **REQ-state-3:** Error state — `GET /bookmarks` returns a non-2xx response. Shows an inline error banner with Lucide `AlertCircle` icon and a "Retry" button that calls `refetch()`. Acceptance: banner replaces the grid; retry triggers a fresh fetch.
- **REQ-state-4:** Create/edit form server error — `POST` or `PATCH` returns an error. Shows a form-level error message above the submit button. Acceptance: field-level errors from Zod fire client-side; server errors surface as form-level after submission.
- **REQ-state-5:** Detail view loading — `GET /bookmarks/:id` in flight. Shows a skeleton matching the detail layout. Acceptance: skeleton visible during fetch; replaced by content on success.
- **REQ-state-6:** Detail view error — `GET /bookmarks/:id` fails. Shows inline error banner with retry button. Acceptance: banner occupies the content area; retry re-fetches the single bookmark.

## Out of scope

- Pagination, infinite scroll, or cursor-based navigation beyond a single result set.
- Authentication or user accounts.
- Bookmark import/export.
- Browser extension.
- Tag management as a standalone route.
