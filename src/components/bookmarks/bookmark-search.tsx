import { useEffect, useRef } from "react"
import { SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface BookmarkSearchProps {
  value: string
  onChange: (value: string) => void
}

/**
 * REQ-3, REQ-a11y-2, REQ-resp-2
 * Debounced (300 ms) search input. Uses uncontrolled input with defaultValue
 * seeded from the URL param. The timer debounces propagation to the parent.
 * Parent owns URL state; input is uncontrolled to avoid circular re-renders.
 */
export function BookmarkSearch({ value, onChange }: BookmarkSearchProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onChange(next)
    }, 300)
  }

  return (
    <div className="relative w-full">
      <SearchIcon
        className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant"
        aria-hidden="true"
      />
      <input
        type="search"
        role="searchbox"
        aria-label="Search bookmarks"
        placeholder="SEARCH NODES…"
        defaultValue={value}
        onChange={handleChange}
        className={cn(
          // DESIGN.md: 1px border, focus = outline-active + neon glow, zero radius
          "h-11 w-full min-w-0 rounded-none border border-input bg-transparent py-2 pl-9 pr-3",
          "font-mono text-mono text-on-surface",
          "placeholder:font-mono placeholder:text-label-caps placeholder:font-bold placeholder:uppercase placeholder:tracking-[0.1em] placeholder:text-on-surface-variant",
          "transition-[border-color,box-shadow] duration-75 motion-reduce:transition-none",
          "outline-none",
          "focus-visible:border-ring focus-visible:shadow-[0_0_0_1px_var(--color-ring),0_0_10px_2px_color-mix(in_srgb,var(--color-ring)_40%,transparent)]",
        )}
      />
    </div>
  )
}
