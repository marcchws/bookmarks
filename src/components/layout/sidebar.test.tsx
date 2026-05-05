import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  createMemoryHistory,
  createRouter,
  RouterContextProvider,
} from "@tanstack/react-router"

import { Sidebar } from "./sidebar"
import { routeTree } from "@/routeTree.gen"

function makeRouter(initialEntry = "/") {
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  })
}

interface RenderSidebarOptions {
  collapsed?: boolean
  initialEntry?: string
  onToggle?: () => void
}

function renderSidebar({
  collapsed = false,
  initialEntry = "/",
  onToggle = vi.fn(),
}: RenderSidebarOptions = {}) {
  const router = makeRouter(initialEntry)
  return {
    onToggle,
    ...render(
      <RouterContextProvider router={router}>
        <Sidebar collapsed={collapsed} onToggle={onToggle} pathname={initialEntry} />
      </RouterContextProvider>,
    ),
  }
}

describe("Sidebar", () => {
  // REQ-a11y-1: nav aria-label
  it("should render a nav element with aria-label 'Main navigation'", () => {
    renderSidebar()
    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument()
  })

  // REQ-1: nav links present
  it("should render a 'Bookmarks' link pointing to '/'", () => {
    renderSidebar()
    const link = screen.getByRole("link", { name: /bookmarks/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute("href", "/")
  })

  it("should render a 'New Bookmark' link pointing to '/bookmarks/new'", () => {
    renderSidebar()
    const link = screen.getByRole("link", { name: /new bookmark/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute("href", "/bookmarks/new")
  })

  // REQ-state-1: expanded — labels visible
  it("should show nav link labels when expanded", () => {
    renderSidebar({ collapsed: false })
    expect(screen.getByText("Bookmarks")).toBeInTheDocument()
    expect(screen.getByText("New Bookmark")).toBeInTheDocument()
  })

  // REQ-state-2: collapsed — icon-only rail (labels hidden, toggle shows aria-expanded=false)
  it("should hide nav link labels in the DOM when collapsed", () => {
    renderSidebar({ collapsed: true })
    // Labels are not rendered (conditional render on !collapsed)
    expect(screen.queryByText("Bookmarks")).not.toBeInTheDocument()
    expect(screen.queryByText("New Bookmark")).not.toBeInTheDocument()
  })

  // REQ-a11y-2: toggle button aria-expanded + aria-label
  it("should render the toggle button with aria-expanded='true' when expanded", () => {
    renderSidebar({ collapsed: false })
    const btn = screen.getByRole("button", { name: /collapse sidebar/i })
    expect(btn).toHaveAttribute("aria-expanded", "true")
  })

  it("should render the toggle button with aria-expanded='false' when collapsed", () => {
    renderSidebar({ collapsed: true })
    const btn = screen.getByRole("button", { name: /expand sidebar/i })
    expect(btn).toHaveAttribute("aria-expanded", "false")
  })

  it("should label the toggle button 'Collapse sidebar' when expanded", () => {
    renderSidebar({ collapsed: false })
    expect(screen.getByRole("button", { name: "Collapse sidebar" })).toBeInTheDocument()
  })

  it("should label the toggle button 'Expand sidebar' when collapsed", () => {
    renderSidebar({ collapsed: true })
    expect(screen.getByRole("button", { name: "Expand sidebar" })).toBeInTheDocument()
  })

  // REQ-2: toggle button calls onToggle
  it("should call onToggle when the toggle button is clicked", async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()
    renderSidebar({ collapsed: false, onToggle })

    await user.click(screen.getByRole("button", { name: /collapse sidebar/i }))

    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  // REQ-8: active link gets aria-current="page" — Bookmarks active on "/"
  it("should mark the Bookmarks link as aria-current='page' when on '/'", () => {
    renderSidebar({ initialEntry: "/" })
    // When expanded, the link with href="/" should have aria-current
    const link = screen.getByRole("link", { name: /bookmarks/i })
    expect(link).toHaveAttribute("aria-current", "page")
  })

  it("should not mark Bookmarks as active when on '/bookmarks/new'", () => {
    renderSidebar({ initialEntry: "/bookmarks/new" })
    // When on new route, "Bookmarks" link at "/" should not be active
    // Need to find it — in collapsed mode no text, so use href
    const links = screen.getAllByRole("link")
    const bookmarksLink = links.find((l) => l.getAttribute("href") === "/")
    expect(bookmarksLink).not.toHaveAttribute("aria-current", "page")
  })

  it("should mark the New Bookmark link as aria-current='page' when on '/bookmarks/new'", () => {
    renderSidebar({ initialEntry: "/bookmarks/new" })
    const link = screen.getByRole("link", { name: /new bookmark/i })
    expect(link).toHaveAttribute("aria-current", "page")
  })

  // REQ-7: New Bookmark has primary variant (accessible via aria-label when collapsed)
  it("should provide aria-label on collapsed nav links", () => {
    renderSidebar({ collapsed: true })
    // When collapsed, links get aria-label set to the item label
    const links = screen.getAllByRole("link")
    const labels = links.map((l) => l.getAttribute("aria-label"))
    expect(labels).toContain("Bookmarks")
    expect(labels).toContain("New Bookmark")
  })
})
