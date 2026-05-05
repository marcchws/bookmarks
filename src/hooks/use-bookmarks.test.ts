import { describe, it, expect } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { http, HttpResponse } from "msw"
import React from "react"
import { server } from "@/mocks/server"
import { populatedBookmarks } from "@/mocks/bookmarks-seed"
import { useBookmarks } from "./use-bookmarks"

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return { Wrapper, queryClient }
}

// REQ-1, REQ-13
describe("useBookmarks", () => {
  it("should return bookmarks data on success", async () => {
    server.use(http.get("/bookmarks", () => HttpResponse.json(populatedBookmarks)))
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useBookmarks(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(populatedBookmarks.length)
  })

  it("should be in loading state initially", () => {
    server.use(
      http.get("/bookmarks", () => new Promise(() => { /* never resolves */ })),
    )
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useBookmarks(), { wrapper: Wrapper })
    expect(result.current.isLoading).toBe(true)
  })

  // REQ-state-3
  it("should be in error state when fetch fails", async () => {
    server.use(
      http.get("/bookmarks", () => HttpResponse.error()),
    )
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useBookmarks(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it("should pass q filter in the query", async () => {
    let capturedUrl = ""
    server.use(
      http.get("/bookmarks", ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json([])
      }),
    )
    const { Wrapper } = makeWrapper()
    renderHook(() => useBookmarks({ q: "react" }), { wrapper: Wrapper })

    await waitFor(() => expect(capturedUrl).toContain("q=react"))
  })

  it("should pass tag filter in the query", async () => {
    let capturedUrl = ""
    server.use(
      http.get("/bookmarks", ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json([])
      }),
    )
    const { Wrapper } = makeWrapper()
    renderHook(() => useBookmarks({ tag: ["tools"] }), { wrapper: Wrapper })

    await waitFor(() => expect(capturedUrl).toContain("tag=tools"))
  })

  // REQ-13
  it("should use staleTime of 30000", () => {
    server.use(http.get("/bookmarks", () => HttpResponse.json([])))
    const { Wrapper, queryClient } = makeWrapper()
    renderHook(() => useBookmarks(), { wrapper: Wrapper })

    // The query options can be inspected from the cache
    act(() => {
      const queries = queryClient.getQueryCache().findAll()
      if (queries.length > 0) {
        expect(queries[0]!.options.staleTime).toBe(30_000)
      }
    })
  })
})
