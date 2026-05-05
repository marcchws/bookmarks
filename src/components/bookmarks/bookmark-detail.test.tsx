import { describe, it, expect, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { http, HttpResponse } from "msw"
import React from "react"
import { server } from "@/mocks/server"
import { populatedBookmarks } from "@/mocks/bookmarks-seed"
import { BookmarkDetail } from "./bookmark-detail"
import type { Bookmark } from "@/types/bookmark"

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

const sampleBookmark: Bookmark = {
  ...populatedBookmarks[0]!,
  description: "A useful tool",
  tags: ["network", "tools"],
}

const bookmarkWithDifferentUpdated: Bookmark = {
  ...sampleBookmark,
  updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // different from createdAt
}

function renderDetail(bookmark: Bookmark = sampleBookmark) {
  const { Wrapper } = makeWrapper()
  return render(<BookmarkDetail bookmark={bookmark} />, { wrapper: Wrapper })
}

// REQ-12
describe("BookmarkDetail — field rendering", () => {
  it("should render the bookmark title in the header", () => {
    renderDetail()
    expect(screen.getByRole("heading", { name: sampleBookmark.title })).toBeInTheDocument()
  })

  it("should render the URL as an external link with noopener noreferrer", () => {
    renderDetail()
    // There are two "open in new tab" links — the inline URL text and the action bar "Open URL"
    // Find the one that shows the actual URL as text content
    const link = screen.getByRole("link", { name: new RegExp(`Open ${sampleBookmark.url}`, "i") })
    expect(link).toHaveAttribute("href", sampleBookmark.url)
    expect(link).toHaveAttribute("target", "_blank")
    expect(link).toHaveAttribute("rel", "noopener noreferrer")
  })

  it("should render description when present", () => {
    renderDetail()
    expect(screen.getByText("A useful tool")).toBeInTheDocument()
  })

  it("should not render description section when description is absent", () => {
    const noDesc: Bookmark = { ...sampleBookmark, description: undefined }
    renderDetail(noDesc)
    expect(screen.queryByText("A useful tool")).not.toBeInTheDocument()
  })

  it("should render tag chips for each tag", () => {
    renderDetail()
    expect(screen.getByText("network")).toBeInTheDocument()
    expect(screen.getByText("tools")).toBeInTheDocument()
  })

  it("should not render tags section when no tags", () => {
    const noTags: Bookmark = { ...sampleBookmark, tags: [] }
    renderDetail(noTags)
    // tags region should not appear
    const tagLabels = screen.queryAllByText("Tags")
    expect(tagLabels.length).toBe(0)
  })

  it("should render createdAt date in a time element", () => {
    renderDetail()
    const times = document.querySelectorAll("time")
    const createdTime = Array.from(times).find(
      (t) => t.getAttribute("dateTime") === sampleBookmark.createdAt,
    )
    expect(createdTime).toBeInTheDocument()
  })

  it("should render updatedAt when it differs from createdAt", () => {
    renderDetail(bookmarkWithDifferentUpdated)
    const times = document.querySelectorAll("time")
    const updatedTime = Array.from(times).find(
      (t) => t.getAttribute("dateTime") === bookmarkWithDifferentUpdated.updatedAt,
    )
    expect(updatedTime).toBeInTheDocument()
  })

  it("should not render updatedAt row when createdAt and updatedAt are the same", () => {
    const sameDate = new Date().toISOString()
    const sameDates: Bookmark = { ...sampleBookmark, createdAt: sameDate, updatedAt: sameDate }
    renderDetail(sameDates)
    // Only one time element — no separate updated row
    expect(screen.queryByText(/updated/i)).not.toBeInTheDocument()
  })

  it("should render a favicon with empty alt text (decorative)", () => {
    renderDetail()
    // Favicon has alt="" + aria-hidden="true" → role "presentation", use querySelector
    const favicon = document.querySelector('img[src*="google.com/s2/favicons"]')
    expect(favicon).not.toBeNull()
    expect(favicon).toHaveAttribute("alt", "")
    expect(favicon).toHaveAttribute("aria-hidden", "true")
  })
})

// REQ-12: Action bar
describe("BookmarkDetail — action bar (REQ-12)", () => {
  it("should render Edit, Delete, and Open URL actions", () => {
    renderDetail()
    expect(screen.getByRole("button", { name: /delete bookmark/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /edit bookmark/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /open url in new tab/i })).toBeInTheDocument()
  })

  it("should have Open URL link with target=_blank and rel=noopener noreferrer", () => {
    renderDetail()
    const openLink = screen.getByRole("link", { name: /open url in new tab/i })
    expect(openLink).toHaveAttribute("target", "_blank")
    expect(openLink).toHaveAttribute("rel", "noopener noreferrer")
  })
})

// REQ-10: Delete opens confirmation dialog
describe("BookmarkDetail — delete flow (REQ-10, REQ-11)", () => {
  it("should open delete dialog when Delete button is clicked", async () => {
    const user = userEvent.setup()
    renderDetail()
    await user.click(screen.getByRole("button", { name: /delete bookmark/i }))
    expect(screen.getByRole("alertdialog")).toBeInTheDocument()
  })

  it("should close dialog when Cancel is clicked", async () => {
    const user = userEvent.setup()
    renderDetail()
    await user.click(screen.getByRole("button", { name: /delete bookmark/i }))
    expect(screen.getByRole("alertdialog")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /cancel/i }))
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
  })

  // REQ-11: confirmed delete navigates to /
  it("should call DELETE and navigate to / after confirmed deletion", async () => {
    const user = userEvent.setup()
    server.use(
      http.delete("/bookmarks/:id", () => new HttpResponse(null, { status: 204 })),
      http.get("/bookmarks", () => HttpResponse.json([])),
    )
    renderDetail()
    await user.click(screen.getByRole("button", { name: /delete bookmark/i }))
    await user.click(screen.getByRole("button", { name: /^delete$/i }))

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(expect.objectContaining({ to: "/" })),
    )
  })
})

// REQ-10: Edit navigates to edit route
describe("BookmarkDetail — edit navigation (REQ-10)", () => {
  it("should navigate to edit route when Edit button is clicked", async () => {
    const user = userEvent.setup()
    renderDetail()
    await user.click(screen.getByRole("button", { name: /edit bookmark/i }))
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ to: "/bookmarks/$id/edit", params: { id: sampleBookmark.id } }),
    )
  })
})
