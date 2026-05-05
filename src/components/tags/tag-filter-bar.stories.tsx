import type { Meta, StoryObj } from "@storybook/react-vite"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { http, HttpResponse } from "msw"
import { useState } from "react"

import { TagFilterBar } from "./tag-filter-bar"
import { populatedTags, emptyTags, networkError } from "@/mocks/tags-seed"

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const meta = {
  title: "Tags/TagFilterBar",
  component: TagFilterBar,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background p-8">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof TagFilterBar>

export default meta
type Story = StoryObj<typeof TagFilterBar>

// Interactive wrapper for toggle state
function FilterBarWrapper(props: { activeSlugs?: string[] }) {
  const [active, setActive] = useState<string[]>(props.activeSlugs ?? [])
  return (
    <TagFilterBar
      activeSlugs={active}
      onToggle={(slug) =>
        setActive((prev) =>
          prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
        )
      }
    />
  )
}

/** REQ-state-1: Loading skeleton — 3 placeholder chips while GET /tags is in-flight */
export const Loading: Story = {
  render: () => <FilterBarWrapper />,
  parameters: {
    msw: {
      handlers: [
        http.get("/tags", async () => {
          await new Promise((r) => setTimeout(r, 60_000))
          return HttpResponse.json([])
        }),
      ],
    },
  },
}

/** REQ-state-2: Empty state — renders null when GET /tags returns [] */
export const Empty: Story = {
  render: () => <FilterBarWrapper />,
  parameters: {
    msw: {
      handlers: [http.get("/tags", () => HttpResponse.json(emptyTags))],
    },
  },
}

/** REQ-state-3: Error state — inline banner "Could not load tags" with retry button */
export const ErrorState: Story = {
  name: "Error",
  render: () => <FilterBarWrapper />,
  parameters: {
    msw: { handlers: [networkError] },
  },
}

/** Default: all chips inactive, full populated tag list */
export const Default: Story = {
  render: () => <FilterBarWrapper />,
  parameters: {
    msw: {
      handlers: [http.get("/tags", () => HttpResponse.json(populatedTags))],
    },
  },
}

/** Active filters: magenta secondary chips (DESIGN.md: secondary = magenta for tags) */
export const WithActiveFilters: Story = {
  render: () => (
    <FilterBarWrapper activeSlugs={["network", "archive"]} />
  ),
  parameters: {
    msw: {
      handlers: [http.get("/tags", () => HttpResponse.json(populatedTags))],
    },
  },
}
