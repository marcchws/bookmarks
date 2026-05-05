# Tags — Design

## Overview

The Tags module owns two UI surfaces: a filter chip bar embedded in the BookmarkList route and a multi-select combobox field used inside the BookmarkForm. Both surfaces share a single `useTags()` query hook backed by `GET /tags` with a 5-minute stale time. Inline tag creation mutates via `POST /tags` and invalidates the shared cache so both surfaces update without a second request.

## Architecture

```
src/
├── types/tag.ts                          # Tag interface
├── lib/queries/tags.ts                   # Query keys + fetcher
├── hooks/use-tags.ts                     # useQuery wrapper (list)
├── hooks/use-create-tag.ts               # useMutation wrapper (inline create)
├── components/tags/
│   ├── tag-filter-bar.tsx                # Chip bar — embedded in BookmarkList
│   └── tag-combobox.tsx                  # Multi-select combobox — used in BookmarkForm
└── mocks/
    └── tags-seed.ts                      # MSW dev seed (all UI states)
```

## Components & interfaces

### `<TagFilterBar />`

- Path: `src/components/tags/tag-filter-bar.tsx`
- Props: `{ activeSlugs: string[]; onToggle: (slug: string) => void }`
- States: loading (skeleton) · empty (renders null) · error (inline banner + retry) · default · active-filter
- Tokens used: `--chip-bg`, `--chip-bg-active`, `--chip-border`, `--ring`, `--radius-full`
- Composition: maps over tags; each chip is a `<button aria-pressed>` with Lucide `Tag` icon

### `<TagCombobox />`

- Path: `src/components/tags/tag-combobox.tsx`
- Props: `{ value: string[]; onChange: (slugs: string[]) => void; name?: string }`
- States: loading (spinner in dropdown) · empty ("No tags yet…") · error ("Failed to load") · default · creating (spinner on create option, disabled)
- Tokens used: `--popover`, `--popover-foreground`, `--border`, `--ring`, `--radius-md`
- Composition: shadcn `<Command>` + `<Popover>` pattern; "Create '<value>'" option appended at bottom of filtered list

## Data models

```typescript
// src/types/tag.ts
interface Tag {
  id: string;
  slug: string;   // url-safe, unique
  label: string;
}
```

TanStack Query keys — `src/lib/queries/tags.ts`:
- `['tags']` — full list (`GET /tags`)

## Error handling

- `GET /tags` failure: `TagFilterBar` shows inline banner "Could not load tags" + Lucide `RefreshCw` retry button that calls `refetch()`. `TagCombobox` shows "Failed to load tags" text + retry link inside the dropdown.
- `POST /tags` failure: mutation `onError` shows a toast (shadcn `toast()`) with the server error message; combobox stays open and input value is preserved.
- Slug collision (derived slug already exists): detected client-side before calling `POST /tags`; existing tag is selected silently.

## Public exports

- Hooks: `useTags()` — `src/hooks/use-tags.ts`
- Hooks: `useCreateTag()` — `src/hooks/use-create-tag.ts`
- Components: `<TagFilterBar />` — `src/components/tags/tag-filter-bar.tsx`
- Components: `<TagCombobox />` — `src/components/tags/tag-combobox.tsx`
- Types: `Tag` — `src/types/tag.ts`
- Query keys: `tagKeys` — `src/lib/queries/tags.ts`

## Decisions

