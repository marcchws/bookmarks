import type { Meta, StoryObj } from "@storybook/react-vite"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  createMemoryHistory,
  createRouter,
  RouterContextProvider,
} from "@tanstack/react-router"
import { http, HttpResponse } from "msw"
import { Toaster } from "sonner"

import { BookmarkDetail } from "./bookmark-detail"
import { detailBookmark, populatedBookmarks } from "@/mocks/bookmarks-seed"
import { routeTree } from "@/routeTree.gen"

function makeRouter() {
  return createRouter({
    routeTree,
    history: createMemoryHistory({
      initialEntries: [`/bookmarks/${detailBookmark.id}`],
    }),
  })
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

const meta = {
  title: "Bookmarks/BookmarkDetail",
  component: BookmarkDetail,
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      const queryClient = makeQueryClient()
      const router = makeRouter()
      return (
        <QueryClientProvider client={queryClient}>
          <RouterContextProvider router={router}>
            <div className="min-h-screen bg-background p-8">
              <div className="max-w-2xl">
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
    bookmark: detailBookmark,
  },
  parameters: {
    layout: "fullscreen",
    msw: {
      handlers: [
        http.delete("/bookmarks/:id", () => new HttpResponse(null, { status: 204 })),
      ],
    },
  },
} satisfies Meta<typeof BookmarkDetail>

export default meta
type Story = StoryObj<typeof BookmarkDetail>

/**
 * Default: fully populated detail view — URL (external link), title (monospaced),
 * description, tags, formatted creation and updated dates, action bar with
 * Delete (left), Open URL and Edit (right). REQ-12.
 */
export const Default: Story = {}

/** No description: detail view when bookmark has no optional description */
export const NoDescription: Story = {
  args: {
    bookmark: { ...detailBookmark, description: undefined },
  },
}

/** No tags: detail view when bookmark has no tags assigned */
export const NoTags: Story = {
  args: {
    bookmark: { ...detailBookmark, tags: [] },
  },
}

/** Same created and updated timestamps: Updated row is hidden when dates are equal */
export const SameCreatedUpdated: Story = {
  args: {
    bookmark: {
      ...detailBookmark,
      createdAt: detailBookmark.createdAt,
      updatedAt: detailBookmark.createdAt,
    },
  },
}

/**
 * Long URL: verifies that a very long URL breaks cleanly in the URL field row
 * without overflowing the card container.
 */
export const LongUrl: Story = {
  args: {
    bookmark: {
      ...detailBookmark,
      url: "https://github.com/some-organisation/a-very-deeply-nested-repository-path/tree/main/packages/some-package/src/components",
      title: "Deeply Nested Repository Path",
    },
  },
}

/**
 * Many tags: verifies tag chips wrap correctly when more than 4–5 tags are applied.
 */
export const ManyTags: Story = {
  args: {
    bookmark: {
      ...populatedBookmarks[3]!,
      tags: ["network", "tools", "encrypted", "secure", "archived", "reference"],
    },
  },
}
