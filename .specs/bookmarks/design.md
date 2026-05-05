# Bookmarks — Design

## Overview

The Bookmarks module owns four routes (list, detail, create, edit) and all bookmark-specific data fetching and mutations. It consumes `<TagFilterBar />`, `<TagCombobox />`, `useTags()`, and `Tag` from the tags module — it does not redefine them. Server state lives entirely in TanStack Query; local UI state (search input value, dialog open) lives in `useState`.

## Architecture

```
src/
├── routes/
│   ├── index.tsx                          # / — BookmarkList route
│   └── bookmarks/
│       ├── new.tsx                        # /bookmarks/new — create form
│       ├── $id.tsx                        # /bookmarks/$id — detail view
│       └── $id.edit.tsx                   # /bookmarks/$id/edit — edit form
├── types/
│   └── bookmark.ts                        # Bookmark interface
├── lib/queries/
│   └── bookmarks.ts                       # Query keys + fetchers
├── hooks/
│   ├── use-bookmarks.ts                   # useQuery — list with filters
│   ├── use-bookmark.ts                    # useQuery — single item
│   ├── use-create-bookmark.ts             # useMutation — POST
│   ├── use-update-bookmark.ts             # useMutation — PATCH
│   └── use-delete-bookmark.ts             # useMutation — DELETE
├── components/bookmarks/
│   ├── bookmark-card.tsx                  # Grid card with kebab menu
│   ├── bookmark-grid.tsx                  # Grid + empty/loading/error states
│   ├── bookmark-form.tsx                  # Shared create/edit form
│   ├── bookmark-detail.tsx                # Detail layout
│   ├── bookmark-search.tsx                # Debounced search input
│   └── bookmark-delete-dialog.tsx         # Confirmation dialog
└── mocks/
    └── bookmarks-seed.ts                  # MSW dev seed (all UI states)
```

## Components & interfaces

### `<BookmarkGrid />`
- Path: `src/components/bookmarks/bookmark-grid.tsx`
- Props: `{ bookmarks: Bookmark[]; isLoading: boolean; isError: boolean; onRetry: () => void }`
- States: loading (6 skeleton cards) · empty (illustration + CTA) · error (banner + retry) · default (card grid)
- Tokens used: `--card`, `--border`, `--radius-md`, `--muted`
- Composition: wraps `<BookmarkCard />` in a CSS grid; delegates state rendering to conditionals

### `<BookmarkCard />`
- Path: `src/components/bookmarks/bookmark-card.tsx`
- Props: `{ bookmark: Bookmark; onDelete: (id: string) => void }`
- States: default · hover · focus-visible · kebab-open
- Tokens used: `--card`, `--card-foreground`, `--border`, `--ring`, `--radius-md`, `--muted-foreground`
- Composition: shadcn `<Card>` + `<DropdownMenu>` for kebab; Lucide `MoreVertical`, `Trash2`, `ExternalLink`

### `<BookmarkSearch />`
- Path: `src/components/bookmarks/bookmark-search.tsx`
- Props: `{ value: string; onChange: (value: string) => void }`
- States: default · focused · filled
- Tokens used: `--input`, `--border`, `--ring`, `--radius-md`
- Composition: shadcn `<Input>` with Lucide `Search` prefix icon; debounce via `useEffect` + `setTimeout`

### `<BookmarkForm />`
- Path: `src/components/bookmarks/bookmark-form.tsx`
- Props: `{ mode: 'create' | 'edit'; defaultValues?: Partial<BookmarkFormValues> }`
- States: idle · submitting (disabled + spinner) · error (form-level banner) · success (triggers navigation)
- Tokens used: `--input`, `--border`, `--ring`, `--destructive`, `--radius-md`
- Composition: `react-hook-form` + Zod; fields: URL, Title, Description, Tags (`<TagCombobox />`); shadcn `<Form>`, `<Input>`, `<Textarea>`, `<Button>`

