# SRS — Bookmarks

## 1. Purpose

A single-page bookmark manager that lets users save, organise, and delete URL bookmarks. The goal of this document is to drive the full `/bootstrap → /spec → /implement → /review → /ship` workflow as a stack integration test.

---

## 2. Stack

React 19 · Vite · TypeScript · Tailwind v4 · shadcn · TanStack Router v1 (file-based) · TanStack Query v5 · React Hook Form + Zod · MSW v2 (dev + test) · Vitest + Testing Library · Storybook 9 · pnpm.

---

## 3. Modules

| ID  | Module      | Description                              |
|-----|-------------|------------------------------------------|
| M1  | Bookmarks   | CRUD list of bookmarks                   |
| M2  | Tags        | Optional tags to categorise bookmarks    |

---

## 4. Data Model

```ts
interface Bookmark {
  id: string          // uuid
  url: string         // valid URL
  title: string       // max 120 chars
  description?: string // max 300 chars
  tags: string[]      // tag slugs
  createdAt: string   // ISO 8601
  updatedAt: string
}

interface Tag {
  id: string
  slug: string        // url-safe, unique
  label: string
}
```

---

## 5. API Contract (mocked by MSW)

Base URL: `/api`

| Method | Path                  | Description              |
|--------|-----------------------|--------------------------|
| GET    | /bookmarks            | List all bookmarks       |
| POST   | /bookmarks            | Create bookmark          |
| GET    | /bookmarks/:id        | Get single bookmark      |
| PATCH  | /bookmarks/:id        | Update bookmark          |
| DELETE | /bookmarks/:id        | Delete bookmark          |
| GET    | /tags                 | List all tags            |
| POST   | /tags                 | Create tag               |

Query params for `GET /bookmarks`: `?tag=<slug>` (filter), `?q=<string>` (search title + URL).

---

## 6. Routes

| Route                    | Component          | Description                        |
|--------------------------|--------------------|------------------------------------|
| `/`                      | BookmarkList       | Paginated list + search + tag filter |
| `/bookmarks/new`         | BookmarkForm       | Create form                        |
| `/bookmarks/$id`         | BookmarkDetail     | Read-only detail view              |
| `/bookmarks/$id/edit`    | BookmarkForm       | Edit form (same component, edit mode) |

---

## 7. Requirements

### M1 — Bookmarks

#### REQ-BM-001 List view
- Display bookmarks as a card grid (2 cols mobile, 3 cols ≥ md).
- Each card shows: favicon (via `https://www.google.com/s2/favicons?domain=<domain>`), title, URL (truncated), tag chips, relative creation date.
- Empty state: illustration + "No bookmarks yet" + CTA to create.
- Loading state: skeleton cards (same grid layout, 6 items).
- Error state: inline error banner with retry button.

#### REQ-BM-002 Search & filter
- Search input debounced 300 ms; updates `?q=` query param.
- Tag filter: multi-select chip bar above the grid; updates `?tag=` query param.
- Active filters persist on browser back/forward.

#### REQ-BM-003 Create bookmark
- Form fields: URL (required), Title (required, auto-populated via `document.title` if user pastes URL — simulate with MSW), Description (optional), Tags (multi-select combobox, allows creating new tags inline).
- Validation: URL must be a valid URL; title max 120 chars; description max 300 chars.
- On success: navigate to `/bookmarks/:id`.
- On server error: show field-level or form-level error.

#### REQ-BM-004 Edit bookmark
- Pre-populated with current data.
- Same validation rules as create.
- On success: navigate to `/bookmarks/:id`.

#### REQ-BM-005 Delete bookmark
- Accessible from the detail view and the card kebab menu.
- Confirmation dialog before deletion.
- On success: navigate to `/`.

#### REQ-BM-006 Detail view
- Shows all fields + tags + formatted dates.
- Action bar: Edit button, Delete button, "Open URL" external link.

### M2 — Tags

#### REQ-TAG-001 Tag list (embedded in BookmarkList filter bar)
- Fetched once, cached; stale time 5 min.

#### REQ-TAG-002 Inline tag creation
- Available inside the bookmark form combobox.
- Creates the tag via `POST /tags` then selects it immediately.

---

## 8. UI / UX Constraints

- **Mobile-first.** All layouts work at 375 px viewport.
- **WCAG AA.** Contrast, focus rings, ARIA labels on all interactive elements.
- **Touch targets ≥ 44 × 44 px.**
- **prefers-reduced-motion** respected on all transitions.
- **Tokens only.** No raw hex, px, or radius values outside the `@theme` block.
- **Icons.** Lucide only; no custom SVG or emoji as functional icons.

---

## 9. Non-Functional Requirements

| ID    | Requirement                                                    |
|-------|----------------------------------------------------------------|
| NF-01 | MSW handlers cover all API routes for dev and test environments |
| NF-02 | Vitest + Testing Library coverage for all form validation paths and query/mutation states |
| NF-03 | Storybook story per UI state declared in section 7 (REQ-state-* convention) |
| NF-04 | No real network calls in tests; MSW intercepts all                |
| NF-05 | TanStack Query `staleTime` configured per resource (bookmarks: 30 s, tags: 5 min) |

---

## 10. Design Brief

### Concept

**"The internet, raw and electric."** A tool that feels like it was built inside the machine — not on top of it. Neon glows, dark backgrounds, images as first-class citizens. Cyberpunk energy without the gimmicks.

### Personality

Tech-forward. High contrast. Glowing. Bookmark cards feel like terminal windows or HUD panels. Images and favicons are visual heroes, not decorative accents. Motion is electric — things light up, pulse, snap into place. The UI looks like it belongs in a sci-fi film but is completely usable.

---

## 11. Out of Scope

- Authentication / user accounts
- Bookmark import/export
- Browser extension
- Pagination beyond a single page of results (infinite scroll or cursor-based pagination is a stretch goal only if time permits)
