import { describe, it, expect, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { http, HttpResponse } from "msw"
import React from "react"
import { server } from "@/mocks/server"
import { populatedTags, emptyTags, networkError } from "@/mocks/tags-seed"
import { TagFilterBar } from "./tag-filter-bar"

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return { Wrapper, queryClient }
}

function renderTagFilterBar(props: { activeSlugs?: string[]; onToggle?: (slug: string) => void } = {}) {
  const { Wrapper } = makeWrapper()
  const onToggle = props.onToggle ?? vi.fn()
  const activeSlugs = props.activeSlugs ?? []
  render(
    React.createElement(TagFilterBar, { activeSlugs, onToggle }),
    { wrapper: Wrapper },
  )
  return { onToggle }
}

// ─── REQ-state-1: Loading skeleton ─────────────────────────────────────────────

describe("TagFilterBar — loading state (REQ-state-1)", () => {
  it("should render a loading status region with aria-busy while tags are fetching", () => {
    // Stall the response so isLoading stays true during assertion
    server.use(
      http.get("/tags", () => new Promise(() => { /* never resolves in this test */ })),
    )
    renderTagFilterBar()

    const status = screen.getByRole("status")
    expect(status).toHaveAttribute("aria-busy", "true")
    expect(status).toHaveAttribute("aria-label", "Loading tags")
  })

  it("should render 3 skeleton placeholder chips while loading", () => {
    server.use(
      http.get("/tags", () => new Promise(() => { /* never resolves */ })),
    )
    renderTagFilterBar()

    // Each skeleton div is aria-hidden; the container has aria-busy
    const status = screen.getByRole("status")
    // 3 skeleton divs inside
    const skeletonItems = status.querySelectorAll('[aria-hidden="true"]')
    expect(skeletonItems.length).toBe(3)
  })
})

// ─── REQ-state-2: Empty state ──────────────────────────────────────────────────

describe("TagFilterBar — empty state (REQ-state-2)", () => {
  it("should render nothing (null) when the tag list is empty", async () => {
    server.use(http.get("/tags", () => HttpResponse.json(emptyTags)))
    const { Wrapper } = makeWrapper()
    const { container } = render(
      React.createElement(TagFilterBar, { activeSlugs: [], onToggle: vi.fn() }),
      { wrapper: Wrapper },
    )

    // Wait for the query to resolve
    await waitFor(() => {
      // Neither a status region nor chip buttons should be present
      expect(screen.queryByRole("status")).not.toBeInTheDocument()
      expect(screen.queryByRole("button")).not.toBeInTheDocument()
    })

    expect(container.firstChild).toBeNull()
  })
})

// ─── REQ-state-3: Error state ──────────────────────────────────────────────────

describe("TagFilterBar — error state (REQ-state-3)", () => {
  it("should render an alert with 'Could not load tags' when GET /tags fails", async () => {
    server.use(networkError)
    renderTagFilterBar()

    const alert = await screen.findByRole("alert")
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveTextContent(/could not load tags/i)
  })

  it("should render a retry button inside the error alert", async () => {
    server.use(networkError)
    renderTagFilterBar()

    await screen.findByRole("alert")
    expect(screen.getByRole("button", { name: /retry loading tags/i })).toBeInTheDocument()
  })

  it("should call refetch when the retry button is clicked", async () => {
    const user = userEvent.setup()
    // First request fails, second succeeds
    let calls = 0
    server.use(
      http.get("/tags", () => {
        calls++
        if (calls === 1) return HttpResponse.error()
        return HttpResponse.json(populatedTags)
      }),
    )
    renderTagFilterBar()

    const retryBtn = await screen.findByRole("button", { name: /retry loading tags/i })
    await user.click(retryBtn)

    // After retry the tags load — toolbar should appear
    await screen.findByRole("toolbar")
  })
})

// ─── REQ-2: Chip rendering ─────────────────────────────────────────────────────

