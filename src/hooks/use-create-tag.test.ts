import { describe, it, expect, vi } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { http, HttpResponse } from "msw"
import React from "react"
import { server } from "@/mocks/server"
import { populatedTags } from "@/mocks/tags-seed"
import { useCreateTag } from "./use-create-tag"

// Sonner toast is a side-effect — mock it so we can assert it was called
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  return { Wrapper, queryClient }
}

describe("useCreateTag", () => {
  it("should call POST /tags and return the new tag on success (REQ-4)", async () => {
    const newTag = { id: "99", slug: "new-tag", label: "New Tag" }
    server.use(
      http.post("/tags", () => HttpResponse.json(newTag, { status: 201 })),
    )
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useCreateTag(), { wrapper: Wrapper })

    let returnedTag
    await act(async () => {
      returnedTag = await result.current.mutateAsync("New Tag")
    })

    expect(returnedTag).toEqual(newTag)
  })

  it("should invalidate the ['tags'] query on success so shared consumers refresh (REQ-4)", async () => {
    const newTag = { id: "99", slug: "new-tag", label: "New Tag" }
    server.use(
      http.get("/tags", () => HttpResponse.json(populatedTags)),
      http.post("/tags", () => HttpResponse.json(newTag, { status: 201 })),
    )
    const { Wrapper, queryClient } = makeWrapper()

    // Seed the cache first
    await queryClient.prefetchQuery({ queryKey: ["tags"], queryFn: () => populatedTags })

    const { result } = renderHook(() => useCreateTag(), { wrapper: Wrapper })

    await act(async () => {
      await result.current.mutateAsync("New Tag")
    })

    // After invalidation the query should be marked stale (fetchStatus idle, no stale data lock)
    const queryState = queryClient.getQueryState(["tags"])
    expect(queryState?.isInvalidated).toBe(true)
  })

  it("should show a toast with the server error message on failure (REQ-state-5)", async () => {
    const { toast } = await import("sonner")
    server.use(
      http.post("/tags", () =>
        HttpResponse.json({ message: "Slug already taken" }, { status: 409 }),
      ),
    )
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useCreateTag(), { wrapper: Wrapper })

    await act(async () => {
      try {
        await result.current.mutateAsync("Network")
      } catch {
        // expected
      }
    })

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Slug already taken"))
  })

  it("should expose isPending=true while the mutation is in-flight (REQ-state-4)", async () => {
    let resolvePost!: () => void
    server.use(
      http.post("/tags", () =>
        new Promise<Response>((resolve) => {
          resolvePost = () =>
            resolve(HttpResponse.json({ id: "1", slug: "s", label: "S" }, { status: 201 }))
        }),
      ),
    )
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useCreateTag(), { wrapper: Wrapper })

    act(() => {
      void result.current.mutate("S")
    })

    await waitFor(() => expect(result.current.isPending).toBe(true))

    // Resolve the pending request
    await act(async () => {
      resolvePost()
    })
    await waitFor(() => expect(result.current.isPending).toBe(false))
  })
})
