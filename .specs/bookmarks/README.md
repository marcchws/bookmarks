# Bookmarks Module — Dev Guide

## Routes

| Route | File | Description |
|-------|------|-------------|
| `/` | `src/routes/index.tsx` | BookmarkList — search + filter + card grid |
| `/bookmarks/new` | `src/routes/bookmarks/new.tsx` | Create form |
| `/bookmarks/$id` | `src/routes/bookmarks/$id.tsx` | Detail view |
| `/bookmarks/$id/edit` | `src/routes/bookmarks/$id.edit.tsx` | Edit form |

## Public exports

| Export | Path | Description |
|--------|------|-------------|
| `useBookmarks()` | `src/hooks/use-bookmarks.ts` | List query; accepts `{ q?, tag? }` filters; `staleTime: 30 s` |
| `useBookmark()` | `src/hooks/use-bookmark.ts` | Single item; `staleTime: 30 s` |
| `useCreateBookmark()` | `src/hooks/use-create-bookmark.ts` | POST; invalidates `bookmarkKeys` on success |
| `useUpdateBookmark()` | `src/hooks/use-update-bookmark.ts` | PATCH; invalidates `bookmarkKeys` on success |
| `useDeleteBookmark()` | `src/hooks/use-delete-bookmark.ts` | DELETE; invalidates `bookmarkKeys` on success |
| `<BookmarkCard />` | `src/components/bookmarks/bookmark-card.tsx` | Props: `{ bookmark, onDelete }` |
| `<BookmarkGrid />` | `src/components/bookmarks/bookmark-grid.tsx` | Props: `{ bookmarks, isLoading, isError, onRetry }` |
| `<BookmarkSearch />` | `src/components/bookmarks/bookmark-search.tsx` | Props: `{ value, onChange }` — 300 ms debounce |
| `<BookmarkForm />` | `src/components/bookmarks/bookmark-form.tsx` | Props: `{ mode: 'create'\|'edit', defaultValues? }` |
| `<BookmarkDetail />` | `src/components/bookmarks/bookmark-detail.tsx` | Props: `{ bookmark, onDelete }` |
| `<BookmarkDeleteDialog />` | `src/components/bookmarks/bookmark-delete-dialog.tsx` | Props: `{ open, onConfirm, onCancel, title }` |
| `Bookmark`, `BookmarkFormValues` | `src/types/bookmark.ts` | Core types |
| `bookmarkKeys` | `src/lib/queries/bookmarks.ts` | `{ all, list, detail }` query key factory |

## MSW seed scenarios

| Key | File | Description |
|-----|------|-------------|
| `emptyBookmarks` | `src/mocks/bookmarks-seed.ts` | Empty list — exercises ASCII empty state + CTA |
| `populatedBookmarks` | `src/mocks/bookmarks-seed.ts` | 8 bookmarks with varied tags, dates, descriptions |
| `bookmarkNetworkError` | `src/mocks/bookmarks-seed.ts` | GET /bookmarks 500 — exercises error banner + retry |
| `detailBookmark` | `src/mocks/bookmarks-seed.ts` | Single bookmark for detail view — all fields populated |
| `bookmarkNotFound` | `src/mocks/bookmarks-seed.ts` | GET /bookmarks/:id 404 — exercises detail error state |

Default handler in `src/mocks/handlers.ts` uses `populatedBookmarks`.

## Key implementation notes

- **URL search params**: index route uses `validateSearch` with `{ q?: string; tag?: string[] }`. Multiple tags append as `?tag=a&tag=b`.
- **Auto-populate title (REQ-6)**: `GET /bookmarks/meta?url=<url>` on URL field blur; failure silently suppressed.
- **Favicon (REQ-2)**: `https://www.google.com/s2/favicons?domain=<domain>&sz=32`; `alt=""` (decorative).
- **Relative dates**: `src/lib/relative-time.ts` helper — no date library dependency.
- **Delete flow**: available from both card kebab menu and detail action bar; always shows `<BookmarkDeleteDialog />` before DELETE call.

## Flags

- **Zod v4**: project uses zod v4; `@hookform/resolvers` v5.2.2 handles both v3 and v4 at runtime. Use `zod/v3` subpath import for cleaner type overloads with react-hook-form.
- **No `asChild` on DropdownMenuTrigger**: project uses `@base-ui/react` — pass className/aria attrs directly to trigger.
- **REQ-state-5/6 in route, not component**: `BookmarkDetail` receives a resolved `bookmark` prop; loading/error states are owned by the `$id.tsx` route consumer. Stories for these states are not in bookmark-detail.stories.tsx.
- **`RouterContextProvider`**: story files that use `useNavigate` wrap with `RouterContextProvider` + `createMemoryHistory` (from `@tanstack/react-router`).
- **Pre-existing lint warnings**: `react-refresh/only-export-components` in route files — pre-existed before this build.