### `<BookmarkDetail />`
- Path: `src/components/bookmarks/bookmark-detail.tsx`
- Props: `{ bookmark: Bookmark; onDelete: () => void }`
- States: default · delete-dialog-open
- Tokens used: `--card`, `--muted`, `--muted-foreground`, `--border`, `--ring`
- Composition: layout with action bar; Lucide `Pencil`, `Trash2`, `ExternalLink`; `<BookmarkDeleteDialog />`

### `<BookmarkDeleteDialog />`
- Path: `src/components/bookmarks/bookmark-delete-dialog.tsx`
- Props: `{ open: boolean; onConfirm: () => void; onCancel: () => void; title: string }`
- States: open · confirming (confirm button disabled + spinner)
- Tokens used: `--destructive`, `--ring`, `--radius-md`
- Composition: shadcn `<AlertDialog>`; cancel receives initial focus

## Data models

```typescript
// src/types/bookmark.ts
interface Bookmark {
  id: string;
  url: string;
  title: string;
  description?: string;
  tags: string[];       // tag slugs
  createdAt: string;    // ISO 8601
  updatedAt: string;
}

interface BookmarkFormValues {
  url: string;
  title: string;
  description?: string;
  tags: string[];
}
```

TanStack Query keys — `src/lib/queries/bookmarks.ts`:
- `['bookmarks', { q, tag }]` — filtered list (`GET /bookmarks`)
- `['bookmarks', id]` — single item (`GET /bookmarks/:id`)
- Both use `staleTime: 30_000`

## Error handling

- `GET /bookmarks` failure: `<BookmarkGrid />` shows inline banner with `AlertCircle` icon and "Retry" button calling `refetch()`. Grid is replaced; skeletons are not shown during error.
- `GET /bookmarks/:id` failure: detail route shows same inline banner pattern with retry.
- `POST /bookmarks` / `PATCH /bookmarks/:id` failure: `<BookmarkForm />` surfaces a form-level error above the submit button. Field-level Zod errors fire client-side before any network call.
- `DELETE /bookmarks/:id` failure: toast via global `<Toaster />` with the server error message; dialog stays open.
- `GET /bookmarks/meta?url=<url>` failure (auto-populate): silently suppressed — field stays blank; user types title manually.

## Public exports

- Hooks: `useBookmarks()` — `src/hooks/use-bookmarks.ts`
- Hooks: `useBookmark()` — `src/hooks/use-bookmark.ts`
- Hooks: `useCreateBookmark()` — `src/hooks/use-create-bookmark.ts`
- Hooks: `useUpdateBookmark()` — `src/hooks/use-update-bookmark.ts`
- Hooks: `useDeleteBookmark()` — `src/hooks/use-delete-bookmark.ts`
- Components: `<BookmarkCard />` — `src/components/bookmarks/bookmark-card.tsx`
- Components: `<BookmarkForm />` — `src/components/bookmarks/bookmark-form.tsx`
- Types: `Bookmark`, `BookmarkFormValues` — `src/types/bookmark.ts`
- Query keys: `bookmarkKeys` — `src/lib/queries/bookmarks.ts`

## Decisions

