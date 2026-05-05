# Project — Bookmarks

Stack: Vite + React 19 · TypeScript · Tailwind v4 · shadcn · TanStack Router · TanStack Query.

## Workflow

See `~/.claude/CLAUDE.md` for the full workflow. After bootstrap:
1. `/spec --srs <SRS>` — generates `.specs/design-system-brief.md` + module specs
2. Take `.specs/design-system-brief.md` to Stitch — create the design system (manual step)
3. `/personalize "Bookmarks"` — fetches DESIGN.md + wires the design system into src/

Workflow artifacts live in `.specs/` (committed except `*/visual-qa/`), `logs/` (gitignored).

<!-- Build commands, test setup, and discovered conventions: run `/init` to populate. -->
