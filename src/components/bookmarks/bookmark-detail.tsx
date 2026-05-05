import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import {
  CalendarIcon,
  EditIcon,
  ExternalLinkIcon,
  GlobeIcon,
  TagIcon,
  Trash2Icon,
} from "lucide-react"

import { BookmarkDeleteDialog } from "./bookmark-delete-dialog"
import { useDeleteBookmark } from "@/hooks/use-delete-bookmark"
import { formatFullDate, formatRelativeTime } from "@/lib/relative-time"
import { getFaviconSrc } from "@/lib/url"
import { cn } from "@/lib/utils"
import type { Bookmark } from "@/types/bookmark"

interface BookmarkDetailProps {
  bookmark: Bookmark
}

/**
 * REQ-12, REQ-a11y-1, REQ-a11y-5, REQ-resp-3, REQ-state-5
 * Detail layout: header (favicon + title), field rows, footer action bar.
 * DESIGN.md: detail/form labels use label-caps token.
 */
export function BookmarkDetail({ bookmark }: BookmarkDetailProps) {
  const navigate = useNavigate()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const deleteBookmark = useDeleteBookmark()

  const faviconSrc = getFaviconSrc(bookmark.url)

  function handleConfirmDelete() {
    deleteBookmark.mutate(bookmark.id, {
      onSuccess: () => {
        void navigate({ to: "/" })
      },
    })
  }

  return (
    <>
      <article
        className="flex flex-col overflow-hidden border border-outline bg-card"
        aria-label={bookmark.title}
      >
        {/* Header: favicon + title */}
        <header className="flex items-center gap-3 border-b border-outline bg-surface-container px-4 py-3">
          <img
            src={faviconSrc}
            alt=""
            aria-hidden="true"
            width={20}
            height={20}
            className="size-5 shrink-0 object-contain"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = "none"
            }}
          />
          {/* DESIGN.md: monospaced window title */}
          <h2 className="min-w-0 flex-1 truncate font-mono text-mono font-bold tracking-[0.05em] text-on-surface">
            {bookmark.title}
          </h2>
        </header>

        {/* Field rows — 2-column layout at md+ (REQ-resp-3, Craft 9) */}
        <div className="md:grid md:grid-cols-2 md:divide-x md:divide-outline">
          {/* Left column: URL + Description + Dates */}
          <div className="flex flex-col divide-y divide-outline">
            {/* URL */}
            <div className="flex items-start gap-3 px-4 py-3">
              <GlobeIcon
                className="mt-0.5 size-4 shrink-0 text-on-surface-variant"
                aria-hidden="true"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="font-mono text-label-caps font-bold uppercase tracking-[0.1em] text-on-surface-variant">
                  URL
                </span>
                {/* DESIGN.md: URLs use body-mono */}
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${bookmark.url} in new tab`}
                  className={cn(
                    "font-mono text-mono text-primary",
                    "break-all tracking-[0.05em]",
                    "transition-[color] duration-75 motion-reduce:transition-none",
                    "hover:underline",
                    "focus-visible:outline-none focus-visible:underline focus-visible:decoration-primary",
                  )}
                >
                  {bookmark.url}
                </a>
              </div>
            </div>

            {/* Description */}
            {bookmark.description && (
              <div className="flex items-start gap-3 px-4 py-3">
                <div className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="font-mono text-label-caps font-bold uppercase tracking-[0.1em] text-on-surface-variant">
                    Description
                  </span>
                  <p className="text-sm text-on-surface">{bookmark.description}</p>
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="flex items-start gap-3 px-4 py-3">
              <CalendarIcon
                className="mt-0.5 size-4 shrink-0 text-on-surface-variant"
                aria-hidden="true"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-label-caps font-bold uppercase tracking-[0.1em] text-on-surface-variant">
                    Created
                  </span>
                  <time
                    dateTime={bookmark.createdAt}
                    className="font-mono text-mono text-on-surface"
                    title={formatFullDate(bookmark.createdAt)}
                  >
                    {formatRelativeTime(bookmark.createdAt)} &mdash;{" "}
                    <span className="text-on-surface-variant">
                      {formatFullDate(bookmark.createdAt)}
                    </span>
                  </time>
                </div>
                {bookmark.updatedAt !== bookmark.createdAt && (
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-label-caps font-bold uppercase tracking-[0.1em] text-on-surface-variant">
                      Updated
                    </span>
                    <time
                      dateTime={bookmark.updatedAt}
                      className="font-mono text-mono text-on-surface"
                      title={formatFullDate(bookmark.updatedAt)}
                    >
                      {formatRelativeTime(bookmark.updatedAt)}
                    </time>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column: Tags + Actions */}
          <div className="flex flex-col divide-y divide-outline border-t border-outline md:border-t-0">
            {/* Tags */}
            {bookmark.tags.length > 0 && (
              <div className="flex items-start gap-3 px-4 py-3">
                <TagIcon
                  className="mt-0.5 size-4 shrink-0 text-on-surface-variant"
                  aria-hidden="true"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="font-mono text-label-caps font-bold uppercase tracking-[0.1em] text-on-surface-variant">
                    Tags
                  </span>
                  <div className="flex flex-wrap gap-1.5" aria-label="Tags">
                    {bookmark.tags.map((slug) => (
                      <span
                        key={slug}
                        className={cn(
                          "inline-flex items-center border border-secondary px-2 py-0.5",
                          "font-mono text-label-caps font-bold uppercase tracking-[0.1em] text-secondary",
                        )}
                      >
                        {slug}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action bar — REQ-a11y-5, REQ-resp-3 */}
            <div className="flex flex-wrap items-center gap-2 px-4 py-3">
              {/* Delete */}
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className={cn(
                  "relative inline-flex items-center gap-1.5 border border-outline px-3 py-2",
                  "font-mono text-label-caps font-bold uppercase tracking-[0.1em] text-on-surface-variant",
                  "transition-[background-color,border-color,box-shadow,color,transform] duration-75 motion-reduce:transition-none",
                  "hover:border-error hover:text-error hover:shadow-[0_0_10px_var(--color-error)]",
                  "focus-visible:outline-none focus-visible:shadow-[0_0_0_1px_var(--color-ring)]",
                  "active:translate-x-0.5",
                  // Minimum 44px touch target
                  "after:absolute after:-inset-y-[6px] after:left-0 after:right-0 after:content-['']",
                )}
                aria-label="Delete bookmark"
              >
                <Trash2Icon className="size-3.5" aria-hidden="true" />
                Delete
              </button>

              <div className="ml-auto flex items-center gap-2">
                {/* Open URL */}
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "relative inline-flex items-center gap-1.5 border border-outline px-3 py-2",
                    "font-mono text-label-caps font-bold uppercase tracking-[0.1em] text-on-surface-variant",
                    "transition-[border-color,color] duration-75 motion-reduce:transition-none",
                    "hover:border-primary hover:text-primary",
                    "focus-visible:outline-none focus-visible:shadow-[0_0_0_1px_var(--color-ring)]",
                    "active:translate-x-0.5",
                    "after:absolute after:-inset-y-[6px] after:left-0 after:right-0 after:content-['']",
                  )}
                  aria-label="Open URL in new tab"
                >
                  <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
                  Open URL
                </a>

                {/* Edit */}
                <button
                  type="button"
                  onClick={() =>
                    void navigate({
                      to: "/bookmarks/$id/edit",
                      params: { id: bookmark.id },
                    })
                  }
                  className={cn(
                    "relative inline-flex items-center gap-1.5 border border-primary px-3 py-2",
                    "font-mono text-label-caps font-bold uppercase tracking-[0.1em] text-primary",
                    "transition-[background-color,box-shadow,transform] duration-75 motion-reduce:transition-none",
                    "hover:bg-primary hover:text-on-primary hover:shadow-glow",
                    "focus-visible:outline-none focus-visible:shadow-[0_0_0_1px_var(--color-ring)]",
                    "active:translate-x-0.5",
                    "after:absolute after:-inset-y-[6px] after:left-0 after:right-0 after:content-['']",
                  )}
                  aria-label="Edit bookmark"
                >
                  <EditIcon className="size-3.5" aria-hidden="true" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>

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
