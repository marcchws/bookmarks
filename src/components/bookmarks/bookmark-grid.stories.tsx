import type { Meta, StoryObj } from "@storybook/react-vite"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  createMemoryHistory,
  createRouter,
  RouterContextProvider,
} from "@tanstack/react-router"
import { http, HttpResponse } from "msw"
import { fn } from "storybook/test"

import { BookmarkGrid } from "./bookmark-grid"
import {
  populatedBookmarks,
  emptyBookmarks,
  bookmarkNetworkError,
} from "@/mocks/bookmarks-seed"
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
  title: "Bookmarks/BookmarkGrid",
  component: BookmarkGrid,
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      const queryClient = makeQueryClient()
      const router = makeRouter()
      return (
        <QueryClientProvider client={queryClient}>
          <RouterContextProvider router={router}>
            <div className="min-h-screen bg-background p-8">
              <Story />
            </div>
          </RouterContextProvider>
        </QueryClientProvider>
      )
    },
  ],
  args: {
    bookmarks: populatedBookmarks,
    isLoading: false,
    isError: false,
    onRetry: fn(),
  },
  parameters: {
    layout: "fullscreen",
    msw: {
      handlers: [
        http.delete("/bookmarks/:id", () => new HttpResponse(null, { status: 204 })),
      ],
    },
  },
} satisfies Meta<typeof BookmarkGrid>

export default meta
type Story = StoryObj<typeof BookmarkGrid>

/** Default: populated grid of bookmark cards across 1→2→3 columns */
export const Default: Story = {}

/**
 * REQ-state-2: Loading — 6 skeleton cards with aria-busy="true" on the grid,
 * aria-hidden on each skeleton. Screen reader announces loading state.
 */
export const Loading: Story = {
  args: {
    bookmarks: [],
    isLoading: true,
    isError: false,
  },
}

/**
 * REQ-state-3: Error — inline error banner with AlertCircle icon and Retry button.
 * Grid is replaced; skeletons are not shown during error state.
 */
export const ErrorState: Story = {
  name: "Error",
  args: {
    bookmarks: [],
    isLoading: false,
    isError: true,
  },
  parameters: {
    msw: {
      handlers: [bookmarkNetworkError],
    },
  },
}

/**
 * REQ-state-1: Empty — ASCII terminal art + "No bookmarks archived" heading
 * + "Archive First Node" CTA button linking to /bookmarks/new.
 */
export const Empty: Story = {
  args: {
    bookmarks: emptyBookmarks,
    isLoading: false,
    isError: false,
  },
}

/** Single card: edge case where exactly one bookmark is in the list */
export const SingleCard: Story = {
  args: {
    bookmarks: [populatedBookmarks[0]!],
    isLoading: false,
    isError: false,
  },
}
