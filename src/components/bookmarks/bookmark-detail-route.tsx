import { AlertCircleIcon, RefreshCwIcon } from "lucide-react"

import { useBookmark } from "@/hooks/use-bookmark"
import { BookmarkDetail } from "./bookmark-detail"
import { cn } from "@/lib/utils"

interface BookmarkDetailRouteProps {
  id: string
}

/**
 * REQ-12, REQ-state-5, REQ-state-6
 * Route-level wrapper that handles loading and error states before
 * rendering the BookmarkDetail presentation component.
 */
export function BookmarkDetailRoute({ id }: BookmarkDetailRouteProps) {
  const { data: bookmark, isLoading, isError, error, refetch } = useBookmark(id)

  if (isLoading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div
          role="status"
          aria-busy="true"
          aria-label="Loading bookmark"
          className="flex flex-col overflow-hidden border border-outline bg-card"
        >
          {/* Header skeleton */}
          <div className="flex items-center gap-3 border-b border-outline bg-surface-container px-4 py-3">
            <div className="size-5 shrink-0 animate-pulse bg-surface-container-high motion-reduce:animate-none" />
            <div className="h-4 w-2/3 animate-pulse bg-surface-container-high motion-reduce:animate-none" />
          </div>
          {/* Body skeleton */}
          <div className="flex flex-col gap-3 p-4">
            {(["w-60", "w-44", "w-72", "w-40"] as const).map((w) => (
              <div
                key={w}
                className={`h-4 animate-pulse bg-surface-container-high motion-reduce:animate-none ${w}`}
              />
            ))}
          </div>
          <span className="sr-only">Loading bookmark…</span>
        </div>
      </main>
    )
  }

  if (isError || !bookmark) {
    const is404 = error?.message?.includes("404")
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div
          role="alert"
          className="flex items-start gap-3 border border-error bg-surface-container p-4 text-error"
        >
          <AlertCircleIcon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <p className="font-mono text-label-caps font-bold uppercase tracking-[0.1em]">
              {is404 ? "Bookmark not found" : "Failed to load bookmark"}
            </p>
            <p className="mt-1 font-mono text-mono text-on-surface-variant">
              {is404
                ? "This bookmark may have been deleted or the link is invalid."
                : "Could not retrieve the bookmark. Check your connection and try again."}
            </p>
          </div>
          {!is404 && (
            <button
              type="button"
              onClick={() => void refetch()}
              className={cn(
                "relative shrink-0 inline-flex items-center gap-1.5 border border-primary px-3 py-1.5",
                "font-mono text-label-caps font-bold uppercase tracking-[0.1em] text-primary",
                "transition-[box-shadow,background-color] duration-75 motion-reduce:transition-none",
                "hover:bg-primary hover:text-on-primary hover:shadow-glow",
                "focus-visible:outline-none focus-visible:shadow-[0_0_0_1px_var(--color-ring)]",
                "active:translate-x-0.5",
                "after:absolute after:-inset-y-[8px] after:left-0 after:right-0 after:content-['']",
              )}
            >
              <RefreshCwIcon className="size-3.5" aria-hidden="true" />
              Retry
            </button>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <BookmarkDetail bookmark={bookmark} />
    </main>
  )
}
