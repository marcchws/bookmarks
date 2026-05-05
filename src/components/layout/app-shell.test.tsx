import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  createMemoryHistory,
  createRouter,
  RouterContextProvider,
} from "@tanstack/react-router"

import { AppShell } from "./app-shell"
import { routeTree } from "@/routeTree.gen"

const SIDEBAR_KEY = "shell:sidebar-collapsed"

function makeRouter(initialEntry = "/") {
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  })
}

function renderShell(initialEntry = "/", children: React.ReactNode = <div>content</div>) {
  const router = makeRouter(initialEntry)
  return render(
    <RouterContextProvider router={router}>
      <AppShell>{children}</AppShell>
    </RouterContextProvider>,
  )
}

describe("AppShell", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  // REQ-4: page header renders with correct title for each route
  it("should render h1 with 'BOOKMARKS' on the '/' route", () => {
    renderShell("/")
    expect(screen.getByRole("heading", { level: 1, name: "BOOKMARKS" })).toBeInTheDocument()
  })

  it("should render h1 with 'NEW BOOKMARK' on '/bookmarks/new'", () => {
    renderShell("/bookmarks/new")
    expect(screen.getByRole("heading", { level: 1, name: "NEW BOOKMARK" })).toBeInTheDocument()
  })

  it("should render h1 with 'BOOKMARK DETAIL' on '/bookmarks/$id' route", () => {
    renderShell("/bookmarks/abc123")
    expect(screen.getByRole("heading", { level: 1, name: "BOOKMARK DETAIL" })).toBeInTheDocument()
  })

  it("should render h1 with 'EDIT BOOKMARK' on '/bookmarks/$id/edit' route", () => {
    renderShell("/bookmarks/abc123/edit")
    expect(screen.getByRole("heading", { level: 1, name: "EDIT BOOKMARK" })).toBeInTheDocument()
  })

  it("should render h1 with 'DESIGN SYSTEM' on '/design-system'", () => {
    renderShell("/design-system")
    expect(screen.getByRole("heading", { level: 1, name: "DESIGN SYSTEM" })).toBeInTheDocument()
  })

  // REQ-5: back arrow only on detail/edit routes
  it("should NOT render a back button on the '/' route", () => {
    renderShell("/")
    expect(screen.queryByRole("button", { name: /back to bookmarks list/i })).not.toBeInTheDocument()
  })

  it("should NOT render a back button on '/bookmarks/new'", () => {
    renderShell("/bookmarks/new")
    expect(screen.queryByRole("button", { name: /back to bookmarks list/i })).not.toBeInTheDocument()
  })

  it("should render a back button on '/bookmarks/$id'", () => {
    renderShell("/bookmarks/abc123")
    expect(screen.getByRole("button", { name: /back to bookmarks list/i })).toBeInTheDocument()
  })

  it("should render a back button on '/bookmarks/$id/edit'", () => {
    renderShell("/bookmarks/abc123/edit")
    expect(screen.getByRole("button", { name: /back to bookmarks list/i })).toBeInTheDocument()
  })

  // REQ-2: localStorage initialises collapsed state
  it("should initialise sidebar as expanded when localStorage key is absent", () => {
    renderShell("/")
    // Toggle button says "Collapse sidebar" when expanded
    expect(screen.getByRole("button", { name: /collapse sidebar/i })).toBeInTheDocument()
  })

  it("should initialise sidebar as collapsed when localStorage key is 'true'", () => {
    localStorage.setItem(SIDEBAR_KEY, "true")
    renderShell("/")
    // Toggle button says "Expand sidebar" when collapsed
    expect(screen.getByRole("button", { name: /expand sidebar/i })).toBeInTheDocument()
  })

  it("should initialise sidebar as expanded when localStorage key is 'false'", () => {
    localStorage.setItem(SIDEBAR_KEY, "false")
    renderShell("/")
    expect(screen.getByRole("button", { name: /collapse sidebar/i })).toBeInTheDocument()
  })

  // REQ-2: toggle cycles expanded ↔ collapsed and persists to localStorage
  it("should collapse the sidebar when the toggle is clicked from expanded state", async () => {
    const user = userEvent.setup()
    renderShell("/")

    const toggleBtn = screen.getByRole("button", { name: /collapse sidebar/i })
    await user.click(toggleBtn)

    expect(screen.getByRole("button", { name: /expand sidebar/i })).toBeInTheDocument()
    expect(localStorage.getItem(SIDEBAR_KEY)).toBe("true")
  })

  it("should expand the sidebar when the toggle is clicked from collapsed state", async () => {
    localStorage.setItem(SIDEBAR_KEY, "true")
    const user = userEvent.setup()
    renderShell("/")

    const toggleBtn = screen.getByRole("button", { name: /expand sidebar/i })
    await user.click(toggleBtn)

    expect(screen.getByRole("button", { name: /collapse sidebar/i })).toBeInTheDocument()
    expect(localStorage.getItem(SIDEBAR_KEY)).toBe("false")
  })

  // Children slot renders
  it("should render children inside the main content area", () => {
    renderShell("/", <p>Hello world</p>)
    expect(screen.getByText("Hello world")).toBeInTheDocument()
  })

  // Both nav regions present
  it("should render the Main navigation sidebar", () => {
    renderShell("/")
    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument()
  })

  it("should render the Mobile navigation bottom bar", () => {
    renderShell("/")
    expect(screen.getByRole("navigation", { name: "Mobile navigation" })).toBeInTheDocument()
  })
})
