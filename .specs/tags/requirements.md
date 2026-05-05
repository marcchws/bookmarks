# Tags

## Goal

Enable users to create, browse, and filter by tags so bookmarks can be organised into named categories.

## User stories

- As a user, I want to filter the bookmark list by one or more tags so that I can quickly find bookmarks in a category.
- As a user, I want to create a new tag inline while filling in the bookmark form so that I don't have to leave my current task.
- As a user, I want tag chips to be visible in the filter bar at all times so that I always know which filters are active.

## Requirements

### Functional

- **REQ-1:** List all tags. Trigger: app mounts or tag list becomes stale. Acceptance: `GET /tags` is called; response is cached with `staleTime: 5 min`; tag data is available to both the filter bar and the bookmark form combobox without a second network request.

- **REQ-2:** Render tag filter chip bar above the bookmark grid. Trigger: tag list resolves. Acceptance: each tag renders as a toggleable chip; selecting a chip appends `?tag=<slug>` to the URL; deselecting removes it; multiple chips can be active simultaneously; active chips are visually distinct from inactive ones.

- **REQ-3:** Persist active tag filters in URL query params. Trigger: user toggles a chip or navigates back/forward. Acceptance: `?tag=<slug>` survives browser back/forward; the chip bar reflects the current URL state on mount.

- **REQ-4:** Create a new tag inline from the bookmark form combobox. Trigger: user types a value that doesn't match any existing tag and confirms. Acceptance: `POST /tags` is called with `{ label, slug }` derived from the typed value; on success, the new tag is appended to the cached tag list (TanStack Query cache invalidation) and immediately selected in the combobox; the user does not leave the form.

- **REQ-5:** Combobox displays all existing tags and allows selecting multiple. Trigger: user opens the tags field in the bookmark form. Acceptance: tags list is searchable; already-selected tags are checked; selecting/deselecting a tag updates the form field value; keyboard navigation (arrow keys, Enter, Escape) is fully functional.

- **REQ-6:** Inline creation validates the slug. Trigger: user triggers tag creation. Acceptance: slug is auto-derived from the label (lowercase, spaces replaced with hyphens, non-alphanumeric stripped); if the derived slug already exists the combobox selects the existing tag instead of calling `POST /tags`.

### Accessibility

- **REQ-a11y-1:** Filter chip bar is keyboard navigable. Acceptance: each chip receives focus via Tab; activation via Space or Enter; active state announced to screen readers via `aria-pressed="true"`.

- **REQ-a11y-2:** Combobox has a visible label and focus ring. Acceptance: `<label>` with `htmlFor` wires to the combobox trigger; focus ring uses `--ring` token; contrast ≥ 4.5:1 for label text.

- **REQ-a11y-3:** "Create tag" option inside combobox is clearly labelled. Acceptance: the option reads "Create '<value>'" so screen readers announce the intent; it is reachable by keyboard alone.

- **REQ-a11y-4:** All transitions respect `prefers-reduced-motion`. Acceptance: chip toggle animation and combobox open/close transition are wrapped in a `prefers-reduced-motion: reduce` media query and disabled when set.

### States

- **REQ-state-1:** Tags loading state — while `GET /tags` is in-flight the chip bar renders skeleton chips (3 placeholder items, same height as real chips); the combobox shows a loading spinner inside the dropdown.

- **REQ-state-2:** Tags empty state — when `GET /tags` returns an empty array, the chip bar renders nothing (no label, no gap); the combobox dropdown shows "No tags yet — type to create one".

- **REQ-state-3:** Tags error state — when `GET /tags` fails, the chip bar renders an inline error message "Could not load tags" with a retry button; the combobox shows "Failed to load tags" with a retry link.

- **REQ-state-4:** Inline create loading state — while `POST /tags` is in-flight the "Create '<value>'" option shows a spinner and is disabled to prevent double-submit.

- **REQ-state-5:** Inline create error state — if `POST /tags` returns an error, a toast or inline error message is shown without closing the combobox; the typed value is preserved so the user can retry.

## Out of scope

- Deleting or renaming tags.
- Tag colour or icon customisation.
- Tag merge / deduplication UI.
- Pagination of the tag list (all tags are returned in a single `GET /tags` call).
