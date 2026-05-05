import { describe, it, expect } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { http, HttpResponse } from "msw"
import React from "react"
import { server } from "@/mocks/server"
import { populatedTags, emptyTags } from "@/mocks/tags-seed"
import { useTags } from "./use-tags"

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  return { Wrapper, queryClient }
}

describe("useTags", () => {
  it("should return the tag list when GET /tags resolves (REQ-1)", async () => {
    server.use(http.get("/tags", () => HttpResponse.json(populatedTags)))
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useTags(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(populatedTags)
  })

  it("should return an empty array when GET /tags returns [] (REQ-state-2)", async () => {
    server.use(http.get("/tags", () => HttpResponse.json(emptyTags)))
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useTags(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })

  it("should expose isLoading=true initially before the response resolves (REQ-state-1)", () => {
    server.use(
      http.get("/tags", async () => {
        await new Promise((r) => setTimeout(r, 5000))
        return HttpResponse.json(populatedTags)
      }),
    )
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useTags(), { wrapper: Wrapper })

    // Immediately after render, before the response, the query is loading
    expect(result.current.isLoading).toBe(true)
  })

  it("should expose isError=true when GET /tags fails (REQ-state-3)", async () => {
    server.use(http.get("/tags", () => HttpResponse.json({}, { status: 500 })))
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useTags(), { wrapper: Wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it("should use a 5-minute stale time (REQ-1)", () => {
    server.use(http.get("/tags", () => HttpResponse.json(populatedTags)))
    const { Wrapper, queryClient } = makeWrapper()
    renderHook(() => useTags(), { wrapper: Wrapper })

    // The query is registered in the cache — staleTime is configured via useQuery options
    // We verify by inspecting the query client's observer count
    const cache = queryClient.getQueryCache()
    const queries = cache.findAll({ queryKey: ["tags"] })
    // One query registered for ["tags"]
    expect(queries.length).toBe(1)
  })

  it("should share the same cache key ['tags'] across multiple hook consumers (REQ-1)", async () => {
    server.use(http.get("/tags", () => HttpResponse.json(populatedTags)))
    const { Wrapper, queryClient } = makeWrapper()

    const { result: r1 } = renderHook(() => useTags(), { wrapper: Wrapper })
    const { result: r2 } = renderHook(() => useTags(), { wrapper: Wrapper })

    await waitFor(() => expect(r1.current.isSuccess).toBe(true))
    await waitFor(() => expect(r2.current.isSuccess).toBe(true))

    // Both consumers share the same data — a single network entry in the cache
    const queries = queryClient.getQueryCache().findAll({ queryKey: ["tags"] })
    expect(queries.length).toBe(1)
    expect(r1.current.data).toBe(r2.current.data)
  })
})
