import type { Meta, StoryObj } from "@storybook/react-vite"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  createMemoryHistory,
  createRouter,
  RouterContextProvider,
} from "@tanstack/react-router"
import { http, HttpResponse } from "msw"
import { Toaster } from "sonner"

import { BookmarkCard } from "./bookmark-card"
import { populatedBookmarks } from "@/mocks/bookmarks-seed"
import { routeTree } from "@/routeTree.gen"

function makeRouter() {
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  })
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

const meta = {
  title: "Bookmarks/BookmarkCard",
  component: BookmarkCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      const queryClient = makeQueryClient()
      const router = makeRouter()
      return (
        <QueryClientProvider client={queryClient}>
          <RouterContextProvider router={router}>
            <div className="min-h-screen bg-background p-8">
              <div className="max-w-sm">
                <Story />
              </div>
            </div>
            <Toaster />
          </RouterContextProvider>
        </QueryClientProvider>
      )
    },
  ],
  args: {
    bookmark: populatedBookmarks[0]!,
  },
  parameters: {
    layout: "fullscreen",
    msw: {
      handlers: [
        http.delete("/bookmarks/:id", () => new HttpResponse(null, { status: 204 })),
      ],
    },
  },
} satisfies Meta<typeof BookmarkCard>

export default meta
type Story = StoryObj<typeof BookmarkCard>

/** Default: fully populated card — favicon, monospaced title, URL, description, tags, relative date */
export const Default: Story = {}

/** No description: card without optional description field */
export const NoDescription: Story = {
  args: {
    bookmark: { ...populatedBookmarks[0]!, description: undefined },
  },
}

/** No tags: card without tag chips — verifies layout collapses cleanly */
export const NoTags: Story = {
  args: {
    bookmark: { ...populatedBookmarks[0]!, tags: [] },
  },
}

/** Long title: verifies truncation in the monospaced card header */
export const LongTitle: Story = {
  args: {
    bookmark: {
      ...populatedBookmarks[0]!,
      title:
        "An Extremely Long Bookmark Title That Must Truncate Gracefully In The Terminal Header",
    },
  },
}

/**
 * Grid view: six cards showing the responsive 1→2→3 column layout.
 * Use viewport controls to verify REQ-resp-1 breakpoints.
 */
export const GridLayout: Story = {
  decorators: [
    (Story, ctx) => {
      const queryClient = makeQueryClient()
      const router = makeRouter()
      return (
        <QueryClientProvider client={queryClient}>
          <RouterContextProvider router={router}>
            <div className="min-h-screen bg-background p-8">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {populatedBookmarks.slice(0, 6).map((b) => (
                  <BookmarkCard key={b.id} bookmark={b} />
                ))}
              </div>
            </div>
            <Toaster />
          </RouterContextProvider>
        </QueryClientProvider>
      )
    },
  ],
}
