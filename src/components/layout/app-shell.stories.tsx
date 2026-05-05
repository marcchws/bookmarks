import type { Meta, StoryObj } from "@storybook/react-vite"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  createMemoryHistory,
  createRouter,
  RouterContextProvider,
} from "@tanstack/react-router"

import { AppShell } from "./app-shell"
import { routeTree } from "@/routeTree.gen"

function makeRouter(initialEntry = "/") {
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  })
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

const meta = {
  title: "Layout/AppShell",
  component: AppShell,
  tags: ["autodocs"],
  args: {
    children: null,
  },
  parameters: {
    layout: "fullscreen",
    msw: { handlers: [] },
  },
} satisfies Meta<typeof AppShell>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default: shell at the root "/" route. Sidebar expanded (no localStorage
 * override), "BOOKMARKS" in the page header, Bookmarks nav link active.
 * REQ-state-1 is visible at md+ viewport width.
 */
export const Default: Story = {
  render: () => {
    const queryClient = makeQueryClient()
    const router = makeRouter("/")
    return (
      <QueryClientProvider client={queryClient}>
        <RouterContextProvider router={router}>
          <AppShell>
            <p className="text-on-surface-variant text-sm">Route content renders here.</p>
          </AppShell>
        </RouterContextProvider>
      </QueryClientProvider>
    )
  },
}

/**
 * REQ-state-1: Sidebar expanded — full labels visible, left-border active
 * indicator on the Bookmarks link. localStorage key cleared so sidebar
 * always starts expanded in this story.
 */
export const SidebarExpanded: Story = {
  loaders: [
    async () => {
      localStorage.removeItem("shell:sidebar-collapsed")
      return {}
    },
  ],
  render: () => {
    const queryClient = makeQueryClient()
    const router = makeRouter("/")
    return (
      <QueryClientProvider client={queryClient}>
        <RouterContextProvider router={router}>
          <AppShell>
            <p className="text-on-surface-variant text-sm">Sidebar is expanded — labels visible.</p>
          </AppShell>
        </RouterContextProvider>
      </QueryClientProvider>
    )
  },
}

/**
 * REQ-state-2: Sidebar collapsed — icon-only rail; active indicator present;
 * tooltip on hover. localStorage forced to "true" so the shell mounts in the
 * collapsed state without a user interaction.
 */
export const SidebarCollapsed: Story = {
  loaders: [
    async () => {
      localStorage.setItem("shell:sidebar-collapsed", "true")
      return {}
    },
  ],
  render: () => {
    const queryClient = makeQueryClient()
    const router = makeRouter("/")
    return (
      <QueryClientProvider client={queryClient}>
        <RouterContextProvider router={router}>
          <AppShell>
            <p className="text-on-surface-variant text-sm">Sidebar is collapsed — icon rail visible.</p>
          </AppShell>
        </RouterContextProvider>
      </QueryClientProvider>
    )
  },
}

/**
 * REQ-state-3: Mobile bottom-nav — resize to a mobile viewport (< 768px) to
 * see the fixed bottom bar with labels and icons. The sidebar is hidden below
 * md. The Bookmarks tab carries the top-border active indicator.
 */
export const MobileBottomNav: Story = {
  loaders: [
    async () => {
      localStorage.removeItem("shell:sidebar-collapsed")
      return {}
    },
  ],
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
  render: () => {
    const queryClient = makeQueryClient()
    const router = makeRouter("/")
    return (
      <QueryClientProvider client={queryClient}>
        <RouterContextProvider router={router}>
          <AppShell>
            <p className="text-on-surface-variant text-sm">
              Mobile layout — bottom-nav visible, sidebar hidden.
            </p>
          </AppShell>
        </RouterContextProvider>
      </QueryClientProvider>
    )
  },
}

/**
 * REQ-5: Detail route — page header shows back arrow and "BOOKMARK DETAIL"
 * title. Shell derives showBack=true from the pathname "/bookmarks/abc-123".
 */
export const DetailRoute: Story = {
  loaders: [
    async () => {
      localStorage.removeItem("shell:sidebar-collapsed")
      return {}
    },
  ],
  render: () => {
    const queryClient = makeQueryClient()
    const router = makeRouter("/bookmarks/abc-123")
    return (
      <QueryClientProvider client={queryClient}>
        <RouterContextProvider router={router}>
          <AppShell>
            <p className="text-on-surface-variant text-sm">Bookmark detail content.</p>
          </AppShell>
        </RouterContextProvider>
      </QueryClientProvider>
    )
  },
}

/**
 * Edit route: page header shows back arrow and "EDIT BOOKMARK" title.
 * REQ-5 second case — pathname ends with "/edit".
 */
export const EditRoute: Story = {
  loaders: [
    async () => {
      localStorage.removeItem("shell:sidebar-collapsed")
      return {}
    },
  ],
  render: () => {
    const queryClient = makeQueryClient()
    const router = makeRouter("/bookmarks/abc-123/edit")
    return (
      <QueryClientProvider client={queryClient}>
        <RouterContextProvider router={router}>
          <AppShell>
            <p className="text-on-surface-variant text-sm">Edit bookmark content.</p>
          </AppShell>
        </RouterContextProvider>
      </QueryClientProvider>
    )
  },
}
