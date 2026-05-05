import type { Meta, StoryObj } from "@storybook/react-vite"
import { fn } from "storybook/test"

import { BookmarkDeleteDialog } from "./bookmark-delete-dialog"

const meta = {
  title: "Bookmarks/BookmarkDeleteDialog",
  component: BookmarkDeleteDialog,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background">
        <Story />
      </div>
    ),
  ],
  args: {
    open: true,
    title: "TanStack Query",
    onConfirm: fn(),
    onCancel: fn(),
    isConfirming: false,
  },
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof BookmarkDeleteDialog>

export default meta
type Story = StoryObj<typeof BookmarkDeleteDialog>

/** Default: dialog open, awaiting user action — cancel has initial focus */
export const Default: Story = {}

/** Confirming: delete button shows spinner and both buttons are disabled while DELETE request is in-flight */
export const Confirming: Story = {
  args: {
    isConfirming: true,
  },
}

/** Long title: verifies description wraps cleanly when bookmark title is very long */
export const LongTitle: Story = {
  args: {
    title:
      "This is an Extremely Long Bookmark Title That Should Wrap Gracefully Inside the Dialog Without Breaking the Layout",
  },
}
