import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { http, HttpResponse } from "msw"
import React from "react"
import { server } from "@/mocks/server"
import { populatedBookmarks } from "@/mocks/bookmarks-seed"
import { BookmarkCard } from "./bookmark-card"
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

const sampleBookmark: Bookmark = populatedBookmarks[0]!

function renderCard(bookmark: Bookmark = sampleBookmark) {
  const { Wrapper } = makeWrapper()
  return render(<BookmarkCard bookmark={bookmark} />, { wrapper: Wrapper })
}

// REQ-1
describe("BookmarkCard", () => {
  it("should render the bookmark title", () => {
    renderCard()
    expect(screen.getByText(sampleBookmark.title)).toBeInTheDocument()
  })

  // REQ-2
  it("should render a favicon img with empty alt and src matching Google favicons URL", () => {
    renderCard()
    // The favicon has alt="" + aria-hidden="true" so it has role "presentation"
    const favicon = document.querySelector('img[src*="google.com/s2/favicons"]')
    expect(favicon).not.toBeNull()
    expect(favicon).toHaveAttribute("alt", "")
    expect(favicon).toHaveAttribute("aria-hidden", "true")
  })

  it("should render the domain as an external link with noopener noreferrer", () => {
    renderCard()
    const link = screen.getByRole("link", { name: /open.*in new tab/i })
    expect(link).toHaveAttribute("target", "_blank")
    expect(link).toHaveAttribute("rel", "noopener noreferrer")
  })

  it("should render tag chips for each tag", () => {
    const bookmarkWithTags: Bookmark = { ...sampleBookmark, tags: ["network", "tools"] }
    renderCard(bookmarkWithTags)
    expect(screen.getByText("network")).toBeInTheDocument()
    expect(screen.getByText("tools")).toBeInTheDocument()
  })

  it("should not render tag chips when there are no tags", () => {
    const bookmarkWithoutTags: Bookmark = { ...sampleBookmark, tags: [] }
    renderCard(bookmarkWithoutTags)
    expect(screen.queryByLabelText(/tags/i)).not.toBeInTheDocument()
  })

  it("should render a relative creation date", () => {
    renderCard()
    // The time element should have dateTime attribute
    const time = document.querySelector("time")
    expect(time).toHaveAttribute("dateTime", sampleBookmark.createdAt)
  })

  it("should render description when provided", () => {
    renderCard()
    expect(screen.getByText(sampleBookmark.description!)).toBeInTheDocument()
  })

  it("should not render description when missing", () => {
    const noDesc: Bookmark = { ...sampleBookmark, description: undefined }
    renderCard(noDesc)
    expect(screen.queryByText(sampleBookmark.description!)).not.toBeInTheDocument()
  })

  // REQ-a11y-4: kebab menu aria-label
  it("should render kebab menu trigger with aria-label containing the bookmark title", () => {
    renderCard()
    const trigger = screen.getByRole("button", { name: new RegExp(`Actions for ${sampleBookmark.title}`, "i") })
    expect(trigger).toBeInTheDocument()
  })

  // REQ-10: Kebab menu opens delete dialog
  it("should open delete dialog when Delete menu item is clicked", async () => {
    server.use(http.delete("/bookmarks/:id", () => new HttpResponse(null, { status: 204 })))
    const user = userEvent.setup()
    renderCard()

    // Open the dropdown — portal renders to document.body, use screen
    const trigger = screen.getByRole("button", { name: /actions for/i })
    await user.click(trigger)

    // Wait for portal-rendered menu item
    const deleteItem = await screen.findByRole("menuitem", { name: /delete/i })
    await user.click(deleteItem)

    // Dialog should appear
    expect(screen.getByRole("alertdialog")).toBeInTheDocument()
  })

  // REQ-10: clicking Edit navigates to edit route
  it("should navigate to edit route when Edit menu item is clicked", async () => {
    const user = userEvent.setup()
    renderCard()

    const trigger = screen.getByRole("button", { name: /actions for/i })
    await user.click(trigger)

    // Wait for portal-rendered menu item
    const editItem = await screen.findByRole("menuitem", { name: /edit/i })
    await user.click(editItem)

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ to: "/bookmarks/$id/edit" }),
    )
  })

  // REQ-11: confirmed delete calls DELETE mutation
  it("should call delete mutation and close dialog when delete is confirmed", async () => {
    server.use(
      http.delete("/bookmarks/:id", () => new HttpResponse(null, { status: 204 })),
      http.get("/bookmarks", () => HttpResponse.json([])),
    )
    const user = userEvent.setup()
    renderCard()

    // Open dropdown -> click Delete (portal-rendered, use findBy)
    const trigger = screen.getByRole("button", { name: /actions for/i })
    await user.click(trigger)
    const deleteItem = await screen.findByRole("menuitem", { name: /delete/i })
    await user.click(deleteItem)

    // Confirm deletion in dialog
    await user.click(screen.getByRole("button", { name: /^delete$/i }))

    // Dialog should close after success
    await vi.waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument())
  })

  it("should close delete dialog when cancel is clicked", async () => {
    const user = userEvent.setup()
    renderCard()

    const trigger = screen.getByRole("button", { name: /actions for/i })
    await user.click(trigger)
    const deleteItem = await screen.findByRole("menuitem", { name: /delete/i })
    await user.click(deleteItem)

    expect(screen.getByRole("alertdialog")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /cancel/i }))
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
  })

  // REQ-1: title link navigates to detail
  it("should navigate to detail route when title link is clicked", async () => {
    const user = userEvent.setup()
    renderCard()

    const titleLink = screen.getByRole("link", { name: sampleBookmark.title })
    await user.click(titleLink)

    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ to: "/bookmarks/$id" }),
    )
  })
})
