import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { EditIcon, ExternalLinkIcon, MoreVerticalIcon, Trash2Icon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BookmarkDeleteDialog } from "./bookmark-delete-dialog"
import { useDeleteBookmark } from "@/hooks/use-delete-bookmark"
import { formatRelativeTime } from "@/lib/relative-time"
import { cn } from "@/lib/utils"
import type { Bookmark } from "@/types/bookmark"

interface BookmarkCardProps {
  bookmark: Bookmark
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

/**
 * REQ-1, REQ-2, REQ-10, REQ-a11y-1, REQ-a11y-4, REQ-a11y-5, REQ-a11y-8
 * Terminal-style bookmark card with favicon, monospaced title/URL, tag chips,
 * relative date, and kebab menu (Edit + Delete).
 */
export function BookmarkCard({ bookmark }: BookmarkCardProps) {
  const navigate = useNavigate()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const deleteBookmark = useDeleteBookmark()

  const domain = getDomain(bookmark.url)
  const faviconSrc = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`

  function handleEdit() {
    void navigate({ to: "/bookmarks/$id/edit", params: { id: bookmark.id } })
  }

  function handleDelete() {
    setDeleteOpen(true)
  }

  function handleConfirmDelete() {
    deleteBookmark.mutate(bookmark.id, {
      onSuccess: () => setDeleteOpen(false),
    })
  }

  return (
    <>
      {/* REQ-a11y-1: card is a landmark link to detail */}
      <article
        className={cn(
          // DESIGN.md: rectangular card, 1px outline border, surface bg
          "group/card flex flex-col overflow-hidden border border-outline bg-card",
          // DESIGN.md: hover = border snaps to outline-active + glow-sm at 50-100ms
          "transition-[border-color,box-shadow] duration-75 motion-reduce:transition-none",
          "hover:border-outline-active hover:[box-shadow:var(--shadow-glow-sm)]",
          "focus-within:border-outline-active focus-within:[box-shadow:var(--shadow-glow-sm)]",
        )}
        aria-label={bookmark.title}
      >
        {/* Card header: favicon + title + kebab menu */}
        <div className="flex items-center gap-2 border-b border-outline bg-surface-container px-3 py-2">
          {/* REQ-2: Favicon — decorative */}
          <img
            src={faviconSrc}
            alt=""
            aria-hidden="true"
            width={16}
            height={16}
            className="size-4 shrink-0 object-contain transition-[filter] duration-75 group-hover/card:brightness-110 group-hover/card:saturate-150"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = "none"
            }}
          />

          {/* REQ-1: Title — monospaced (DESIGN.md: body-mono for card titles) */}
          <a
            href={`/bookmarks/${bookmark.id}`}
            onClick={(e) => {
              e.preventDefault()
              void navigate({
                to: "/bookmarks/$id",
                params: { id: bookmark.id },
              })
            }}
            className={cn(
              "min-w-0 flex-1 font-mono text-mono font-bold text-on-surface",
              "truncate tracking-[0.05em]",
              "focus-visible:outline-none focus-visible:underline focus-visible:decoration-primary",
            )}
          >
            {bookmark.title}
          </a>

          {/* Kebab menu — REQ-10, REQ-a11y-4 */}
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`Actions for ${bookmark.title}`}
              className={cn(
                "relative flex size-7 shrink-0 items-center justify-center border border-transparent",
                "text-on-surface-variant",
                "transition-[border-color,color] duration-75 motion-reduce:transition-none",
                "hover:border-outline hover:text-on-surface",
                "focus-visible:outline-none focus-visible:border-ring focus-visible:text-on-surface",
                // Expand touch target
                "after:absolute after:-inset-[6px] after:content-['']",
              )}
            >
              <MoreVerticalIcon className="size-4" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[120px]">
              <DropdownMenuItem onClick={handleEdit}>
                <EditIcon className="size-4" aria-hidden="true" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-error focus:bg-error/10 focus:text-error"
              >
                <Trash2Icon className="size-4" aria-hidden="true" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Card body */}
        <div className="flex flex-1 flex-col gap-2 p-3">
          {/* URL — monospaced, truncated (DESIGN.md: URLs use body-mono) */}
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${bookmark.url} in new tab`}
            className={cn(
              "flex items-center gap-1 font-mono text-xs text-on-surface-variant",
              "truncate tracking-[0.05em]",
              "transition-[color] duration-75 motion-reduce:transition-none",
              "hover:text-primary",
              "focus-visible:outline-none focus-visible:underline focus-visible:decoration-primary",
            )}
          >
            <ExternalLinkIcon className="size-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{domain}</span>
          </a>

          {/* Description */}
          {bookmark.description && (
            <p className="line-clamp-2 text-sm text-on-surface-variant">
              {bookmark.description}
            </p>
          )}

          {/* Tag chips — REQ-2, REQ-a11y-8: secondary/magenta per DESIGN.md */}
          {bookmark.tags.length > 0 && (
            <div className="flex flex-wrap gap-1" aria-label="Tags">
              {bookmark.tags.map((slug) => (
                <span
                  key={slug}
                  className={cn(
                    "inline-flex items-center border border-secondary px-1.5 py-0.5",
                    "font-mono text-label-caps font-bold uppercase tracking-[0.1em] text-secondary",
                  )}
                >
                  {slug}
                </span>
              ))}
            </div>
          )}

          {/* Relative date */}
          <time
            dateTime={bookmark.createdAt}
            className="mt-auto font-mono text-xs text-on-surface-variant opacity-60"
            aria-label={`Saved ${formatRelativeTime(bookmark.createdAt)}`}
          >
            {formatRelativeTime(bookmark.createdAt)}
          </time>
        </div>
      </article>

      {/* REQ-10, REQ-11: Delete confirmation */}
      <BookmarkDeleteDialog
        open={deleteOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteOpen(false)}
        title={bookmark.title}
        isConfirming={deleteBookmark.isPending}
      />
    </>
  )
}
