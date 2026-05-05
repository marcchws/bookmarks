import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  createMemoryHistory,
  createRouter,
  RouterContextProvider,
} from "@tanstack/react-router"

import { PageHeader } from "./page-header"
import { routeTree } from "@/routeTree.gen"

const mockNavigate = vi.fn()
vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function makeRouter(initialEntry = "/") {
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  })
}

function renderHeader(props: { title: string; showBack?: boolean }, initialEntry = "/") {
  const router = makeRouter(initialEntry)
  return render(
    <RouterContextProvider router={router}>
      <PageHeader {...props} />
    </RouterContextProvider>,
  )
}

describe("PageHeader", () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  // REQ-4: h1 shows the route title
  it("should render an h1 with the provided title", () => {
    renderHeader({ title: "BOOKMARKS" })
    expect(screen.getByRole("heading", { level: 1, name: "BOOKMARKS" })).toBeInTheDocument()
  })

  it("should render the title in uppercase via className (title passed as-is)", () => {
    renderHeader({ title: "NEW BOOKMARK" })
    expect(screen.getByRole("heading", { level: 1, name: "NEW BOOKMARK" })).toBeInTheDocument()
  })

  // REQ-5: back arrow absent on routes without showBack
  it("should not render a back button when showBack is false", () => {
    renderHeader({ title: "BOOKMARKS", showBack: false })
    expect(screen.queryByRole("button", { name: /back to bookmarks list/i })).not.toBeInTheDocument()
  })

  it("should not render a back button when showBack is omitted", () => {
    renderHeader({ title: "BOOKMARKS" })
    expect(screen.queryByRole("button", { name: /back to bookmarks list/i })).not.toBeInTheDocument()
  })

  // REQ-5: back arrow present on detail / edit routes
  it("should render a back button when showBack is true", () => {
    renderHeader({ title: "BOOKMARK DETAIL", showBack: true }, "/bookmarks/abc123")
    expect(screen.getByRole("button", { name: /back to bookmarks list/i })).toBeInTheDocument()
  })

  // REQ-a11y-4: back button aria-label
  it("should give the back button aria-label 'Back to bookmarks list'", () => {
    renderHeader({ title: "EDIT BOOKMARK", showBack: true }, "/bookmarks/abc123/edit")
    const btn = screen.getByRole("button", { name: "Back to bookmarks list" })
    expect(btn).toHaveAttribute("aria-label", "Back to bookmarks list")
  })

  // REQ-5: clicking back arrow navigates to "/"
  it("should call navigate to '/' when the back button is clicked", async () => {
    const user = userEvent.setup()
    renderHeader({ title: "BOOKMARK DETAIL", showBack: true }, "/bookmarks/abc123")

    const btn = screen.getByRole("button", { name: /back to bookmarks list/i })
    await user.click(btn)

    expect(mockNavigate).toHaveBeenCalledWith(expect.objectContaining({ to: "/" }))
  })
})