describe("TagFilterBar — chip rendering (REQ-2)", () => {
  it("should render a chip button for each tag in the list", async () => {
    server.use(http.get("/tags", () => HttpResponse.json(populatedTags)))
    renderTagFilterBar()

    await screen.findByRole("toolbar")
    const buttons = screen.getAllByRole("button")
    expect(buttons.length).toBe(populatedTags.length)
  })

  it("should render chip labels matching tag labels", async () => {
    server.use(http.get("/tags", () => HttpResponse.json(populatedTags)))
    renderTagFilterBar()

    await screen.findByRole("toolbar")
    expect(screen.getByRole("button", { name: /network/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /encrypted/i })).toBeInTheDocument()
  })

  it("should wrap chips in a toolbar region labelled 'Filter by tag'", async () => {
    server.use(http.get("/tags", () => HttpResponse.json(populatedTags)))
    renderTagFilterBar()

    const toolbar = await screen.findByRole("toolbar", { name: /filter by tag/i })
    expect(toolbar).toBeInTheDocument()
  })
})

// ─── REQ-a11y-1: aria-pressed + keyboard ───────────────────────────────────────

describe("TagFilterBar — accessibility (REQ-a11y-1)", () => {
  it("should set aria-pressed=false on inactive chips", async () => {
    server.use(http.get("/tags", () => HttpResponse.json(populatedTags)))
    renderTagFilterBar({ activeSlugs: [] })

    await screen.findByRole("toolbar")
    const networkChip = screen.getByRole("button", { name: /network/i })
    expect(networkChip).toHaveAttribute("aria-pressed", "false")
  })

  it("should set aria-pressed=true on active chips (REQ-a11y-1)", async () => {
    server.use(http.get("/tags", () => HttpResponse.json(populatedTags)))
    renderTagFilterBar({ activeSlugs: ["network"] })

    await screen.findByRole("toolbar")
    const networkChip = screen.getByRole("button", { name: /network/i })
    expect(networkChip).toHaveAttribute("aria-pressed", "true")
  })

  it("should call onToggle with the slug when a chip is activated via click", async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    server.use(http.get("/tags", () => HttpResponse.json(populatedTags)))
    renderTagFilterBar({ activeSlugs: [], onToggle })

    await screen.findByRole("toolbar")
    await user.click(screen.getByRole("button", { name: /network/i }))
    expect(onToggle).toHaveBeenCalledWith("network")
  })

  it("should call onToggle when a chip is activated via keyboard Enter (REQ-a11y-1)", async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    server.use(http.get("/tags", () => HttpResponse.json(populatedTags)))
    renderTagFilterBar({ activeSlugs: [], onToggle })

    await screen.findByRole("toolbar")
    const chip = screen.getByRole("button", { name: /network/i })
    chip.focus()
    await user.keyboard("{Enter}")
    expect(onToggle).toHaveBeenCalledWith("network")
  })

  it("should call onToggle when a chip is activated via keyboard Space (REQ-a11y-1)", async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    server.use(http.get("/tags", () => HttpResponse.json(populatedTags)))
    renderTagFilterBar({ activeSlugs: [], onToggle })

    await screen.findByRole("toolbar")
    const chip = screen.getByRole("button", { name: /network/i })
    chip.focus()
    await user.keyboard(" ")
    expect(onToggle).toHaveBeenCalledWith("network")
  })
})

// ─── REQ-2 / REQ-3: toggle callback ────────────────────────────────────────────

describe("TagFilterBar — toggle callback (REQ-2, REQ-3)", () => {
  it("should call onToggle with the slug of the clicked chip", async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    server.use(http.get("/tags", () => HttpResponse.json(populatedTags)))
    renderTagFilterBar({ activeSlugs: [], onToggle })

    await screen.findByRole("toolbar")
    await user.click(screen.getByRole("button", { name: /encrypted/i }))
    expect(onToggle).toHaveBeenCalledWith("encrypted")
  })

  it("should reflect multiple active slugs via aria-pressed on each chip", async () => {
    server.use(http.get("/tags", () => HttpResponse.json(populatedTags)))
    renderTagFilterBar({ activeSlugs: ["network", "media"] })

    await screen.findByRole("toolbar")
    expect(screen.getByRole("button", { name: /network/i })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: /media/i })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: /encrypted/i })).toHaveAttribute("aria-pressed", "false")
  })
})
