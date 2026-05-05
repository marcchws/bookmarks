# Tags — Tasks

## Phase 1 — Setup

- [x] 1.1 Create `src/types/tag.ts` with the `Tag` interface
  _Requirements: REQ-1_

- [x] 1.2 Create `src/lib/queries/tags.ts` with `tagKeys` and `fetchTags` / `createTag` fetchers
  _Requirements: REQ-1, REQ-4_

- [x] 1.3 Create `src/hooks/use-tags.ts` — `useTags()` wrapping `useQuery` with `staleTime: 5 * 60 * 1000`
  _Requirements: REQ-1, REQ-state-1, REQ-state-2, REQ-state-3_

- [x] 1.4 Create `src/hooks/use-create-tag.ts` — `useCreateTag()` wrapping `useMutation`; on success invalidates `['tags']`
  _Requirements: REQ-4, REQ-state-4, REQ-state-5_

## Phase 2 — Implementation

- [x] 2.1 Implement `<TagFilterBar />` with loading skeleton, empty (null), error banner, and active-chip states
  _Requirements: REQ-2, REQ-3, REQ-a11y-1, REQ-a11y-4, REQ-state-1, REQ-state-2, REQ-state-3_

- [x] 2.2 Implement `<TagCombobox />` using shadcn `<Command>` + `<Popover>`; multi-select; "Create '<value>'" option
  _Requirements: REQ-4, REQ-5, REQ-6, REQ-a11y-2, REQ-a11y-3, REQ-a11y-4, REQ-state-1, REQ-state-4, REQ-state-5_

- [x] 2.3 Add MSW handlers for `GET /tags` and `POST /tags` to `src/mocks/handlers.ts`
  _Requirements: REQ-1, REQ-4_

- [x] 2.4 seed: create rich dev seed in `src/mocks/tags-seed.ts` covering all UI states (empty list, populated list, error simulation)
  _Requirements: REQ-state-1, REQ-state-2, REQ-state-3, REQ-state-4, REQ-state-5_

## Phase 3 — Wire-up & Tests

- [ ] 3.1 Write Vitest tests for `useTags` — covers fetch success, loading, error, and stale-time behaviour
  _Requirements: REQ-1, REQ-state-1, REQ-state-3_

- [ ] 3.2 Write Vitest tests for `useCreateTag` — covers success (cache invalidated, tag selected), slug collision, and error handling
  _Requirements: REQ-4, REQ-6, REQ-state-4, REQ-state-5_

- [ ] 3.3 Write Vitest tests for `<TagFilterBar />` — toggle chips, URL param sync, keyboard nav, aria-pressed values
  _Requirements: REQ-2, REQ-3, REQ-a11y-1_

- [ ] 3.4 Write Vitest tests for `<TagCombobox />` — multi-select, inline create flow, keyboard nav, loading/error states
  _Requirements: REQ-5, REQ-6, REQ-a11y-2, REQ-a11y-3_

- [x] 3.5 Add Storybook stories for `<TagFilterBar />` (loading, empty, error, default, active-filter) and `<TagCombobox />` (default, loading, error, creating)
  _Requirements: REQ-state-1, REQ-state-2, REQ-state-3, REQ-state-4, REQ-state-5_
