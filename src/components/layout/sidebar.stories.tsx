import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import {
  createMemoryHistory,
  createRouter,
  RouterContextProvider,
} from "@tanstack/react-router"
import { userEvent, within, expect } from "storybook/test"

import { Sidebar } from "./sidebar"
import { routeTree } from "@/routeTree.gen"

function makeRouter(initialEntry = "/") {
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  })
}

/** Render wrapper that owns the collapsed/onToggle state so the sidebar is interactive. */
function SidebarWithState({
  initialCollapsed = false,
  initialEntry = "/",
}: {
  initialCollapsed?: boolean
  initialEntry?: string
}) {
  const [collapsed, setCollapsed] = useState(initialCollapsed)
  const router = makeRouter(initialEntry)
  return (
    <RouterContextProvider router={router}>
      <div className="flex h-screen bg-background">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          pathname={initialEntry}
        />
        <div className="p-8 text-on-surface-variant text-sm">Content area</div>
      </div>
    </RouterContextProvider>
  )
}

const meta = {
  title: "Layout/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    msw: { handlers: [] },
  },
  // Component needs router context; we provide it per-story via the wrapper.
  // Meta-level decorator is skipped here because each story uses a custom
  // initialCollapsed + initialEntry combination that requires wrapper args.
  args: {
    collapsed: false,
    onToggle: () => {},
    pathname: "/",
  },
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

/**
 * REQ-state-1: Sidebar expanded — full labels visible; left-border active
 * indicator on the current route link. The "Bookmarks" link is active
 * because the router is initialised at "/".
 */
export const Expanded: Story = {
  render: () => <SidebarWithState initialCollapsed={false} initialEntry="/" />,
}

/**
 * REQ-state-2: Sidebar collapsed — icon-only rail; active indicator still
 * present; tooltip with link label appears on hover (REQ-2, REQ-a11y-2).
 * Toggle button shows `aria-expanded="false"` and label "Expand sidebar".
 */
export const Collapsed: Story = {
  render: () => <SidebarWithState initialCollapsed={true} initialEntry="/" />,
}

/**
 * Active link on /bookmarks/new: "New Bookmark" link gets the primary active
 * indicator. Verifies REQ-8 for the primary-variant nav item.
 */
export const ActiveNewBookmark: Story = {
  render: () => (
    <SidebarWithState initialCollapsed={false} initialEntry="/bookmarks/new" />
  ),
}

/**
 * Toggle interaction: starts expanded, user clicks the toggle button, sidebar
 * collapses to icon-only rail. Covers REQ-2 collapse/expand cycle and
 * REQ-a11y-2 aria-expanded state change.
 */
export const ToggleCollapse: Story = {
  render: () => <SidebarWithState initialCollapsed={false} initialEntry="/" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const toggleBtn = canvas.getByRole("button", { name: /collapse sidebar/i })
    expect(toggleBtn).toHaveAttribute("aria-expanded", "true")

    await userEvent.click(toggleBtn)

    const expandBtn = canvas.getByRole("button", { name: /expand sidebar/i })
    expect(expandBtn).toHaveAttribute("aria-expanded", "false")
  },
}
