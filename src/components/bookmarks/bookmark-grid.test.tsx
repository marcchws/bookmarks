import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { http, HttpResponse } from "msw"
import React from "react"
import { server } from "@/mocks/server"
import { populatedBookmarks } from "@/mocks/bookmarks-seed"
import { BookmarkGrid } from "./bookmark-grid"

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

const mockNavigate = vi.fn()
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}))

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return { Wrapper }
}

function renderGrid(
  props: Partial<React.ComponentProps<typeof BookmarkGrid>> = {},
) {
  const { Wrapper } = makeWrapper()
  const defaults = {
    bookmarks: populatedBookmarks,
    isLoading: false,
    isError: false,
    onRetry: vi.fn(),
  }
  return render(<BookmarkGrid {...defaults} {...props} />, { wrapper: Wrapper })
}

// REQ-1
describe("BookmarkGrid — populated state", () => {
  it("should render a card for each bookmark", () => {
    server.use(http.delete("/bookmarks/:id", () => new HttpResponse(null, { status: 204 })))
    renderGrid()
    populatedBookmarks.forEach((b) => {
      expect(screen.getByText(b.title)).toBeInTheDocument()
    })
  })

  it("should render the grid container without aria-busy when not loading", () => {
    renderGrid()
    const grid = document.querySelector('[aria-busy="false"]')
    expect(grid).toBeInTheDocument()
  })
})

// REQ-state-1
describe("BookmarkGrid — empty state", () => {
  it("should render empty state when bookmarks array is empty", () => {
    renderGrid({ bookmarks: [] })
    expect(screen.getByRole("status", { name: /no bookmarks found/i })).toBeInTheDocument()
  })

  it("should render a CTA button in the empty state", () => {
    renderGrid({ bookmarks: [] })
    expect(screen.getByRole("button", { name: /archive first node/i })).toBeInTheDocument()
  })

  it("should navigate to /bookmarks/new when CTA button is clicked", async () => {
    const user = userEvent.setup()
    renderGrid({ bookmarks: [] })
    await user.click(screen.getByRole("button", { name: /archive first node/i }))
    expect(mockNavigate).toHaveBeenCalledWith(expect.objectContaining({ to: "/bookmarks/new" }))
  })
})

// REQ-state-2, REQ-a11y-7
describe("BookmarkGrid — loading state", () => {
  it("should render skeleton cards when isLoading is true", () => {
    renderGrid({ bookmarks: [], isLoading: true })
    // The skeleton container has role="status" with aria-busy="true"
    expect(screen.getByRole("status", { name: /loading bookmarks/i })).toBeInTheDocument()
    expect(screen.getByRole("status", { name: /loading bookmarks/i })).toHaveAttribute("aria-busy", "true")
  })

  it("should render 6 skeleton cards", () => {
    renderGrid({ bookmarks: [], isLoading: true })
    // Skeleton cards have aria-hidden="true"
    const skeletons = document.querySelectorAll('[aria-hidden="true"]')
    // At least 6 skeleton card elements
    expect(skeletons.length).toBeGreaterThanOrEqual(6)
  })

  it("should not render any bookmark cards while loading", () => {
    renderGrid({ bookmarks: [], isLoading: true })
    populatedBookmarks.forEach((b) => {
      expect(screen.queryByText(b.title)).not.toBeInTheDocument()
    })
  })
})

// REQ-state-3
describe("BookmarkGrid — error state", () => {
  it("should render an alert banner when isError is true", () => {
    renderGrid({ bookmarks: [], isError: true })
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })

  it("should show 'Failed to load bookmarks' text in the error banner", () => {
    renderGrid({ bookmarks: [], isError: true })
    expect(screen.getByRole("alert")).toHaveTextContent(/failed to load bookmarks/i)
  })

  it("should render a Retry button in the error state", () => {
    renderGrid({ bookmarks: [], isError: true })
    expect(screen.getByRole("button", { name: /retry loading bookmarks/i })).toBeInTheDocument()
  })

  it("should call onRetry when Retry button is clicked", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    renderGrid({ bookmarks: [], isError: true, onRetry })
    await user.click(screen.getByRole("button", { name: /retry loading bookmarks/i }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it("should not render skeleton cards in error state", () => {
    renderGrid({ bookmarks: [], isError: true })
    expect(screen.queryByRole("status", { name: /loading bookmarks/i })).not.toBeInTheDocument()
  })
})
