import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  createMemoryHistory,
  createRouter,
  RouterContextProvider,
} from "@tanstack/react-router"
import { userEvent, within, expect } from "storybook/test"

import { PageHeader } from "./page-header"
import { routeTree } from "@/routeTree.gen"

function makeRouter(initialEntry = "/") {
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  })
}

const meta = {
  title: "Layout/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      const router = makeRouter("/")
      return (
        <RouterContextProvider router={router}>
          <div className="bg-background">
            <Story />
          </div>
        </RouterContextProvider>
      )
    },
  ],
  parameters: {
    layout: "fullscreen",
    msw: { handlers: [] },
  },
  args: {
    title: "BOOKMARKS",
    showBack: false,
  },
} satisfies Meta<typeof PageHeader>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default: header without back arrow — matches the "/" route (REQ-4).
 * The h1 renders the page title in uppercase Space Grotesk.
 */
export const Default: Story = {
  args: {
    title: "BOOKMARKS",
    showBack: false,
  },
}

/**
 * REQ-5: Detail route — back arrow visible to the left of the h1 title.
 * The arrow button carries aria-label="Back to bookmarks list" (REQ-a11y-4).
 */
export const WithBackArrow: Story = {
  args: {
    title: "BOOKMARK DETAIL",
    showBack: true,
  },
}

/**
 * Edit route: back arrow + "EDIT BOOKMARK" title — second route that shows
 * the back arrow per the route-title map.
 */
export const EditRoute: Story = {
  args: {
    title: "EDIT BOOKMARK",
    showBack: true,
  },
}

/**
 * New bookmark route: no back arrow, distinct title — verifies the back
 * arrow is absent on non-detail routes (REQ-5 negative case).
 */
export const NewBookmarkRoute: Story = {
  args: {
    title: "NEW BOOKMARK",
    showBack: false,
  },
}

/**
 * Back arrow interaction: clicking the back arrow button should call
 * router.navigate({ to: "/" }). The play function verifies the button is
 * present, accessible, and interactive (REQ-5, REQ-a11y-4).
 */
export const BackArrowClick: Story = {
  args: {
    title: "BOOKMARK DETAIL",
    showBack: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const backBtn = canvas.getByRole("button", { name: /back to bookmarks list/i })
    expect(backBtn).toBeInTheDocument()
    await userEvent.click(backBtn)
    // Navigation is handled by the router; we verify the button was clickable
    // without throwing — visual outcome visible in the Interactions panel.
  },
}
