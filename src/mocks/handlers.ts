import { http, HttpResponse } from "msw"

import { populatedTags } from "./tags-seed"
import { populatedBookmarks } from "./bookmarks-seed"
import type { Tag } from "@/types/tag"
import type { Bookmark, BookmarkFormValues } from "@/types/bookmark"

// In-memory store for dev session (reset on page reload)
let tagsStore: Tag[] = [...populatedTags]
let bookmarksStore: Bookmark[] = [...populatedBookmarks]

export const tagHandlers = [
  // REQ-1: List all tags
  http.get("/tags", () => {
    return HttpResponse.json(tagsStore)
  }),

  // REQ-4: Create a new tag
  http.post("/tags", async ({ request }) => {
    const body = (await request.json()) as { label: string; slug: string }

    // Validate slug uniqueness
    const exists = tagsStore.some((t) => t.slug === body.slug)
    if (exists) {
      return HttpResponse.json(
        { message: `Tag with slug "${body.slug}" already exists` },
        { status: 409 },
      )
    }

    const newTag: Tag = {
      id: String(tagsStore.length + 1),
      slug: body.slug,
      label: body.label,
    }
    tagsStore = [...tagsStore, newTag]

    return HttpResponse.json(newTag, { status: 201 })
  }),
]

export const bookmarkHandlers = [
  // REQ-13, REQ-3, REQ-4: List bookmarks with optional q + tag filters
  http.get("/bookmarks", ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get("q")?.toLowerCase()
    const tags = url.searchParams.getAll("tag")

    let results = [...bookmarksStore]

    if (q) {
      results = results.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.url.toLowerCase().includes(q) ||
          (b.description?.toLowerCase().includes(q) ?? false),
      )
    }

    if (tags.length > 0) {
      results = results.filter((b) =>
        tags.every((tag) => b.tags.includes(tag)),
      )
    }

    return HttpResponse.json(results)
  }),

  // REQ-6: Get page metadata for URL auto-populate
  http.get("/bookmarks/meta", ({ request }) => {
    const url = new URL(request.url)
    const targetUrl = url.searchParams.get("url")

    if (!targetUrl) {
      return HttpResponse.json({ message: "url parameter required" }, { status: 400 })
    }

    // Simulate title extraction from URL
    try {
      const domain = new URL(targetUrl).hostname
      const titleMap: Record<string, string> = {
        "github.com": "GitHub",
        "tanstack.com": "TanStack",
        "tailwindcss.com": "Tailwind CSS",
        "vitejs.dev": "Vite — Next Generation Frontend Tooling",
        "mswjs.io": "Mock Service Worker",
        "storybook.js.org": "Storybook",
        "zod.dev": "Zod",
        "www.typescriptlang.org": "TypeScript",
      }
      const title = titleMap[domain] ?? domain.replace(/^www\./, "")
      return HttpResponse.json({ title })
    } catch {
      return HttpResponse.json({ message: "Invalid URL" }, { status: 422 })
    }
  }),

  // REQ-12: Get single bookmark
  http.get("/bookmarks/:id", ({ params }) => {
    const { id } = params as { id: string }
    const bookmark = bookmarksStore.find((b) => b.id === id)

    if (!bookmark) {
      return HttpResponse.json({ message: "Bookmark not found" }, { status: 404 })
    }

    return HttpResponse.json(bookmark)
  }),

  // REQ-7: Create bookmark
  http.post("/bookmarks", async ({ request }) => {
    const body = (await request.json()) as BookmarkFormValues

    if (!body.url || !body.title) {
      return HttpResponse.json(
        { message: "URL and title are required" },
        { status: 422 },
      )
    }

    const newBookmark: Bookmark = {
      id: String(Date.now()),
      url: body.url,
      title: body.title,
      description: body.description,
      tags: body.tags ?? [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    bookmarksStore = [newBookmark, ...bookmarksStore]
    return HttpResponse.json(newBookmark, { status: 201 })
  }),

  // REQ-9: Update bookmark
  http.patch("/bookmarks/:id", async ({ params, request }) => {
    const { id } = params as { id: string }
    const body = (await request.json()) as Partial<BookmarkFormValues>

    const idx = bookmarksStore.findIndex((b) => b.id === id)
    if (idx === -1) {
      return HttpResponse.json({ message: "Bookmark not found" }, { status: 404 })
    }

    const updated: Bookmark = {
      ...bookmarksStore[idx]!,
      ...body,
      updatedAt: new Date().toISOString(),
    }
    bookmarksStore = [
      ...bookmarksStore.slice(0, idx),
      updated,
      ...bookmarksStore.slice(idx + 1),
    ]

    return HttpResponse.json(updated)
  }),

  // REQ-11: Delete bookmark
  http.delete("/bookmarks/:id", ({ params }) => {
    const { id } = params as { id: string }
    const idx = bookmarksStore.findIndex((b) => b.id === id)

    if (idx === -1) {
      return HttpResponse.json({ message: "Bookmark not found" }, { status: 404 })
    }

    bookmarksStore = [
      ...bookmarksStore.slice(0, idx),
      ...bookmarksStore.slice(idx + 1),
    ]

    return new HttpResponse(null, { status: 204 })
  }),
]

export const handlers = [...tagHandlers, ...bookmarkHandlers]

export type { http, HttpResponse }
