import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { PlusIcon } from "lucide-react"
import { z } from "zod/v3"

import { BookmarkSearch } from "@/components/bookmarks/bookmark-search"
import { BookmarkGrid } from "@/components/bookmarks/bookmark-grid"
import { TagFilterBar } from "@/components/tags/tag-filter-bar"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { cn } from "@/lib/utils"

// REQ-1, REQ-3, REQ-4: Validate URL search params
const searchSchema = z.object({
  q: z.string().optional(),
  tag: z.union([z.string(), z.array(z.string())]).optional(),
})

export const Route = createFileRoute("/")({
  validateSearch: (search) => searchSchema.parse(search),
  component: BookmarkListPage,
})

function BookmarkListPage() {
  const navigate = useNavigate()
  const { q, tag } = Route.useSearch()

  // Normalize tag param — can be a single string or array
  const activeTags: string[] =
    tag === undefined
      ? []
      : Array.isArray(tag)
        ? tag
        : [tag]

  const { data: bookmarks = [], isLoading, isError, refetch } = useBookmarks({
    q: q || undefined,
    tag: activeTags.length > 0 ? activeTags : undefined,
  })

  // REQ-3: Update ?q= param from search input
  function handleSearchChange(value: string) {
    void navigate({
      to: "/",
      search: (prev) => ({ ...prev, q: value || undefined }),
      replace: true,
    })
  }

  // REQ-4: Toggle tag in ?tag= param
  function handleTagToggle(slug: string) {
    const next = activeTags.includes(slug)
      ? activeTags.filter((t) => t !== slug)
      : [...activeTags, slug]

    void navigate({
      to: "/",
      search: (prev) => ({
        ...prev,
        tag: next.length > 0 ? next : undefined,
      }),
      replace: true,
    })
  }

  return (
    <div className="mx-auto max-w-[var(--spacing-container-max)] px-[var(--spacing-margin)]">
      {/* Page header */}
      <header className="flex items-center justify-between border-b border-outline py-4">
        <h2 className="font-heading text-h2 font-semibold uppercase tracking-[-0.01em] text-on-surface sr-only">
          Bookmarks
        </h2>
        <button
          type="button"
          onClick={() => void navigate({ to: "/bookmarks/new" })}
          className={cn(
            "relative inline-flex items-center gap-1.5 border border-primary px-4 py-2",
            "font-mono text-label-caps font-bold uppercase tracking-[0.1em] text-primary",
            "transition-[background-color,box-shadow,transform] duration-75 motion-reduce:transition-none",
            "hover:bg-primary hover:text-on-primary hover:shadow-glow",
            "focus-visible:outline-none focus-visible:shadow-[0_0_0_1px_var(--color-ring)]",
            "active:translate-x-0.5",
            "after:absolute after:-inset-y-[6px] after:left-0 after:right-0 after:content-['']",
          )}
          aria-label="Add new bookmark"
        >
          <PlusIcon className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Archive Node</span>
          <span className="sm:hidden">New</span>
        </button>
      </header>

      <main className="py-4">
        {/* REQ-a11y-2, REQ-resp-2: Search + tag filters — stacked on mobile, side-by-side at md+ */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start">
          <div className="md:flex-1">
            <BookmarkSearch value={q ?? ""} onChange={handleSearchChange} />
          </div>
          <div role="group" aria-label="Filter by tag" className="md:w-auto">
            <TagFilterBar activeSlugs={activeTags} onToggle={handleTagToggle} />
          </div>
        </div>

        {/* REQ-resp-1: Bookmark grid */}
        <BookmarkGrid
          bookmarks={bookmarks}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
        />
      </main>
    </div>
  )
}
