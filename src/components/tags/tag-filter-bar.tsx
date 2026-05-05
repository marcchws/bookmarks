import { RefreshCwIcon, TagIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useTags } from "@/hooks/use-tags"

interface TagFilterBarProps {
  activeSlugs: string[]
  onToggle: (slug: string) => void
}

/**
 * REQ-2, REQ-3: Horizontally scrollable chip bar.
 * Parent manages URL state; this component only reads activeSlugs and fires onToggle.
 *
 * States:
 * - loading  → 3 skeleton chips (opacity-pulse, no shimmer — DESIGN.md)
 * - empty    → renders null (no gap in layout)
 * - error    → inline banner + retry button
 * - default  → chip list; active chips use secondary (magenta) per DESIGN.md
 */
export function TagFilterBar({ activeSlugs, onToggle }: TagFilterBarProps) {
  const { data: tags, isLoading, isError, refetch } = useTags()

  // REQ-state-1: Loading skeleton
  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Loading tags"
        aria-busy="true"
        className="flex flex-row gap-2 overflow-x-auto py-2"
        style={{ scrollbarWidth: "none" }}
      >
        {(["w-20", "w-16", "w-24"] as const).map((w) => (
          <div
            key={w}
            className={`h-11 shrink-0 animate-pulse bg-surface-container-high motion-reduce:animate-none ${w}`}
            aria-hidden="true"
          />
        ))}
        <span className="sr-only">Loading tags…</span>
      </div>
    )
  }

  // REQ-state-3: Error state
  if (isError) {
    return (
      <div
        role="alert"
        className="flex items-center gap-3 border border-error bg-surface-container px-4 py-2 text-error"
      >
        <span className="font-mono text-label-caps font-bold uppercase tracking-[0.1em] text-error">
          Could not load tags
        </span>
        <button
          type="button"
          onClick={() => void refetch()}
          className={cn(
            "relative inline-flex items-center gap-1.5 border border-primary px-3 py-1",
            "font-mono text-label-caps font-bold uppercase tracking-[0.1em] text-primary",
            "transition-[box-shadow,background-color] duration-75 motion-safe:transition-[box-shadow,background-color]",
            "hover:bg-primary hover:text-on-primary hover:shadow-glow",
            "focus-visible:outline-none focus-visible:shadow-[0_0_0_1px_var(--color-ring)]",
            "after:absolute after:-inset-y-2.5 after:left-0 after:right-0 after:content-['']",
          )}
          aria-label="Retry loading tags"
        >
          <RefreshCwIcon className="size-3.5" aria-hidden="true" />
          RETRY
        </button>
      </div>
    )
  }

  // REQ-state-2: Empty — render nothing
  if (!tags || tags.length === 0) {
    return null
  }

  return (
    <div
      role="toolbar"
      aria-label="Filter by tag"
      className="relative w-full overflow-hidden border-b border-outline py-2"
    >
      {/* Right gradient fade for scroll indication */}
      <div
        className="pointer-events-none absolute bottom-0 right-0 top-0 w-12 bg-linear-to-l from-background to-transparent"
        aria-hidden="true"
      />

      {/* Scrollable chip row — DESIGN.md: hide scrollbar */}
      <div
        className="flex flex-row gap-2 overflow-x-auto pl-1 pr-14"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
      >
        {tags.map((tag) => {
          const isActive = activeSlugs.includes(tag.slug)

          return (
            <button
              key={tag.slug}
              type="button"
              aria-pressed={isActive}
              onClick={() => onToggle(tag.slug)}
              className={cn(
                // Base: rectangular, monospaced label-caps, minimum 44px tap target via after:
                "relative flex shrink-0 items-center gap-1.5 border px-3 py-2",
                "font-mono text-label-caps font-bold uppercase tracking-[0.1em]",
                "transition-[border-color,background-color,box-shadow,color] duration-75",
                "motion-reduce:transition-none",
                "focus-visible:outline-none focus-visible:shadow-[0_0_0_1px_var(--color-ring)]",
                "active:translate-x-0.5",
                // Touch target expansion
                "after:absolute after:-inset-y-2 after:left-0 after:right-0 after:content-['']",
                // Active: magenta fill + black text (DESIGN.md: secondary = magenta for tags)
                isActive
                  ? "border-secondary bg-secondary text-on-secondary shadow-[0_0_10px_2px_color-mix(in_srgb,var(--color-secondary)_40%,transparent)]"
                  : [
                      "border-outline bg-transparent text-on-surface-variant",
                      "hover:border-secondary hover:text-secondary",
                      "hover:shadow-glow-sm",
                    ],
              )}
            >
              <TagIcon className="size-3 shrink-0" aria-hidden="true" />
              {tag.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
