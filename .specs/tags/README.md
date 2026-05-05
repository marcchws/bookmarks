# Tags Module — Dev Guide

## Overview

Two embeddable UI components. No standalone route — `TagFilterBar` embeds in the bookmark list, `TagCombobox` embeds in the bookmark form.

## Public exports

| Export | Path | Description |
|--------|------|-------------|
| `useTags()` | `src/hooks/use-tags.ts` | `useQuery` wrapper, `staleTime: 5 min` |
| `useCreateTag()` | `src/hooks/use-create-tag.ts` | `useMutation` wrapper, invalidates `['tags']` on success |
| `<TagFilterBar />` | `src/components/tags/tag-filter-bar.tsx` | Chip bar; props: `{ activeSlugs, onToggle }` |
| `<TagCombobox />` | `src/components/tags/tag-combobox.tsx` | Multi-select combobox; props: `{ value, onChange, name? }` |
| `Tag` type | `src/types/tag.ts` | `{ id, slug, label }` |
| `tagKeys` | `src/lib/queries/tags.ts` | `{ all: ['tags'] }` |
| `deriveSlug` | `src/lib/queries/tags.ts` | Client-side slug derivation (lowercase, hyphens, strip non-alnum) |

## MSW seed scenarios

| Key | File | Description |
|-----|------|-------------|
| `emptyTags` | `src/mocks/tags-seed.ts` | Empty list — exercises null render + "No tags yet" state |
| `populatedTags` | `src/mocks/tags-seed.ts` | 10 tags — happy-path default |
| `networkError` | `src/mocks/tags-seed.ts` | GET /tags 500 — exercises error banners + retry |

Default handler in `src/mocks/handlers.ts` uses `populatedTags`.

## Component API

### `<TagFilterBar />`

```tsx
<TagFilterBar
  activeSlugs={["design", "react"]}
  onToggle={(slug) => setActive(prev => toggle(prev, slug))}
/>
```

Parent owns URL state. Component reads `activeSlugs` from parent and calls `onToggle` on click/keyboard.

### `<TagCombobox />`

```tsx
<TagCombobox
  value={field.value}
  onChange={field.onChange}
  name="tags"
/>
```

Slug collision detection is client-side — if derived slug already exists in cache, selects existing tag without `POST /tags`.

## Flags

- **`@base-ui/react` used** — project does not have shadcn `<Command>`. `TagCombobox` uses existing `<Popover>` + custom keyboard-navigable listbox pattern.
- **Storybook decorator pattern** — stories use module-scoped `QueryClient` with `retry: false`. Combobox stories add `<Toaster />` from sonner in decorator so REQ-state-5 toasts render.
