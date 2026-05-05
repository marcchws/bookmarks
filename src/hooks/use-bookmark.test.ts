import { describe, it, expect } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { http, HttpResponse } from "msw"
import React from "react"
import { server } from "@/mocks/server"
import { populatedBookmarks } from "@/mocks/bookmarks-seed"
import { useBookmark } from "./use-bookmark"

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return { Wrapper }
}

// REQ-12, REQ-state-5, REQ-state-6
describe("useBookmark", () => {
  it("should return a single bookmark on success", async () => {
    const bookmark = populatedBookmarks[0]!
    server.use(
      http.get("/bookmarks/:id", () => HttpResponse.json(bookmark)),
    )
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useBookmark(bookmark.id), {
      wrapper: Wrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe(bookmark.id)
    expect(result.current.data?.title).toBe(bookmark.title)
  })

  // REQ-state-5
  it("should be in loading state while fetch is in flight", () => {
    server.use(
      http.get("/bookmarks/:id", () => new Promise(() => { /* never resolves */ })),
    )
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useBookmark("1"), { wrapper: Wrapper })
    expect(result.current.isLoading).toBe(true)
  })

  // REQ-state-6
  it("should be in error state when fetch fails", async () => {
    server.use(
      http.get("/bookmarks/:id", () =>
        HttpResponse.json({ message: "Bookmark not found" }, { status: 404 }),
      ),
    )
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useBookmark("nonexistent"), {
      wrapper: Wrapper,
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toMatch(/404/)
  })
})