- **Single `['tags']` key, no per-item keys.** Tag list is small and fully replaced on every mutation; no need for individual cache entries. Simplifies invalidation to one `queryClient.invalidateQueries({ queryKey: ['tags'] })` call.
- **Slug derived client-side, not server-side.** Allows collision detection before the network call, eliminating a round-trip error. Server remains authoritative — it still validates uniqueness.
- **`<Command>` + `<Popover>` instead of a native `<select multiple>`.** shadcn `Command` gives keyboard nav, search filtering, and custom item rendering (the "Create" option) without building a custom dropdown. Consistent with shadcn combobox documentation pattern. (Ref: Dub tags dropdown)
- **`aria-pressed` on filter chips, not `role="checkbox"`.** Chips are toggle buttons in a toolbar context; `aria-pressed` maps more naturally than checkbox semantics for filter affordance.
- **Magenta (`--color-secondary`) for active tag chips, NOT cyan.** DESIGN.md §Components specifies "Secondary (Magenta) for tag categorisation". Cyan is reserved for primary actions + active borders. Inactive chips: transparent bg + 1px `--color-outline` border; active: `--color-secondary` bg with `--color-on-secondary` text. (Ref: Rox status chips)
- **Skeleton uses CSS opacity pulse, no shimmer.** DESIGN.md §Skeleton states: "Dark grey blocks (`surface-container-high`) matching content shape. No shimmer — CSS opacity pulse only." Chip skeleton = 3 placeholder `<div>` blocks of fixed width, animated with `@keyframes pulse` (opacity 1→0.4→1, 1.2s). (Ref: Cycle tags input)
- **Glow on chip/input hover+focus via `var(--shadow-glow-sm)`.** DESIGN.md §Elevation: outer glow `box-shadow: 0 0 0 1px #00ffff` for default active state; 10–15px blur for hover/focus on combobox trigger. Chip hover: `--shadow-glow-sm`; combobox focus ring: `--shadow-glow`. No standard box shadows elsewhere.

## References

<<<REFERENCES_START>>>
## References

### Tag Filter Chip Bar (Scrollable, Multi-Select, URL-Synced)
- **Dub · tags input in link creation modal** — Horizontally scrollable pill chips with semantic colors, selected chips dismissible with × icon. Chips use subtle background + text color. **Adopt:** `label-caps` typography (monospaced, 12px, 0.1em letter-spacing for terminal feel), rectangular chip geometry (0px radius per DESIGN.md), neon magenta (#ff00ff) for active state with subtle outer glow on hover. Spacing: 8px gutter between chips, 4px unit padding inside chips. https://refero.design/pages/42e3df15-8dd6-49ef-9d6a-842c72347a88

- **Rox · tags column in account table** — Status chips (HIGH, LOW) rendered as small rectangles with uppercase labels; inactive uses muted bg, active uses warm accent. **Adopt:** Zero-radius geometry, cyan (#00ffff) for active/focused state (per DESIGN.md primary), emit subtle pulse glow (50–100ms, no bounce) on activation. Contrast: Magenta (#ff00ff) on black (#000000) = 7.08:1 ✓ WCAG AAA. https://refero.design/pages/08479c4b-7509-47c5-9450-f3130362aa24

### Multi-Select Combobox with Inline Creation
- **Dub · tags dropdown in link form** — Search-enabled dropdown ("Search or add tags…") with checkbox-style existing items, inline creation spinner, and visual confirmation on tag add. **Adopt:** Monospaced input placeholder (JetBrains Mono), cyan border (#00ffff) on focus with 10–15px blur outer glow, dark surface (#131313) dropdown. Spinner during create: opacity pulse 800–1200ms (mechanical, no spring). https://refero.design/pages/42e3df15-8dd6-49ef-9d6a-842c72347a88

- **n8n · tag management modal with inline add** — "Search Tags" input + inline edit row with "Cancel"/"Create tag" button pair. Successful create adds row and closes edit state. **Adopt:** Monospaced labels (body-mono token), lime (#32cd32) for create confirm, 1px border highlight on focus (outline-active #00ffff). 0px radius. Disabled state: 0.5 opacity + no pointer events until input valid. https://refero.design/pages/697eb5c3-9fa6-46a9-a990-18203ceb6f97

### Loading Skeleton & Error States
- **Cycle · feedback creation input with inline tags** — Skeleton state: dark gray blocks matching content shape, no shimmer — CSS opacity pulse only (per DESIGN.md). **Adopt:** surface-container-high (#2a2a2a) for skeleton blocks, pulse cycle fade 600ms per side. 44×44px min touch targets. https://refero.design/pages/c3b21060-ac77-42fb-8bac-6879c872d5e7

- **n8n · error state with banner** — Error banner uses coral color with close icon, height ~40px, padding 8px 16px. **Adopt:** Use error token (#ffb4ab), 1px top border in error color + monospaced label-caps text, 50–100ms fade-in. Retry: ghost style (1px outline, no fill) with cyan text (#00ffff). https://refero.design/pages/697eb5c3-9fa6-46a9-a990-18203ceb6f97
<<<REFERENCES_END>>>
