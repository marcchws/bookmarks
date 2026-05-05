import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  createMemoryHistory,
  createRouter,
  RouterContextProvider,
} from "@tanstack/react-router"

import { BottomNav } from "./bottom-nav"
import { routeTree } from "@/routeTree.gen"

function makeRouter(initialEntry = "/") {
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  })
}

const meta = {
  title: "Layout/BottomNav",
  component: BottomNav,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    msw: { handlers: [] },
    /**
     * BottomNav is hidden at md+ via `md:hidden`. Force the mobile viewport
     * so the bar is always visible inside Storybook.
     */
    viewport: { defaultViewport: "mobile1" },
  },
  args: {
    pathname: "/",
  },
} satisfies Meta<typeof BottomNav>

export default meta
type Story = StoryObj<typeof meta>

/**
 * REQ-state-3: Mobile bottom-nav — labels and icons visible; "Bookmarks" link
 * is active (top-border cyan indicator, --color-primary text).
 * Router initialised at "/" so the Bookmarks item is aria-current="page".
 */
export const Default: Story = {
  render: () => {
    const router = makeRouter("/")
    return (
      <RouterContextProvider router={router}>
        <div className="relative h-screen bg-background pb-14">
          <div className="p-4 text-on-surface-variant text-sm">Content area</div>
          <BottomNav pathname="/" />
        </div>
      </RouterContextProvider>
    )
  },
}

/**
 * REQ-state-3 / REQ-8: "New Bookmark" is the active link — top-border
 * indicator and primary colour applied to the second tab.
 */
export const ActiveNewBookmark: Story = {
  render: () => {
    const router = makeRouter("/bookmarks/new")
    return (
      <RouterContextProvider router={router}>
        <div className="relative h-screen bg-background pb-14">
          <div className="p-4 text-on-surface-variant text-sm">Content area</div>
          <BottomNav pathname="/bookmarks/new" />
        </div>
      </RouterContextProvider>
    )
  },
}
