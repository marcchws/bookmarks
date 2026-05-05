import { useEffect } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod/v3"
import { AlertCircleIcon, Loader2Icon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { TagCombobox } from "@/components/tags/tag-combobox"
import { useCreateBookmark } from "@/hooks/use-create-bookmark"
import { useUpdateBookmark } from "@/hooks/use-update-bookmark"
import { fetchBookmarkMeta } from "@/lib/queries/bookmarks"
import { cn } from "@/lib/utils"
import type { Bookmark, BookmarkFormValues } from "@/types/bookmark"

const bookmarkSchema = z.object({
  url: z
    .string()
    .min(1, "URL is required")
    .url("Must be a valid URL (include https://)"),
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  tags: z.array(z.string()),
})

type FormValues = z.infer<typeof bookmarkSchema>

interface BookmarkFormProps {
  mode: "create" | "edit"
  defaultValues?: Partial<BookmarkFormValues>
  bookmarkId?: string
}

/**
 * REQ-5, REQ-6, REQ-7, REQ-8, REQ-9, REQ-a11y-1, REQ-a11y-5, REQ-state-4
 * Shared create/edit form. RHF + Zod. URL auto-populates Title on blur (REQ-6).
 * Server-error banner shown above submit on mutation failure.
 */
export function BookmarkForm({
  mode,
  defaultValues,
  bookmarkId,
}: BookmarkFormProps) {
  const navigate = useNavigate()
  const createBookmark = useCreateBookmark()
  const updateBookmark = useUpdateBookmark()

  const isPending =
    mode === "create" ? createBookmark.isPending : updateBookmark.isPending

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(bookmarkSchema),
    defaultValues: {
      url: defaultValues?.url ?? "",
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      tags: defaultValues?.tags ?? [],
    },
    mode: "onBlur",
  })

  // Sync defaultValues when they load (edit mode, data comes in async)
  useEffect(() => {
    if (defaultValues) {
      if (defaultValues.url !== undefined) setValue("url", defaultValues.url)
      if (defaultValues.title !== undefined) setValue("title", defaultValues.title)
      if (defaultValues.description !== undefined)
        setValue("description", defaultValues.description ?? "")
      if (defaultValues.tags !== undefined) setValue("tags", defaultValues.tags)
    }
  }, [defaultValues, setValue])

  // REQ-6: Auto-populate title on URL blur
  async function handleUrlBlur() {
    const url = getValues("url")
    const currentTitle = getValues("title")
    if (!url || currentTitle) return

    try {
      const meta = await fetchBookmarkMeta(url)
      if (meta.title && !getValues("title")) {
        setValue("title", meta.title, { shouldValidate: false })
      }
    } catch {
      // REQ-6: silently suppress — user types title manually
    }
  }

  async function onSubmit(data: FormValues) {
    const values: BookmarkFormValues = {
      url: data.url,
      title: data.title,
      description: data.description || undefined,
      tags: data.tags,
    }

    if (mode === "create") {
      try {
        const created = await createBookmark.mutateAsync(values)
        void navigate({ to: "/bookmarks/$id", params: { id: created.id } })
      } catch {
        // error surfaced via mutation.error
      }
    } else if (bookmarkId) {
      try {
        await updateBookmark.mutateAsync({ id: bookmarkId, values })
        void navigate({ to: "/bookmarks/$id", params: { id: bookmarkId } })
      } catch {
        // error surfaced via mutation.error
      }
    }
  }

  const mutationError =
    mode === "create"
      ? createBookmark.error?.message
      : updateBookmark.error?.message

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label={mode === "create" ? "Add bookmark" : "Edit bookmark"}
    >
      <div className="flex flex-col gap-5">
        {/* URL field */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="bookmark-url"
            className="font-mono text-label-caps font-bold uppercase tracking-[0.1em] text-on-surface-variant"
          >
            URL <span className="text-error" aria-hidden="true">*</span>
          </label>
          <Input
            id="bookmark-url"
            type="url"
            autoComplete="url"
            placeholder="https://example.com"
            aria-required="true"
            aria-invalid={!!errors.url}
            aria-describedby={errors.url ? "bookmark-url-error" : undefined}
            {...register("url", {
              onBlur: () => void handleUrlBlur(),
            })}
            className={cn(
              errors.url &&
                "border-error shadow-[0_0_0_1px_var(--color-error)]",
            )}
          />
          {errors.url && (
            <span
              id="bookmark-url-error"
              role="alert"
              className="flex items-center gap-1.5 font-mono text-xs text-error"
            >
              <AlertCircleIcon className="size-3.5 shrink-0" aria-hidden="true" />
              {errors.url.message}
            </span>
          )}
        </div>

        {/* Title field */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="bookmark-title"
            className="font-mono text-label-caps font-bold uppercase tracking-[0.1em] text-on-surface-variant"
          >
            Title <span className="text-error" aria-hidden="true">*</span>
          </label>
          <Input
            id="bookmark-title"
            type="text"
            placeholder="Page title"
            aria-required="true"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? "bookmark-title-error" : undefined}
            {...register("title")}
            className={cn(
              errors.title &&
                "border-error shadow-[0_0_0_1px_var(--color-error)]",
            )}
          />
          {errors.title && (
            <span
              id="bookmark-title-error"
              role="alert"
              className="flex items-center gap-1.5 font-mono text-xs text-error"
            >
              <AlertCircleIcon className="size-3.5 shrink-0" aria-hidden="true" />
              {errors.title.message}
            </span>
          )}
        </div>

        {/* Description field */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="bookmark-description"
            className="font-mono text-label-caps font-bold uppercase tracking-[0.1em] text-on-surface-variant"
          >
            Description
          </label>
          <textarea
            id="bookmark-description"
            rows={3}
            placeholder="Optional notes about this URL…"
            aria-invalid={!!errors.description}
            aria-describedby={
              errors.description ? "bookmark-description-error" : undefined
            }
            {...register("description")}
            className={cn(
              "w-full rounded-none border border-input bg-transparent px-3 py-2",
              "font-mono text-mono text-on-surface",
              "placeholder:text-on-surface-variant",
              "transition-[border-color,box-shadow] duration-75 motion-reduce:transition-none",
              "outline-none resize-y min-h-20",
              "focus-visible:border-ring focus-visible:shadow-[0_0_0_1px_var(--color-ring),0_0_10px_2px_color-mix(in_srgb,var(--color-ring)_40%,transparent)]",
              errors.description &&
                "border-error shadow-[0_0_0_1px_var(--color-error)]",
            )}
          />
          {errors.description && (
            <span
              id="bookmark-description-error"
              role="alert"
              className="flex items-center gap-1.5 font-mono text-xs text-error"
            >
              <AlertCircleIcon className="size-3.5 shrink-0" aria-hidden="true" />
              {errors.description.message}
            </span>
          )}
        </div>

        {/* Tags field */}
        <div className="flex flex-col gap-1.5">
          <span
            id="bookmark-tags-label"
            className="font-mono text-label-caps font-bold uppercase tracking-[0.1em] text-on-surface-variant"
          >
            Tags
          </span>
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <TagCombobox
                value={field.value}
                onChange={field.onChange}
                name="tags"
                aria-labelledby="bookmark-tags-label"
              />
            )}
          />
        </div>

        {/* Server-error banner — REQ-state-4 */}
        {mutationError && (
          <div
            role="alert"
            className="flex items-start gap-2 border border-error bg-surface-container p-3 text-error"
          >
            <AlertCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p className="font-mono text-mono">{mutationError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className={cn(
              "inline-flex items-center gap-2 border border-primary px-6 py-2.5",
              "font-mono text-label-caps font-bold uppercase tracking-[0.1em] text-primary",
              "transition-[background-color,box-shadow,transform] duration-75 motion-reduce:transition-none",
              "hover:bg-primary hover:text-on-primary hover:shadow-glow",
              "focus-visible:outline-none focus-visible:shadow-[0_0_0_1px_var(--color-ring)]",
              "active:translate-x-0.5",
              "disabled:pointer-events-none disabled:opacity-40",
            )}
            aria-busy={isPending}
          >
            {isPending && (
              <Loader2Icon
                className="size-4 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            )}
            {mode === "create" ? "Archive" : "Save Changes"}
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => void navigate({ to: "/" })}
            className={cn(
              "inline-flex items-center border border-outline px-4 py-2.5",
              "font-mono text-label-caps font-bold uppercase tracking-[0.1em] text-on-surface-variant",
              "transition-[border-color,color] duration-75 motion-reduce:transition-none",
              "hover:border-outline-active hover:text-on-surface",
              "focus-visible:outline-none focus-visible:shadow-[0_0_0_1px_var(--color-ring)]",
              "active:translate-x-0.5",
              "disabled:pointer-events-none disabled:opacity-40",
            )}
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  )
}

// Re-export Bookmark type for convenience
export type { Bookmark }
