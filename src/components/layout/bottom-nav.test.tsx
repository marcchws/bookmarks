import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
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

function renderBottomNav(initialEntry = "/") {
  const router = makeRouter(initialEntry)
  return render(
    <RouterContextProvider router={router}>
      <BottomNav />
    </RouterContextProvider>,
  )
}

describe("BottomNav", () => {
  // REQ-a11y-1: nav aria-label
  it("should render a nav element with aria-label 'Mobile navigation'", () => {
    renderBottomNav()
    expect(screen.getByRole("navigation", { name: "Mobile navigation" })).toBeInTheDocument()
  })

  // REQ-3: same two links as sidebar
  it("should render a 'Bookmarks' link pointing to '/'", () => {
    renderBottomNav()
    const link = screen.getByRole("link", { name: /bookmarks/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute("href", "/")
  })

  it("should render a 'New Bookmark' link pointing to '/bookmarks/new'", () => {
    renderBottomNav()
    const link = screen.getByRole("link", { name: /new bookmark/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute("href", "/bookmarks/new")
  })

  // REQ-state-3: labels and icons visible
  it("should render labels for each nav item", () => {
    renderBottomNav()
    expect(screen.getByText("Bookmarks")).toBeInTheDocument()
    expect(screen.getByText("New Bookmark")).toBeInTheDocument()
  })

  // REQ-8: active link on '/' — Bookmarks gets aria-current="page"
  it("should mark the Bookmarks link as aria-current='page' when on '/'", () => {
    renderBottomNav("/")
    const link = screen.getByRole("link", { name: /bookmarks/i })
    expect(link).toHaveAttribute("aria-current", "page")
  })

  it("should not mark Bookmarks as aria-current when on '/bookmarks/new'", () => {
    renderBottomNav("/bookmarks/new")
    const links = screen.getAllByRole("link")
    const bookmarksLink = links.find((l) => l.getAttribute("href") === "/")
    expect(bookmarksLink).not.toHaveAttribute("aria-current", "page")
  })

  it("should mark the New Bookmark link as aria-current='page' when on '/bookmarks/new'", () => {
    renderBottomNav("/bookmarks/new")
    const link = screen.getByRole("link", { name: /new bookmark/i })
    expect(link).toHaveAttribute("aria-current", "page")
  })

  // REQ-resp-4: touch target min-height — test via className since jsdom has no layout
  it("should apply min-h-11 class to each nav link for touch target sizing", () => {
    renderBottomNav()
    const links = screen.getAllByRole("link")
    links.forEach((link) => {
      expect(link.className).toContain("min-h-11")
    })
  })
})
