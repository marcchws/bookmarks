import { describe, it, expect, vi } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { http, HttpResponse } from "msw"
import React from "react"
import { server } from "@/mocks/server"
import { useCreateBookmark } from "./use-create-bookmark"

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

// REQ-7
describe("useCreateBookmark", () => {
  it("should return a created bookmark on success", async () => {
    const payload = { url: "https://example.com", title: "Example", tags: [] }
    const created = { id: "99", ...payload, createdAt: "", updatedAt: "" }
    server.use(
      http.post("/bookmarks", () => HttpResponse.json(created, { status: 201 })),
    )
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useCreateBookmark(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate(payload)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe("99")
  })

  it("should call toast.error on server error", async () => {
    const { toast } = await import("sonner")
    server.use(
      http.post("/bookmarks", () =>
        HttpResponse.json({ message: "URL and title are required" }, { status: 422 }),
      ),
    )
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useCreateBookmark(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate({ url: "", title: "", tags: [] })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toast.error).toHaveBeenCalled()
  })

  it("should invalidate bookmarks cache on success", async () => {
    const payload = { url: "https://example.com", title: "Example", tags: [] }
    const created = { id: "99", ...payload, createdAt: "", updatedAt: "" }
    server.use(
      http.post("/bookmarks", () => HttpResponse.json(created, { status: 201 })),
      http.get("/bookmarks", () => HttpResponse.json([])),
    )
    const { Wrapper, queryClient } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries")
    const { result } = renderHook(() => useCreateBookmark(), { wrapper: Wrapper })

    act(() => {
      result.current.mutate(payload)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["bookmarks"] }),
    )
  })
})
