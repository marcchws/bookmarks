# System: Bookmarks

> Living manifest. Single source of truth for cross-module coherence: order, dependencies, public exports, system decisions.

## Modules

| Slug | Name | One-liner | Spec | Build | Ship | Depends on |
|---|---|---|---|---|---|---|
| tags | Tags | Tag CRUD — list, create inline, filter chip bar | [x] | [x] | [ ] | — |
| bookmarks | Bookmarks | Full CRUD — list with search/filter, detail, create/edit form, delete | [x] | [x] | [ ] | tags |

**State derives from checkbox combination:**

| Spec | Build | Ship | State |
|---|---|---|---|
| `[ ]` | `[ ]` | `[ ]` | planned |
| `[x]` | `[ ]` | `[ ]` | specced |
| `[x]` | `[x]` | `[ ]` | built |
| `[x]` | `[x]` | `[x]` | shipped |

Monotonic — Build only checks if Spec is checked; Ship only if Build is checked. Skills validate this invariant on every write.

## Implementation order

Topological from dependencies. Build in this order:

1. `tags`
2. `bookmarks`

## Public exports per module

What other modules can rely on. Updated by `/implement` Phase Build after `build-subagent` confirms what shipped.

### tags — `built`

- `useTags()` — `src/hooks/use-tags.ts`
- `useCreateTag()` — `src/hooks/use-create-tag.ts`
- `<TagFilterBar />` — `src/components/tags/tag-filter-bar.tsx`
- `<TagCombobox />` — `src/components/tags/tag-combobox.tsx`
- Types: `Tag` from `src/types/tag.ts`
- `tagKeys` — `src/lib/queries/tags.ts`

### bookmarks — `built`

- `useBookmarks()` — `src/hooks/use-bookmarks.ts`
- `useBookmark()` — `src/hooks/use-bookmark.ts`
- `useCreateBookmark()` — `src/hooks/use-create-bookmark.ts`
- `useUpdateBookmark()` — `src/hooks/use-update-bookmark.ts`
- `useDeleteBookmark()` — `src/hooks/use-delete-bookmark.ts`
- `<BookmarkCard />` — `src/components/bookmarks/bookmark-card.tsx`
- `<BookmarkGrid />` — `src/components/bookmarks/bookmark-grid.tsx`
- `<BookmarkSearch />` — `src/components/bookmarks/bookmark-search.tsx`
- `<BookmarkForm />` — `src/components/bookmarks/bookmark-form.tsx`
- `<BookmarkDetail />` — `src/components/bookmarks/bookmark-detail.tsx`
- `<BookmarkDeleteDialog />` — `src/components/bookmarks/bookmark-delete-dialog.tsx`
- Types: `Bookmark`, `BookmarkFormValues` from `src/types/bookmark.ts`
- `bookmarkKeys` — `src/lib/queries/bookmarks.ts`
- Routes: `/`, `/bookmarks/new`, `/bookmarks/$id`, `/bookmarks/$id/edit`

## Cross-module contracts

System-wide invariants every module must honor.

- All forms use `react-hook-form` + `zod`.
- All async state via TanStack Query — no global client store.
- Toasts via global `<Toaster/>` mounted in `__root.tsx`.
- MSW handlers for all API routes live in `src/mocks/handlers.ts`.
- Icons: Lucide only; no custom SVG or emoji as functional icons.

## System decisions

### Decision: Tag ownership
**Context:** Tags are created inline from the bookmark form combobox — not from a separate management screen.
**Decision:** Tags module exposes `<TagCombobox />` (creation + selection) and `<TagFilterBar />` (read + filter). Bookmarks consumes both. No standalone tag management route.
_Rationale: Keeps the surface minimal and the creation flow contextual, per SRS REQ-TAG-002._

### Decision: State boundaries
**Context:** server vs. client state ownership.
**Decision:** TanStack Query owns all server state. Local UI state via `useState`/`useReducer`. No global client store.
_Rationale: Avoids dual sources of truth; aligns with SRS NF-05 staleTime requirements._

## Conventions

- Stack defaults and quality bar: `~/.claude/CLAUDE.md`.
- DS brief and Refero references: `.specs/design-system-brief.md`.
- Stitch prompts: `.specs/stitch-prompts.md`.
