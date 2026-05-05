import { Loader2Icon, TriangleAlertIcon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

interface BookmarkDeleteDialogProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  isConfirming?: boolean
}

/**
 * REQ-10, REQ-11, REQ-a11y-3
 * Confirmation dialog before delete. Uses shadcn AlertDialog (base-ui).
 * Cancel receives initial focus. Escape closes via AlertDialog primitive.
 */
export function BookmarkDeleteDialog({
  open,
  onConfirm,
  onCancel,
  title,
  isConfirming = false,
}: BookmarkDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent
        className={cn(
          // DESIGN.md: zero-radius geometry, surface-container bg, outline border
          "rounded-none border border-outline-active bg-surface-container p-6",
          "[box-shadow:var(--shadow-glow)]",
        )}
      >
        <AlertDialogHeader className="gap-3">
          <div className="flex items-center gap-2 text-error">
            <TriangleAlertIcon className="size-5" aria-hidden="true" />
            <AlertDialogTitle className="font-mono text-label-caps font-bold uppercase tracking-[0.1em] text-error">
              Delete Bookmark
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="font-mono text-mono text-on-surface-variant">
            Delete{" "}
            <span className="font-bold text-on-surface">&ldquo;{title}&rdquo;</span>
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex flex-row justify-end gap-3 border-none bg-transparent p-0 -mx-0 -mb-0">
          {/* Cancel receives initial focus — REQ-a11y-3 */}
          <button
            type="button"
            onClick={onCancel}
            autoFocus
            disabled={isConfirming}
            className={cn(
              "border border-outline px-4 py-2",
              "font-mono text-label-caps font-bold uppercase tracking-[0.1em] text-on-surface",
              "transition-[border-color,background-color,box-shadow] duration-75 motion-reduce:transition-none",
              "hover:border-primary hover:text-primary",
              "focus-visible:outline-none focus-visible:shadow-[0_0_0_1px_var(--color-ring)]",
              "active:translate-x-0.5",
              "disabled:pointer-events-none disabled:opacity-40",
            )}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className={cn(
              "inline-flex items-center gap-2 border border-error px-4 py-2",
              "font-mono text-label-caps font-bold uppercase tracking-[0.1em] text-error",
              "transition-[border-color,background-color,box-shadow,transform] duration-75 motion-reduce:transition-none",
              "hover:bg-error hover:text-on-error hover:shadow-[0_0_10px_2px_color-mix(in_srgb,var(--color-error)_50%,transparent)]",
              "focus-visible:outline-none focus-visible:shadow-[0_0_0_1px_var(--color-ring)]",
              "active:translate-x-0.5",
              "disabled:pointer-events-none disabled:opacity-40",
            )}
          >
            {isConfirming && (
              <Loader2Icon
                className="size-3.5 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            )}
            Delete
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
