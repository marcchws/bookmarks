# Bookmarks — Tasks

## Phase 1 — Setup

- [x] 1.1 Create `src/types/bookmark.ts` with `Bookmark` and `BookmarkFormValues` interfaces
  _Requirements: REQ-1, REQ-5_

- [x] 1.2 Create `src/lib/queries/bookmarks.ts` with `bookmarkKeys` and fetchers; set `staleTime: 30_000`
  _Requirements: REQ-13_

- [x] 1.3 Create route files: `src/routes/index.tsx`, `src/routes/bookmarks/new.tsx`, `src/routes/bookmarks/$id.tsx`, `src/routes/bookmarks/$id.edit.tsx` with route-tree placeholders; run `pnpm exec tsr generate`
  _Requirements: REQ-1, REQ-5, REQ-8, REQ-12_

- [x] 1.4 seed: create rich dev seed in `src/mocks/bookmarks-seed.ts` covering all UI states (empty list, populated list, error simulation)
  _Requirements: REQ-state-1, REQ-state-2, REQ-state-3_

## Phase 2 — Hooks

- [x] 2.1 Implement `useBookmarks()` in `src/hooks/use-bookmarks.ts` — list query with `q` + `tag` filter params
  _Requirements: REQ-1, REQ-3, REQ-4, REQ-state-2, REQ-state-3_

- [x] 2.2 Implement `useBookmark()` in `src/hooks/use-bookmark.ts` — single-item query
  _Requirements: REQ-12, REQ-state-5, REQ-state-6_

- [x] 2.3 Implement `useCreateBookmark()`, `useUpdateBookmark()`, `useDeleteBookmark()` in respective hook files; each invalidates `bookmarkKeys`
  _Requirements: REQ-7, REQ-9, REQ-11_

## Phase 3 — Components

- [x] 3.1 Implement `<BookmarkSearch />` with 300 ms debounce writing to `?q=` param
  _Requirements: REQ-3, REQ-a11y-2, REQ-resp-2_

- [x] 3.2 Implement `<BookmarkCard />` with favicon, truncated URL, tag chips, relative date, kebab menu (Edit + Delete actions)
  _Requirements: REQ-1, REQ-2, REQ-10, REQ-a11y-1, REQ-a11y-4, REQ-a11y-5, REQ-a11y-8_

- [x] 3.3 Implement `<BookmarkGrid />` with empty, loading (6 skeletons), error, and populated states; `aria-busy` on grid during load
  _Requirements: REQ-1, REQ-a11y-7, REQ-resp-1, REQ-state-1, REQ-state-2, REQ-state-3_

- [x] 3.4 Implement `<BookmarkDeleteDialog />` using shadcn `<AlertDialog>`; focus trap + Escape dismiss; cancel receives initial focus
  _Requirements: REQ-10, REQ-11, REQ-a11y-3_

- [x] 3.5 Implement `<BookmarkForm />` (create + edit mode) with react-hook-form + Zod; URL, Title, Description, `<TagCombobox />`; server-error banner; auto-populate title on URL paste
  _Requirements: REQ-5, REQ-6, REQ-7, REQ-8, REQ-9, REQ-a11y-1, REQ-a11y-5, REQ-state-4_

- [x] 3.6 Implement `<BookmarkDetail />` with all fields, formatted dates, action bar (Edit, Delete, Open URL)
  _Requirements: REQ-12, REQ-a11y-1, REQ-a11y-5, REQ-resp-3, REQ-state-5, REQ-state-6_

## Phase 4 — Wire-up

- [x] 4.1 Wire `/` route: render `<BookmarkSearch />`, `<TagFilterBar />`, `<BookmarkGrid />`; sync `?q=` and `?tag=` with router search params
  _Requirements: REQ-1, REQ-2, REQ-3, REQ-4, REQ-a11y-2, REQ-a11y-6, REQ-resp-1, REQ-resp-2_

- [x] 4.2 Wire `/bookmarks/new` route: render `<BookmarkForm mode="create" />`
  _Requirements: REQ-5, REQ-6, REQ-7_

- [x] 4.3 Wire `/bookmarks/$id` route: render `<BookmarkDetail />`; handle loading and error states
  _Requirements: REQ-12, REQ-state-5, REQ-state-6_

- [x] 4.4 Wire `/bookmarks/$id/edit` route: fetch bookmark, pass `defaultValues` to `<BookmarkForm mode="edit" />`
  _Requirements: REQ-8, REQ-9_

- [x] 4.5 Add MSW handlers to `src/mocks/handlers.ts` for all bookmark API routes including `GET /bookmarks/meta`
  _Requirements: REQ-3, REQ-5, REQ-6, REQ-11, REQ-13_
