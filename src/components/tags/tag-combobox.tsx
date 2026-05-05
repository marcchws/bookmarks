import {
  useId,
  useRef,
  useState,
  useCallback,
  type KeyboardEvent,
} from "react"
import { CheckIcon, ChevronsUpDownIcon, Loader2Icon, TagIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useTags } from "@/hooks/use-tags"
import { useCreateTag } from "@/hooks/use-create-tag"
import { deriveSlug } from "@/lib/queries/tags"
import type { Tag } from "@/types/tag"

interface TagComboboxProps {
  value: string[]
  onChange: (slugs: string[]) => void
  name?: string
}

/**
 * REQ-4, REQ-5, REQ-6: Multi-select combobox with inline tag creation.
 *
 * Built on @base-ui/react Popover + custom listbox.
 * - Keyboard nav: ArrowUp/Down, Enter to toggle/create, Escape to close.
 * - Collision detection: if derived slug matches existing tag, selects it silently.
 * - "Create '<value>'" item is appended at bottom of filtered results.
 * - REQ-a11y-2, REQ-a11y-3, REQ-a11y-4 satisfied.
 */
export function TagCombobox({ value, onChange, name }: TagComboboxProps) {
  const labelId = useId()
  const inputId = useId()
  const listboxId = useId()

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const { data: tags = [], isLoading, isError, refetch } = useTags()
  const createTag = useCreateTag()

  // Filtered tags based on search query
  const filtered: Tag[] = query.trim()
    ? tags.filter((t) =>
        t.label.toLowerCase().includes(query.toLowerCase()),
      )
    : tags

  const derivedSlug = deriveSlug(query.trim())
  const existingMatch = tags.find((t) => t.slug === derivedSlug)
  const showCreate =
    query.trim().length > 0 &&
    !existingMatch &&
    filtered.every((t) => t.label.toLowerCase() !== query.trim().toLowerCase())

  // Total items count (tags + optional create item)
  const totalItems = filtered.length + (showCreate ? 1 : 0)

  function toggleSlug(slug: string) {
    if (value.includes(slug)) {
      onChange(value.filter((s) => s !== slug))
    } else {
      onChange([...value, slug])
    }
  }

  function handleOpen() {
    setOpen(true)
    setQuery("")
    setActiveIndex(-1)
    // Focus the input after the popover renders
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  function handleClose() {
    setOpen(false)
    setQuery("")
    setActiveIndex(-1)
  }

  async function handleCreate() {
    if (!query.trim() || createTag.isPending) return

    // REQ-6: collision detection — if slug already exists, select it
    const collision = tags.find((t) => t.slug === deriveSlug(query.trim()))
    if (collision) {
      toggleSlug(collision.slug)
      setQuery("")
      setActiveIndex(-1)
      return
    }

    try {
      const newTag = await createTag.mutateAsync(query.trim())
      toggleSlug(newTag.slug)
      setQuery("")
      setActiveIndex(-1)
    } catch {
      // Error toast is shown by useCreateTag's onError — keep combobox open,
      // preserve the typed value.
    }
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!open) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setActiveIndex((i) => Math.min(i + 1, totalItems - 1))
          break
        case "ArrowUp":
          e.preventDefault()
          setActiveIndex((i) => Math.max(i - 1, 0))
          break
        case "Enter":
          e.preventDefault()
          if (activeIndex >= 0 && activeIndex < filtered.length) {
            toggleSlug(filtered[activeIndex].slug)
          } else if (activeIndex === filtered.length && showCreate) {
            void handleCreate()
          } else if (showCreate) {
            void handleCreate()
          }
          break
        case "Escape":
          e.preventDefault()
          handleClose()
          inputRef.current?.blur()
          break
        default:
          break
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open, activeIndex, filtered, showCreate, totalItems],
  )

  // Labels for selected tags shown in the trigger button
  const selectedLabels = value
    .map((slug) => tags.find((t) => t.slug === slug)?.label ?? slug)
    .join(", ")

  return (
    <div className="relative w-full">
      {/* Hidden input for form compatibility (REQ-a11y-2 name prop) */}
      {name && (
        <input type="hidden" name={name} value={value.join(",")} readOnly />
      )}

      {/* Trigger button */}
      <button
        type="button"
        id={inputId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-labelledby={`${labelId} ${inputId}`}
        onClick={() => (open ? handleClose() : handleOpen())}
        className={cn(
          "flex h-11 w-full items-center justify-between border border-border bg-background px-3 py-2",
          "font-mono text-mono text-on-surface",
          "transition-[border-color,box-shadow] duration-75 motion-reduce:transition-none",
          "hover:border-primary",
          "focus-visible:outline-none focus-visible:border-ring focus-visible:shadow-[0_0_10px_2px_color-mix(in_srgb,var(--color-primary)_50%,transparent)]",
          open && "border-ring shadow-[0_0_10px_2px_color-mix(in_srgb,var(--color-primary)_50%,transparent)]",
        )}
      >
        <span
          className={cn(
            "truncate",
            !selectedLabels && "text-on-surface-variant",
          )}
        >
          {selectedLabels || "Select tags…"}
        </span>
        <ChevronsUpDownIcon
          className="ml-2 size-4 shrink-0 text-on-surface-variant"
          aria-hidden="true"
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className={cn(
            "absolute left-0 right-0 top-full z-50 mt-1 border border-border bg-surface-container shadow-glow",
            "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95",
          )}
          style={{ transformOrigin: "top" }}
        >
          {/* Search input */}
          <div className="border-b border-outline p-2">
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-controls={listboxId}
              aria-expanded={open}
              aria-activedescendant={
                activeIndex >= 0 ? `${listboxId}-item-${activeIndex}` : undefined
              }
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActiveIndex(-1)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search or create tag…"
              className={cn(
                "w-full bg-transparent font-mono text-mono text-on-surface",
                "placeholder:text-on-surface-variant",
                "border-none outline-none focus:ring-0",
              )}
            />
          </div>

          {/* List content */}
          <div className="max-h-64 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center gap-2 px-3 py-4 text-on-surface-variant">
                <Loader2Icon
                  className="size-4 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                <span className="font-mono text-mono">Loading…</span>
              </div>
            )}

            {isError && (
              <div
                role="alert"
                className="flex items-center justify-between px-3 py-3 text-error"
              >
                <span className="font-mono text-label-caps font-bold uppercase tracking-[0.1em]">
                  Failed to load tags
                </span>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className={cn(
                    "border border-primary px-2 py-1",
                    "font-mono text-label-caps font-bold uppercase tracking-[0.1em] text-primary",
                    "hover:bg-primary hover:text-on-primary",
                    "focus-visible:outline-none focus-visible:shadow-[0_0_0_1px_var(--color-ring)]",
                  )}
                >
                  RETRY
                </button>
              </div>
            )}

            {!isLoading && !isError && filtered.length === 0 && !showCreate && (
              <p className="px-3 py-4 font-mono text-mono text-on-surface-variant">
                No tags yet — type to create one
              </p>
            )}

            {!isLoading && !isError && (
              <ul
                id={listboxId}
                role="listbox"
                aria-multiselectable="true"
                aria-label="Tags"
                ref={listRef}
              >
                {filtered.map((tag, idx) => {
                  const isSelected = value.includes(tag.slug)
                  const isActive = activeIndex === idx

                  return (
                    <li
                      key={tag.slug}
                      id={`${listboxId}-item-${idx}`}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => toggleSlug(tag.slug)}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 px-3 py-2",
                        "font-mono text-mono text-on-surface",
                        "transition-[background-color] duration-75 motion-reduce:transition-none",
                        isActive && "bg-surface-container-high",
                        "hover:bg-surface-container-high",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center border",
                          isSelected
                            ? "border-secondary bg-secondary"
                            : "border-outline",
                        )}
                        aria-hidden="true"
                      >
                        {isSelected && (
                          <CheckIcon
                            className="size-3 text-on-secondary"
                            aria-hidden="true"
                          />
                        )}
                      </span>
                      <TagIcon
                        className="size-3.5 shrink-0 text-on-surface-variant"
                        aria-hidden="true"
                      />
                      <span>{tag.label}</span>
                    </li>
                  )
                })}

                {/* REQ-4, REQ-a11y-3: "Create '<value>'" option */}
                {showCreate && (
                  <li
                    id={`${listboxId}-item-${filtered.length}`}
                    role="option"
                    aria-selected={false}
                    aria-disabled={createTag.isPending}
                    onClick={() => void handleCreate()}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 border-t border-outline px-3 py-2",
                      "font-mono text-mono text-primary",
                      "transition-[background-color] duration-75 motion-reduce:transition-none",
                      activeIndex === filtered.length &&
                        "bg-surface-container-high",
                      "hover:bg-surface-container-high",
                      createTag.isPending &&
                        "pointer-events-none opacity-50",
                    )}
                  >
                    {createTag.isPending ? (
                      <Loader2Icon
                        className="size-4 animate-spin motion-reduce:animate-none"
                        aria-hidden="true"
                      />
                    ) : (
                      <span
                        className="flex size-4 items-center justify-center text-sm text-primary"
                        aria-hidden="true"
                      >
                        +
                      </span>
                    )}
                    <span>
                      Create &ldquo;{query.trim()}&rdquo;
                    </span>
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Selected chips summary */}
          {value.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-outline p-2">
              {value.map((slug) => {
                const label = tags.find((t) => t.slug === slug)?.label ?? slug
                return (
                  <span
                    key={slug}
                    className={cn(
                      "inline-flex items-center gap-1 border border-secondary bg-secondary px-2 py-0.5",
                      "font-mono text-label-caps font-bold uppercase tracking-[0.1em] text-on-secondary",
                    )}
                  >
                    {label}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleSlug(slug)
                      }}
                      aria-label={`Remove ${label}`}
                      className={cn(
                        "relative ml-0.5 text-on-secondary opacity-70 hover:opacity-100",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                        "after:absolute after:-inset-[6px] after:content-['']",
                      )}
                    >
                      ×
                    </button>
                  </span>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Click-outside overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          aria-hidden="true"
          onClick={handleClose}
        />
      )}
    </div>
  )
}
