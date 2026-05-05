import { describe, it, expect, vi } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { http, HttpResponse } from "msw"
import React from "react"
import { server } from "@/mocks/server"
import { populatedBookmarks } from "@/mocks/bookmarks-seed"
import { useUpdateBookmark } from "./use-update-bookmark"

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

// REQ-9
describe("useUpdateBookmark", () => {
  it("should return updated bookmark on success", async () => {
    const bookmark = populatedBookmarks[0]!
    const updated = { ...bookmark, title: "Updated Title" }
    server.use(
      http.patch("/bookmarks/:id", () => HttpResponse.json(updated)),
    )
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useUpdateBookmark(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate({ id: bookmark.id, values: { title: "Updated Title" } })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.title).toBe("Updated Title")
  })

  it("should call toast.error on server error", async () => {
    const { toast } = await import("sonner")
    server.use(
      http.patch("/bookmarks/:id", () =>
        HttpResponse.json({ message: "Bookmark not found" }, { status: 404 }),
      ),
    )
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useUpdateBookmark(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate({ id: "nonexistent", values: { title: "x" } })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toast.error).toHaveBeenCalled()
  })

  it("should invalidate list and detail queries on success", async () => {
    const bookmark = populatedBookmarks[0]!
    server.use(
      http.patch("/bookmarks/:id", () => HttpResponse.json(bookmark)),
      http.get("/bookmarks", () => HttpResponse.json([])),
      http.get("/bookmarks/:id", () => HttpResponse.json(bookmark)),
    )
    const { Wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries")
    const { result } = renderHook(() => useUpdateBookmark(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate({ id: bookmark.id, values: { title: "x" } })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["bookmarks"] }),
    )
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["bookmarks", bookmark.id] }),
    )
  })
})
