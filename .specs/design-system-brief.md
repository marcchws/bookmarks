# Design System Brief — Bookmarks

## Product

**Name:** Bookmarks

**One-liner:** A single-page bookmark manager that lets users save, organise, and delete URL bookmarks.

**Target audience:** Power users and developers who want a fast, keyboard-friendly tool to capture and retrieve URLs — people who think in links and want their bookmark manager to feel like part of the machine, not a productivity app.

---

## Tone & personality

**Concept:** "The internet, raw and electric." A tool built inside the machine — not on top of it.

**Feel:** Tech-forward. High contrast. Glowing. Bookmark cards feel like terminal windows or HUD panels. Images and favicons are visual heroes, not decorative accents. Motion is electric — things light up, pulse, snap into place. The UI looks like it belongs in a sci-fi film but is completely usable.

**Energy:** Cyberpunk without the gimmicks. Dark backgrounds, neon glows, images as first-class citizens. Every interaction should feel like flipping a switch on a control panel — immediate, precise, satisfying.

**Anti-patterns to avoid:** Rounded bubbly shapes, pastel palettes, soft drop shadows, playful copy, decorative illustrations.

---

## Key surfaces

1. **Bookmark list** — Primary view. Card grid (2 cols mobile, 3 cols ≥ md). Search bar + tag filter chip bar above the grid. Each card: favicon, title, URL, tag chips, relative date, kebab action menu. Includes empty state, loading skeleton, and error banner.

2. **Bookmark detail** — Read-only detail panel. All fields + tags + formatted dates. Action bar with Edit, Delete, and "Open URL" external link.

3. **Bookmark form** — Create and edit mode (same component). Fields: URL, Title (auto-populated), Description, Tags (multi-select combobox with inline tag creation). Validation feedback, server error handling.

4. **Tag filter bar** — Embedded in the list view. Multi-select chip bar. Tags fetched once, cached 5 min.

---

## Refero references

### Bookmark List (Card Grid with Search & Filters)
- **Pocket · List view (dark)** — Horizontal list of bookmark cards, each with thumbnail image (left), title, domain, excerpt snippet, relative date, tag chips, and kebab menu (right). Dark background (#1B1B1B), teal accent (#2EB4B1) for active filter states. 200+ bookmarks in vertical scroll. **Adopt:** Dark background token, teal accent for active states, grid layout 2–3 cols responsive, image-first thumbnail (40-50px left), title + domain + excerpt text stack (14px body, 12px metadata gray), tag chips with borders in secondary color. https://refero.design/pages/fec48eee-7540-439f-8262-5793d4e46466

- **Glorify · Asset grid (dark)** — Dark thumbnail grid for image/video assets with 3–4 column layout. Each card: thumbnail, filename, size metadata, actions (add tag, favorite, more). Dark background (#232323), light text (#CFCFCF). Inline tag editing popover on hover. **Adopt:** Dark grid layout, card border on hover/select (blue #3B82F6), hover state actions (add tag button), metadata in 12px gray below image. https://refero.design/pages/7ea0bbeb-9ebd-413f-8b18-a0cee66dfccf

- **Runway · Media library grid (dark)** — 3–4 column asset grid with dark background (#121212), white text, filter bar top (Media, Type, Tag dropdowns), view toggle (grid/list), sort dropdown. Each asset card: thumbnail with overlay actions (heart favorite, add tag). Selected items show blue border + bulk action toolbar (Share, Download, Favorite, Move, Delete). **Adopt:** 4-col grid responsive to 2-col mobile, dark borders on select (#3231E5 accent), filter bar horizontal layout, bulk action bar pattern. https://refero.design/pages/1b486d1e-5dc7-4d96-8bc4-7eca5440358b

### Tag Filter Bar
- **Pocket · Sidebar filters** — Left sidebar with "Filters" label, vertically stacked filter sections (Archive, Favorites, Highlights, Articles, Videos, All Tags). Teal highlight (#2EB4B1) on active filter. "Saves" active with teal background. **Adopt:** Vertical chip/filter bar, teal active state, icon + text labels, single-select or multi-select toggle, 1 item added confirmation message.

- **Runway · Filter row** — Horizontal filter bar with 3 dropdowns (Media, Type, Tag) + layout toggles (grid/list icons) + compact slider + sort dropdown. Dark dropdowns (#545254 border), white text, blue accent (#3231E5). **Adopt:** Horizontal layout, dark dropdown backgrounds, blue accent on active filter, view mode toggles, sort dropdown on right.

### Bookmark Form (Create/Edit Modal)
- **ChargeTrip · Project name modal** — Centered dark modal (#2d2f38), white header text "Set project name", single text input with blue focus border (#3a67f2), blue "Next" button (bottom right), close X (top right). **Adopt:** Dark modal background, blue focus border on input (matches accent), blue CTA button, minimal form (one field per screen), blue token #3a67f2. https://refero.design/pages/79af5005-5e13-47da-b49f-794ee5365fd6

- **n8n · Data table creation modal** — Dark modal with title, text input (data table name), radio buttons (From scratch / Import CSV), large drop zone (light gray border, document icon, upload text), checkbox (CSV has header), Cancel + Create buttons (red accent #9C5245). **Adopt:** Vertical form stack, radio button pattern for mode selection, large drag-drop zone with icon + text, red/brown accent for secondary actions. https://refero.design/pages/13aacc3b-1969-4673-8b16-38f102b82f36

- **ElevenReader · Create GenFM modal** — Dark modal with horizontal tab navigation (From link / From file / From text), file upload zone (dashed border), format selector (Podcast / Bulletin radio with descriptions), Create button. **Adopt:** Tab navigation for input mode selection, dashed drop zone, radio option cards with descriptive text, single Create button bottom-right. https://refero.design/pages/00350527-b5d5-4bf5-8a16-8c3fea46fd27

### Bookmark Detail (Read-Only Panel)
- **Cosmos · Cluster detail** — Modal showing element details with image overlay, title at top-center, metadata fields below, delete confirmation button. Dark background, white text, minimal UI. **Adopt:** Dark background, centered title, metadata in secondary gray, action button at bottom (red for delete). https://refero.design/pages/1d86c657-4580-419e-b0ad-bdb0f7d2bea7

### Action Menu (Kebab / More)
- **Pocket · Card action menu** — Each list item has right-side icons: star (favorite), share, view original link, copy, delete. Gray icons (#7A7978), dark background. **Adopt:** Right-aligned action icon group, gray icon color token, hover reveal pattern optional, four–five key actions (favorite, share, open external, copy link, delete).

### Empty State & Loading
- **Twist · Loading state** — Centered on white background: teal logo icon (40×40px, #030859), circular spinner below (20×20px), clean minimal style. **Adopt:** Centered logo + spinner pattern, small sizes, teal accent color for logo. https://refero.design/pages/e881b4af-b3bc-47ab-b322-d4804911ef03

### Gaps
- **Dark cyberpunk glowing neon accents** — Refero returned high-contrast dark interfaces but not full "HUD panel" / "electric glow" aesthetic. Most refs use blue/teal accents without animated glow or pulsing effects. Recommend custom glow/shadow tokens (e.g., `box-shadow: 0 0 8px rgba(46, 180, 177, 0.4)`) and animated pulse on hover.
- **Favicon display patterns** — Limited refs for favicon rendering in list items. Recommend Google S2 favicon API pattern (`https://www.google.com/s2/favicons?domain=example.com`).
- **Relative date formatting** — Pocket shows relative dates; no explicit patterns for localization or timezone handling in refs.
