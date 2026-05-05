import { describe, it, expect, vi } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { http, HttpResponse } from "msw"
import React from "react"
import { server } from "@/mocks/server"
import { useDeleteBookmark } from "./use-delete-bookmark"

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}))

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return { Wrapper, queryClient }
}

// REQ-11
describe("useDeleteBookmark", () => {
  it("should succeed when DELETE returns 204", async () => {
    server.use(
      http.delete("/bookmarks/:id", () => new HttpResponse(null, { status: 204 })),
    )
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useDeleteBookmark(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate("1")
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it("should call toast.error on server error", async () => {
    const { toast } = await import("sonner")
    server.use(
      http.delete("/bookmarks/:id", () =>
        HttpResponse.json({ message: "Bookmark not found" }, { status: 404 }),
      ),
    )
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useDeleteBookmark(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate("nonexistent")
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toast.error).toHaveBeenCalled()
  })

  it("should invalidate bookmarks list cache on success", async () => {
    server.use(
      http.delete("/bookmarks/:id", () => new HttpResponse(null, { status: 204 })),
      http.get("/bookmarks", () => HttpResponse.json([])),
    )
    const { Wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries")
    const { result } = renderHook(() => useDeleteBookmark(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate("1")
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["bookmarks"] }),
    )
  })
})
