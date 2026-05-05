import { describe, it, expect } from "vitest"
import { http, HttpResponse } from "msw"
import { server } from "@/mocks/server"
import {
  bookmarkKeys,
  fetchBookmarks,
  fetchBookmark,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  fetchBookmarkMeta,
} from "./bookmarks"
import { populatedBookmarks } from "@/mocks/bookmarks-seed"

// REQ-13
describe("bookmarkKeys", () => {
  it("should produce list key with filters", () => {
    const key = bookmarkKeys.list({ q: "test", tag: ["tools"] })
    expect(key).toEqual(["bookmarks", { q: "test", tag: ["tools"] }])
  })

  it("should produce detail key with id", () => {
    const key = bookmarkKeys.detail("abc")
    expect(key).toEqual(["bookmarks", "abc"])
  })

  it("should produce all key as base", () => {
    expect(bookmarkKeys.all).toEqual(["bookmarks"])
  })
})

// REQ-1
describe("fetchBookmarks", () => {
  it("should fetch and return bookmarks array", async () => {
    server.use(http.get("/bookmarks", () => HttpResponse.json(populatedBookmarks)))
    const result = await fetchBookmarks({})
    expect(result).toHaveLength(populatedBookmarks.length)
    expect(result[0]).toHaveProperty("id")
    expect(result[0]).toHaveProperty("url")
    expect(result[0]).toHaveProperty("title")
  })

  it("should append q query param when provided", async () => {
    let capturedUrl = ""
    server.use(
      http.get("/bookmarks", ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json([])
      }),
    )
    await fetchBookmarks({ q: "react" })
    expect(capturedUrl).toContain("q=react")
  })

  it("should append tag params when provided", async () => {
    let capturedUrl = ""
    server.use(
      http.get("/bookmarks", ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json([])
      }),
    )
    await fetchBookmarks({ tag: ["tools", "network"] })
    expect(capturedUrl).toContain("tag=tools")
    expect(capturedUrl).toContain("tag=network")
  })

  it("should throw an error when response is not ok", async () => {
    server.use(
      http.get("/bookmarks", () => HttpResponse.json({ message: "Server error" }, { status: 500 })),
    )
    await expect(fetchBookmarks({})).rejects.toThrow("500")
  })
})

// REQ-12
describe("fetchBookmark", () => {
  it("should fetch a single bookmark by id", async () => {
    const bookmark = populatedBookmarks[0]!
    server.use(
      http.get("/bookmarks/:id", ({ params }) => {
        if (params.id === bookmark.id) return HttpResponse.json(bookmark)
        return HttpResponse.json({ message: "Not found" }, { status: 404 })
      }),
    )
    const result = await fetchBookmark(bookmark.id)
    expect(result.id).toBe(bookmark.id)
    expect(result.title).toBe(bookmark.title)
  })

  it("should throw when bookmark not found", async () => {
    server.use(
      http.get("/bookmarks/:id", () =>
        HttpResponse.json({ message: "Bookmark not found" }, { status: 404 }),
      ),
    )
    await expect(fetchBookmark("nonexistent")).rejects.toThrow("404")
  })
})

// REQ-7
describe("createBookmark", () => {
  it("should POST and return the created bookmark", async () => {
    const payload = { url: "https://example.com", title: "Example", tags: [] }
    server.use(
      http.post("/bookmarks", async ({ request }) => {
        const body = (await request.json()) as typeof payload
        return HttpResponse.json({ id: "new-1", ...body, createdAt: "", updatedAt: "" }, { status: 201 })
      }),
    )
    const result = await createBookmark(payload)
    expect(result.id).toBe("new-1")
    expect(result.url).toBe("https://example.com")
  })

  it("should throw with server error message when create fails", async () => {
    server.use(
      http.post("/bookmarks", () =>
        HttpResponse.json({ message: "URL and title are required" }, { status: 422 }),
      ),
    )
    await expect(
      createBookmark({ url: "", title: "", tags: [] }),
    ).rejects.toThrow("URL and title are required")
  })
})

// REQ-9
describe("updateBookmark", () => {
  it("should PATCH and return the updated bookmark", async () => {
    const updated = { ...populatedBookmarks[0]!, title: "Updated Title" }
    server.use(
      http.patch("/bookmarks/:id", () => HttpResponse.json(updated)),
    )
    const result = await updateBookmark("1", { title: "Updated Title" })
    expect(result.title).toBe("Updated Title")
  })

  it("should throw with server error message when update fails", async () => {
    server.use(
      http.patch("/bookmarks/:id", () =>
        HttpResponse.json({ message: "Bookmark not found" }, { status: 404 }),
      ),
    )
    await expect(updateBookmark("nonexistent", { title: "x" })).rejects.toThrow(
      "Bookmark not found",
    )
  })
})

// REQ-11
describe("deleteBookmark", () => {
  it("should DELETE and return undefined on success", async () => {
    server.use(
      http.delete("/bookmarks/:id", () => new HttpResponse(null, { status: 204 })),
    )
    await expect(deleteBookmark("1")).resolves.toBeUndefined()
  })

  it("should throw with server error message when delete fails", async () => {
    server.use(
      http.delete("/bookmarks/:id", () =>
        HttpResponse.json({ message: "Bookmark not found" }, { status: 404 }),
      ),
    )
    await expect(deleteBookmark("nonexistent")).rejects.toThrow("Bookmark not found")
  })
})

// REQ-6
describe("fetchBookmarkMeta", () => {
  it("should return page title for a known domain", async () => {
    server.use(
      http.get("/bookmarks/meta", ({ request }) => {
        const url = new URL(request.url)
        const targetUrl = url.searchParams.get("url")
        if (targetUrl === "https://github.com") {
          return HttpResponse.json({ title: "GitHub" })
        }
        return HttpResponse.json({ title: "Unknown" })
      }),
    )
    const result = await fetchBookmarkMeta("https://github.com")
    expect(result.title).toBe("GitHub")
  })

  it("should throw when meta endpoint returns error", async () => {
    server.use(
      http.get("/bookmarks/meta", () =>
        HttpResponse.json({ message: "Invalid URL" }, { status: 422 }),
      ),
    )
    await expect(fetchBookmarkMeta("not-a-url")).rejects.toThrow("422")
  })
})
