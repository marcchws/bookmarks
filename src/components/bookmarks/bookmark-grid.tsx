import { AlertCircleIcon, RefreshCwIcon } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"

import { cn } from "@/lib/utils"
import { BookmarkCard } from "./bookmark-card"
import type { Bookmark } from "@/types/bookmark"

interface BookmarkGridProps {
  bookmarks: Bookmark[]
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

/**
 * REQ-1, REQ-a11y-7, REQ-resp-1, REQ-state-1, REQ-state-2, REQ-state-3
 * Renders a CSS grid of BookmarkCards. Handles empty, loading, error, and
 * populated states. aria-busy signals loading to screen readers.
 */
export function BookmarkGrid({
  bookmarks,
  isLoading,
  isError,
  onRetry,
}: BookmarkGridProps) {
  // REQ-state-3: Error state — shows inline banner + retry
  if (isError) {
    return (
      <div
        role="alert"
        className="flex items-start gap-3 border border-error bg-surface-container p-4 text-error"
      >
        <AlertCircleIcon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div className="flex-1">
          <p className="font-mono text-label-caps font-bold uppercase tracking-[0.1em]">
            Failed to load bookmarks
          </p>
          <p className="mt-1 font-mono text-mono text-on-surface-variant">
            Could not retrieve your bookmarks. Check your connection and try again.
          </p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            "relative shrink-0 inline-flex items-center gap-1.5 border border-primary px-3 py-1.5",
            "font-mono text-label-caps font-bold uppercase tracking-[0.1em] text-primary",
            "transition-[box-shadow,background-color] duration-75 motion-reduce:transition-none",
            "hover:bg-primary hover:text-on-primary hover:shadow-glow",
            "focus-visible:outline-none focus-visible:shadow-[0_0_0_1px_var(--color-ring)]",
            "active:translate-x-0.5",
            "after:absolute after:-inset-y-[8px] after:left-0 after:right-0 after:content-['']",
          )}
          aria-label="Retry loading bookmarks"
        >
          <RefreshCwIcon className="size-3.5" aria-hidden="true" />
          Retry
        </button>
      </div>
    )
  }

  // REQ-state-2: Loading state — 6 skeleton cards (DESIGN.md: opacity pulse, no shimmer)
  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Loading bookmarks"
        aria-busy="true"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
        <span className="sr-only">Loading bookmarks…</span>
      </div>
    )
  }

  // REQ-state-1: Empty state — terminal ASCII art block
  if (bookmarks.length === 0) {
    return <BookmarkEmptyState />
  }

  // REQ-resp-1: Populated grid
  return (
    <div
      aria-busy="false"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
    >
      {bookmarks.map((bookmark) => (
        <BookmarkCard key={bookmark.id} bookmark={bookmark} />
      ))}
    </div>
  )
}

// DESIGN.md: skeleton = surface-container-high bg, CSS opacity pulse, no shimmer
function SkeletonCard() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col overflow-hidden border border-outline bg-card"
    >
      {/* Header skeleton */}
      <div className="flex items-center gap-2 border-b border-outline bg-surface-container px-3 py-2">
        <div className="size-4 shrink-0 animate-pulse bg-surface-container-high opacity-100 motion-reduce:animate-none" />
        <div className="h-4 w-2/3 animate-pulse bg-surface-container-high motion-reduce:animate-none" />
        <div className="ml-auto size-7 animate-pulse bg-surface-container-high motion-reduce:animate-none" />
      </div>
      {/* Body skeleton */}
      <div className="flex flex-col gap-2 p-3">
        <div className="h-3 w-1/2 animate-pulse bg-surface-container-high motion-reduce:animate-none" />
        <div className="h-3 w-full animate-pulse bg-surface-container-high motion-reduce:animate-none" />
        <div className="h-3 w-5/6 animate-pulse bg-surface-container-high motion-reduce:animate-none" />
        <div className="mt-1 flex gap-1">
          <div className="h-5 w-16 animate-pulse bg-surface-container-high motion-reduce:animate-none" />
          <div className="h-5 w-12 animate-pulse bg-surface-container-high motion-reduce:animate-none" />
        </div>
      </div>
    </div>
  )
}

// DESIGN.md: terminal ASCII art for empty state (no external assets)
function BookmarkEmptyState() {
  const navigate = useNavigate()

  return (
    <div
      className="flex flex-col items-center justify-center gap-6 py-16"
      role="status"
      aria-label="No bookmarks found"
    >
      <pre
        className="select-none text-center font-mono text-xs leading-tight text-primary"
        aria-hidden="true"
      >{`
  ╔══════════════════════╗
  ║  ╔════════════════╗  ║
  ║  ║                ║  ║
  ║  ║   NO NODES     ║  ║
  ║  ║   ARCHIVED     ║  ║
  ║  ║                ║  ║
  ║  ╚════════════════╝  ║
  ║      [  EMPTY  ]     ║
  ╚══════════════════════╝
        ▲ INITIALIZE ▲
`}</pre>

      <div className="flex flex-col items-center gap-2 text-center">
        <p className="font-mono text-label-caps font-bold uppercase tracking-[0.1em] text-on-surface">
          No bookmarks archived
        </p>
        <p className="font-mono text-mono text-on-surface-variant">
          Start building your knowledge base by saving your first URL.
        </p>
      </div>

      <button
        type="button"
        onClick={() => void navigate({ to: "/bookmarks/new" })}
        className={cn(
          "inline-flex items-center gap-2 border border-primary px-6 py-2.5",
          "font-mono text-label-caps font-bold uppercase tracking-[0.1em] text-primary",
          "transition-[background-color,box-shadow] duration-75 motion-reduce:transition-none",
          "hover:bg-primary hover:text-on-primary hover:shadow-glow",
          "focus-visible:outline-none focus-visible:shadow-[0_0_0_1px_var(--color-ring)]",
          "active:translate-x-0.5",
        )}
      >
        + Archive First Node
      </button>
    </div>
  )
}

