import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { BookmarkSearch } from "./bookmark-search"

const meta = {
  title: "Bookmarks/BookmarkSearch",
  component: BookmarkSearch,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-lg">
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof BookmarkSearch>

export default meta
type Story = StoryObj<typeof BookmarkSearch>

function SearchWrapper(props: { initialValue?: string }) {
  const [value, setValue] = useState(props.initialValue ?? "")
  return <BookmarkSearch value={value} onChange={setValue} />
}

/** Default: empty search input ready for input */
export const Default: Story = {
  render: () => <SearchWrapper />,
}

/** Filled: input with a search query already entered */
export const Filled: Story = {
  render: () => <SearchWrapper initialValue="TanStack" />,
}

/** Long query: verifies text truncation and layout at long input values */
export const LongQuery: Story = {
  render: () => (
    <SearchWrapper initialValue="https://github.com/some-very-long-repository-name-that-goes-on-forever" />
  ),
}
