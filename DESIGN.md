---
name: Cyber-OLED Terminal
colors:
  background: '#000000'
  surface: '#131313'
  surface-container: '#1f1f1f'
  surface-container-high: '#2a2a2a'
  on-surface: '#e2e2e2'
  on-surface-variant: '#b9cac9'
  outline: '#333333'
  outline-active: '#00ffff'
  primary: '#00ffff'
  on-primary: '#000000'
  secondary: '#ff00ff'
  on-secondary: '#000000'
  tertiary: '#32cd32'
  on-tertiary: '#000000'
  error: '#ffb4ab'
  on-error: '#690005'
typography:
  h1:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  h2:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  body-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.05em
  body-sans:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0px
  DEFAULT: 0px
  md: 0px
  lg: 0px
  xl: 0px
  full: 0px
spacing:
  unit: 4px
  gutter: 16px
  margin: 24px
  container-max: 1440px
  bento-gap: 12px
---

## Brand & Style

The brand personality is aggressive, technical, and unapologetically digital. It targets power users who view the internet as a high-density data stream rather than a curated garden. The UI should evoke the feeling of operating a high-end mainframe or a futuristic HUD (Heads-Up Display).

The design style is **High-Contrast / Brutalist-Cyberpunk**. It leverages the absolute black of OLED screens to make neon accents feel electric. By stripping away organic shapes and decorative fluff, the system focuses on raw data density and technical precision. Every element serves a functional purpose, wrapped in a sci-fi shell that prioritizes speed and clarity.

## Colors

The palette is anchored in absolute black (`#000000`) to maximize contrast and battery efficiency on OLED displays.

- **Primary (Cyan `#00ffff`):** Primary actions, system status, active borders, focus rings, hover glows.
- **Secondary (Magenta `#ff00ff`):** Secondary interactions, warnings, tag chips for categorisation.
- **Tertiary (Lime `#32cd32`):** Success states, secure connections, confirmation feedback.
- **Neutrals:** `surface` (#131313) base layer; `surface-container` (#1f1f1f) raised panels; `surface-container-high` (#2a2a2a) elevated modals. `on-surface` (#e2e2e2) primary text; `on-surface-variant` (#b9cac9) secondary text. `outline` (#333333) default borders; `outline-active` (#00ffff) active/focus borders.

Avoid all gradients unless they represent a light-source glow. Transparency only for scanline overlays or terminal window headers.

## Typography

Three fonts, each with a distinct role:

- **Space Grotesk** — headings (`h1`, `h2`). Sharp geometric terminations. All headings **uppercase**.
- **Inter** (`body-sans`) — body copy, links, form labels. High legibility at density.
- **JetBrains Mono** (`body-mono`, `label-caps`) — metadata, URL text, tag labels, timestamps. Reinforces HUD aesthetic. Letter-spacing widened on `label-caps` (0.1em) for terminal clarity.

## Layout & Spacing

**Fixed Bento Grid.** Content in rectangular modules that lock together with mathematical precision.

- **Grid:** 12-column, 16px gutters.
- **Rhythm:** All spacing multiples of 4px (`unit: 4px`).
- **Bento logic:** Elements span columns/rows to create a tessellated appearance. No orphaned corners.
- **Margins:** 24px+ external margins let the central data grid breathe against the OLED background.

## Elevation & Depth

Standard box shadows are **strictly prohibited**. Depth via tonal layering + neon light emission only.

- **Z-axis hierarchy:** Higher elevation = brighter high-contrast border (`#ffffff`) or neon outer glow.
- **Outer glows:** `box-shadow` with 0 blur + 1px spread for default active state; 10–15px blur with high-saturation neon (`#00ffff`) for hover/focus.
- **Scanlines:** Optional fixed-position 1px horizontal lines at 10% opacity on the base layer to simulate CRT surface.

## Shapes

**Zero-Radius Geometry.** Every corner is a sharp 90° angle. The `rounded` block is set to `0px` at all scales — never override with `rounded-*` utilities.

Avoid circular elements (no pill-shapes, no `rounded-full` for interactive elements). Borders: 1px default, 2px active/focused.

## Components

### Buttons
Rectangular, 1px border ghost style by default. On hover: snap to solid neon fill + matching outer glow. On active: 2px horizontal translate to simulate mechanical press.

### Bookmark Cards (Terminal Style)
Top header bar with favicon + monospaced window title. Border: 1px `outline` (#333333). On hover: border snaps to `#00ffff` with subtle pulse animation. Images: high-saturation filter; glitch filter on hover.

### Inputs & Terminal Fields
1px border box (not underline-only). Focus state: border becomes `outline-active` (#00ffff) + neon glow. Placeholder text in `on-surface-variant`.

### Chips & Tags
Small rectangular containers, monospaced text (`label-caps`). Secondary (Magenta) for tag categorisation; Tertiary (Lime) for success/active state chips.

### Additional
- **Scrollbar:** 2px solid line, neon thumb.
- **Status indicators:** Square LEDs with subtle flicker animation for live data.
- **Skeleton states:** Dark grey blocks (`surface-container-high`) matching content shape. No shimmer — CSS opacity pulse only.

## Do's and Don'ts

**Icons**
- ✅ Use **Lucide** for all UI icons (`lucide-react`).
- ✅ Use `simple-icons` for brand logos Lucide doesn't cover.
- ❌ Never use Material Symbols / Material Icons — Stitch HTMLs use them as a reference artifact only; they must not appear in the codebase.
- ❌ Never use custom SVG or emoji as functional icons.

**Colors**
- ✅ Token-only. All color values via CSS vars from `@theme`.
- ❌ No raw hex values outside the `@theme` block in `src/index.css`.

**Motion**
- ✅ Respect `prefers-reduced-motion` on all transitions.
- ✅ Snap transitions (50–100ms) for border/color changes. Electric pulse (800–1200ms) for glow animations.
- ❌ No bouncy / spring / elastic easing — motion must feel precise and mechanical.
