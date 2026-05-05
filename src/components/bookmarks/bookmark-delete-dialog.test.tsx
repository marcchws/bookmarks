import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BookmarkDeleteDialog } from "./bookmark-delete-dialog"

// REQ-10, REQ-11, REQ-a11y-3
describe("BookmarkDeleteDialog", () => {
  it("should not render dialog content when open is false", () => {
    render(
      <BookmarkDeleteDialog
        open={false}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        title="My Bookmark"
      />,
    )
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
  })

  it("should render dialog content when open is true", () => {
    render(
      <BookmarkDeleteDialog
        open={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        title="My Bookmark"
      />,
    )
    expect(screen.getByRole("alertdialog")).toBeInTheDocument()
  })

  it("should show the bookmark title in the dialog description", () => {
    render(
      <BookmarkDeleteDialog
        open={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        title="My Bookmark"
      />,
    )
    expect(screen.getByRole("alertdialog")).toHaveTextContent("My Bookmark")
  })

  it("should call onCancel when cancel button is clicked", async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(
      <BookmarkDeleteDialog
        open={true}
        onConfirm={vi.fn()}
        onCancel={onCancel}
        title="My Bookmark"
      />,
    )
    await user.click(screen.getByRole("button", { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it("should call onConfirm when delete button is clicked", async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    render(
      <BookmarkDeleteDialog
        open={true}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
        title="My Bookmark"
      />,
    )
    await user.click(screen.getByRole("button", { name: /^delete$/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  // REQ-a11y-3: Escape dismisses without deleting
  it("should call onCancel when Escape key is pressed", async () => {
    const onCancel = vi.fn()
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    render(
      <BookmarkDeleteDialog
        open={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
        title="My Bookmark"
      />,
    )
    await user.keyboard("{Escape}")
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("should disable both buttons while isConfirming is true", () => {
    render(
      <BookmarkDeleteDialog
        open={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        title="My Bookmark"
        isConfirming={true}
      />,
    )
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled()
    expect(screen.getByRole("button", { name: /^delete$/i })).toBeDisabled()
  })

  it("should enable buttons when isConfirming is false", () => {
    render(
      <BookmarkDeleteDialog
        open={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        title="My Bookmark"
        isConfirming={false}
      />,
    )
    expect(screen.getByRole("button", { name: /cancel/i })).toBeEnabled()
    expect(screen.getByRole("button", { name: /^delete$/i })).toBeEnabled()
  })

  // REQ-a11y-3: Cancel receives initial focus when dialog opens
  it("should move focus to cancel button when dialog opens", async () => {
    const { rerender } = render(
      <BookmarkDeleteDialog
        open={false}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        title="My Bookmark"
      />,
    )
    rerender(
      <BookmarkDeleteDialog
        open={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        title="My Bookmark"
      />,
    )
    const cancelButton = screen.getByRole("button", { name: /cancel/i })
    // React autoFocus fires focus synchronously on mount
    expect(document.activeElement).toBe(cancelButton)
  })
})
