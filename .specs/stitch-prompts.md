# Stitch prompts — Bookmarks

## How to use

1. Open Stitch (https://stitch.google)
2. Set the **Design mode** declared in the global header below (`Redesign (Nano Banana Pro)`)
3. For each surface, copy the prompt block and paste into a new Stitch screen
4. Paste the **Refero URL** from the Image slot — Stitch reads the URL directly as a reference image
5. Use the **Variations** count + range declared per surface (Stitch UI → Generate → Variations)
6. After generating, save the resulting HTML to `.specs/stitch/<filename>.html` (filename in the surface heading parens)
7. Once all surfaces are saved, run `/personalize "Bookmarks"`

## Global

**Design mode default:** Redesign (Nano Banana Pro)
**Style Word Bank baseline:** Layout: Bento Grid. Color: Dark Mode OLED. Atmosphere: Cyberpunk.
**Tone & personality:** "The internet, raw and electric." A tool built inside the machine — not on top of it. Tech-forward. High contrast. Glowing. Bookmark cards feel like terminal windows or HUD panels. Images and favicons are visual heroes, not decorative accents. Motion is electric — things light up, pulse, snap into place. The UI looks like it belongs in a sci-fi film but is completely usable. Cyberpunk without the gimmicks. Dark backgrounds, neon glows, images as first-class citizens. Every interaction should feel like flipping a switch on a control panel — immediate, precise, satisfying. Anti-patterns to avoid: rounded bubbly shapes, pastel palettes, soft drop shadows, playful copy, decorative illustrations.

---

## Surface — Bookmark list (`bookmark-list.html`)

**Reference:** [Pocket — List view (dark)](https://refero.design/pages/fec48eee-7540-439f-8262-5793d4e46466) — Horizontal list of bookmark cards with thumbnail, title, domain, excerpt, relative date, tag chips, and kebab menu on dark background; teal accent for active filter states.
**Device:** Web
**Design mode:** Redesign (Nano Banana Pro)
**Variations:** 3 options, Refined

**Idea:** Primary view of the bookmark manager — a responsive card grid with a search bar and tag filter chips above, each card showing favicon, title, URL, tags, relative date, and a kebab action menu.
**Theme:** Layout: Bento Grid. Color: Dark Mode OLED. Atmosphere: Cyberpunk.
**Content:** Page header with app name and "Add bookmark" primary button (top right). Search input full-width below header with search icon left and clear button right. Tag filter chip bar below search — horizontal scrollable row of chips, teal/accent outline on active chip, "All" chip selected by default. Card grid: 2 columns on mobile, 3 columns on medium screens and above. Each card: favicon (small, left-aligned top), title (bold, one line truncated), URL domain in muted color (one line truncated), description excerpt (two lines truncated), tag chips row (tinted border), relative date (bottom right, small muted). Kebab icon top-right of card reveals dropdown: Open, Copy link, Edit, Delete. Empty state: centered icon, heading "No bookmarks yet", subtext "Save your first URL to get started", "Add bookmark" button. Loading state: skeleton cards matching grid layout (same proportions, pulsing). Error banner: top of grid, dismissible, with retry action.
**Image:** https://refero.design/pages/fec48eee-7540-439f-8262-5793d4e46466

---

## Surface — Bookmark detail (`bookmark-detail.html`)

**Reference:** [Cosmos — Cluster detail](https://refero.design/pages/1d86c657-4580-419e-b0ad-bdb0f7d2bea7) — Modal showing element details with image overlay, title at top-center, metadata fields below, dark background, white text, action button at bottom.
**Device:** Web
**Design mode:** Redesign (Nano Banana Pro)
**Variations:** 3 options, Refined

**Idea:** Read-only detail panel for a single bookmark — showing all fields, tags, and formatted dates, with an action bar for Edit, Delete, and Open URL.
**Theme:** Layout: Bento Grid. Color: Dark Mode OLED. Atmosphere: Cyberpunk.
**Content:** Panel or modal with dark background. Top section: favicon large (hero treatment, centered or left-anchored), title heading below. Metadata section: URL as a clickable link (accent color), description paragraph, tags row (chip list with tinted borders), Created date and Updated date as labeled fields in muted secondary color. Action bar pinned to bottom: "Edit" button (secondary style), "Delete" button (destructive, outlined or ghost), "Open URL" button (primary, with external link icon). Close control (X) top-right. No editable inputs — all fields are display-only.
**Image:** https://refero.design/pages/1d86c657-4580-419e-b0ad-bdb0f7d2bea7

---

## Surface — Bookmark form (`bookmark-form.html`)

**Reference:** [ElevenReader — Create GenFM modal](https://refero.design/pages/00350527-b5d5-4bf5-8a16-8c3fea46fd27) — Dark modal with horizontal tab navigation for input mode selection, dashed drop zone, radio option cards with descriptive text, single Create button bottom-right.
**Device:** Web
**Design mode:** Redesign (Nano Banana Pro)
**Variations:** 3 options, Refined

**Idea:** Create and edit modal for a bookmark — same component for both modes, with URL, Title, Description, and Tags fields, plus validation feedback and server error handling.
**Theme:** Layout: Bento Grid. Color: Dark Mode OLED. Atmosphere: Cyberpunk.
**Content:** Modal with dark background. Modal header: title "Add bookmark" or "Edit bookmark" (mode-driven), close X top-right. Form body vertical stack: URL input (first, full-width, accent focus border — this field drives auto-population of Title); Title input (full-width, labeled, pre-filled when URL resolves); Description textarea (full-width, 3 rows, optional); Tags multi-select combobox (full-width) — shows existing tags as chips, search to filter, inline option to create new tag by typing and pressing Enter, selected tags appear as dismissible chips inside the field. Validation: inline error message below each invalid field (accent-red text, icon left). Server error: banner at top of form, dismissible. Footer: "Cancel" button (ghost, left) and "Save" button (primary, right). Loading state for Save: button shows spinner, disabled.
**Image:** https://refero.design/pages/00350527-b5d5-4bf5-8a16-8c3fea46fd27

---

## Surface — Tag filter bar (`tag-filter-bar.html`)

**Reference:** [Runway — Filter row](https://refero.design/pages/1b486d1e-5dc7-4d96-8bc4-7eca5440358b) — Horizontal filter bar with dropdowns, layout toggles, and sort dropdown; dark dropdown backgrounds, accent on active filter, view mode toggles right-aligned.
**Device:** Web
**Design mode:** Redesign (Nano Banana Pro)
**Variations:** 3 options, Refined

**Idea:** Horizontal multi-select chip bar embedded in the bookmark list view, used to filter bookmarks by tag — tags fetched once and cached.
**Theme:** Layout: Bento Grid. Color: Dark Mode OLED. Atmosphere: Cyberpunk.
**Content:** Horizontal scrollable chip row, no visible scroll bar. "All" chip leftmost — selected by default (accent fill). Each tag chip: label text, unselected state is ghost/outline, selected state uses accent-color fill or border. Multiple chips can be active simultaneously (multi-select). Chips are compact — single line, no icons. Right edge fades with gradient mask to indicate overflow. No label or heading above the bar — it lives directly below the search input and reads as a continuation of the filter system.
**Image:** https://refero.design/pages/1b486d1e-5dc7-4d96-8bc4-7eca5440358b

---

## Reference coverage notes

| Surface | Matched reference | Match quality |
|---|---|---|
| Bookmark list | Pocket — List view (dark) | Strong |
| Bookmark detail | Cosmos — Cluster detail | Partial |
| Bookmark form | ElevenReader — Create GenFM modal | Strong |
| Tag filter bar | Runway — Filter row | Strong |

**Gap flagged:** Bookmark detail (Cosmos) is a partial match — it covers dark background + metadata layout but lacks explicit tag chip rendering and the three-action bottom bar pattern. Designer should supplement with Pocket card action menu reference (https://refero.design/pages/fec48eee-7540-439f-8262-5793d4e46466) for the action bar composition.