- **`$id.edit.tsx` as a sibling file, not a nested directory.** TanStack Router v1 file convention: `$id.edit.tsx` maps to `/bookmarks/:id/edit` as a sibling of `$id.tsx`, avoiding an extra directory level with no layout to share.
- **Shared `<BookmarkForm />` for create and edit, not two separate components.** The fields and validation are identical; the `mode` prop and `defaultValues` distinguish the two flows, keeping Zod schema and field error rendering in one place.
- **No optimistic updates on mutations.** Per system decision "State boundaries" — TanStack Query invalidation after mutation keeps server state authoritative and avoids stale cache divergence.
- **Auto-populate title via a dedicated `GET /bookmarks/meta` endpoint (MSW-simulated), not `document.title`.** SRS REQ-BM-003 says "simulate with MSW" — a separate endpoint is cleaner to mock and test than patching `document.title` in jsdom.
- **Card header uses `body-mono` for title, not `body-sans`.** DESIGN.md §Components "Bookmark Cards (Terminal Style): Top header bar with favicon + monospaced window title." All bookmark titles in cards and detail view use JetBrains Mono (`font-mono` / `body-mono` token class) to enforce the HUD aesthetic. URLs also always use `body-mono`. (Ref: Anthropic workbench monospaced labels)
- **Card hover: border snaps to `outline-active` + `shadow-glow-sm`.** DESIGN.md §Components "On hover: border snaps to #00ffff with subtle pulse animation." Implement as `hover:border-outline-active hover:[box-shadow:var(--shadow-glow-sm)]` with 50–100ms snap transition. Glitch filter on hover is decorative only — use `hover:brightness-110 hover:saturate-150` on the favicon img. (Ref: Variant dark grid)
- **Empty state illustration replaced with ASCII/terminal art.** No external illustration assets. Use a pre-composed `<pre>` or `<svg>` terminal art block (neon cyan on black) as the illustration equivalent — matches the cyberpunk brand without SVG icon dependency. (Ref: Manychat empty state pattern, adapted to brand)
- **Detail/form field labels use `label-caps` token.** DESIGN.md §Typography: "label-caps: JetBrains Mono 12px 700 1em 0.1em letter-spacing." All form `<label>` elements and detail field name labels use this token class. (Ref: Anthropic workbench monospaced labels)

## References

<<<REFERENCES_START>>>
## References

### Bookmark Card Grid (Responsive 2–3 Col)
- **Variant · design canvas — dark grid with card compositions** — Black background (#000000) with spaced rectangular card elements; cards as thumbnails with sharp corners, layered separation via border contrast (1px outline), accent cyan on interaction hover. Sparse grid layout maximizing negative space. **Adopt:** Absolute black background, 1px outline (#333333) on cards, cyan (#00ffff) active border snap + glow on hover (10–15px blur), 12–16px grid gap, zero-radius geometry. https://refero.design/pages/09b954ac-d5ef-4a53-b146-6de728c7eefa

### Empty State (Illustration + CTA)
- **Manychat · inbox empty state — colorful illustration centered in pale container** — Full-width empty state with centered illustration, headline, secondary action link, primary action button. Clean negative space around illustration. **Adopt:** Center content in grid area; monospaced headline using `label-caps` (uppercase, 0.1em letter-spacing); primary CTA button in cyan solid; replace illustration with terminal ASCII art block (zero external asset dependency). https://refero.design/pages/c516e85a-0fee-422b-bf42-d67f213eceaa

### Detail View / Action Bar (Edit, Delete, Open URL)
- **Rox contact detail — modal overlay with header, field rows, bottom action bar** — Header: icon + title. Vertical field rows (icon left, label, value/input right) with 1px dividers. Bottom action bar: left-aligned destructive "Delete" button, right-aligned confirm buttons. **Adopt:** Header bar with favicon + title (Space Grotesk h2), field rows as list (icon + label + content), footer action bar with destructive left, confirm right. Buttons: ghost style default, solid cyan on primary. Destructive in `error` (#ffb4ab). https://refero.design/pages/c64d43f5-9018-4a7a-b838-edbbfbd96086

### Form Validation & Field States
- **Anthropic workbench — dark code editor with labeled input sections** — Dark input containers with monospaced labels + bordered text areas; system prompt and user input stacked vertically. Placeholder text in muted gray. **Adopt:** Input fields with 1px `outline` border (#333333), focus snaps to cyan (#00ffff) + 10px glow. `label-caps` (12px, 0.1em tracking) for field names. On error: border `error` (#ffb4ab), error message below. https://refero.design/pages/a65893bb-c91d-4a26-a215-7eb8f471b911

### Gaps
- **Skeleton loading** — No strong dark-mode+cyan skeleton in Refero. Use `surface-container-high` (#2a2a2a) blocks, CSS opacity pulse (no shimmer per DESIGN.md).
- **Tag combobox** — No exact zero-radius combobox in Refero. Use existing `<TagCombobox />` from tags module — already built.
<<<REFERENCES_END>>>
