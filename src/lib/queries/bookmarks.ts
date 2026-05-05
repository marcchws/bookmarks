import type { Bookmark, BookmarkFormValues } from "@/types/bookmark"

// REQ-13: Query keys
export const bookmarkKeys = {
  all: ["bookmarks"] as const,
  list: (filters: { q?: string; tag?: string[] }) =>
    ["bookmarks", filters] as const,
  detail: (id: string) => ["bookmarks", id] as const,
}

// REQ-1: List bookmarks with optional q + tag filters
export async function fetchBookmarks(filters: {
  q?: string
  tag?: string[]
}): Promise<Bookmark[]> {
  const params = new URLSearchParams()
  if (filters.q) params.set("q", filters.q)
  if (filters.tag) {
    for (const t of filters.tag) {
      params.append("tag", t)
    }
  }
  const qs = params.toString()
  const res = await fetch(`/bookmarks${qs ? `?${qs}` : ""}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch bookmarks: ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<Bookmark[]>
}

// REQ-12: Single bookmark
export async function fetchBookmark(id: string): Promise<Bookmark> {
  const res = await fetch(`/bookmarks/${id}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch bookmark: ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<Bookmark>
}

// REQ-7: Create bookmark
export async function createBookmark(
  values: BookmarkFormValues,
): Promise<Bookmark> {
  const res = await fetch("/bookmarks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  })
  if (!res.ok) {
    const text = await res.text()
    let message = `Failed to create bookmark: ${res.status}`
    try {
      const json = JSON.parse(text) as { message?: string }
      if (json.message) message = json.message
    } catch {
      // ignore parse errors
    }
    throw new Error(message)
  }
  return res.json() as Promise<Bookmark>
}

// REQ-9: Update bookmark
export async function updateBookmark(
  id: string,
  values: Partial<BookmarkFormValues>,
): Promise<Bookmark> {
  const res = await fetch(`/bookmarks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  })
  if (!res.ok) {
    const text = await res.text()
    let message = `Failed to update bookmark: ${res.status}`
    try {
      const json = JSON.parse(text) as { message?: string }
      if (json.message) message = json.message
    } catch {
      // ignore parse errors
    }
    throw new Error(message)
  }
  return res.json() as Promise<Bookmark>
}

// REQ-11: Delete bookmark
export async function deleteBookmark(id: string): Promise<void> {
  const res = await fetch(`/bookmarks/${id}`, { method: "DELETE" })
  if (!res.ok) {
    const text = await res.text()
    let message = `Failed to delete bookmark: ${res.status}`
    try {
      const json = JSON.parse(text) as { message?: string }
      if (json.message) message = json.message
    } catch {
      // ignore parse errors
    }
    throw new Error(message)
  }
}

// REQ-6: Fetch page metadata for URL auto-populate
export async function fetchBookmarkMeta(
  url: string,
): Promise<{ title: string }> {
  const params = new URLSearchParams({ url })
  const res = await fetch(`/bookmarks/meta?${params.toString()}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch metadata: ${res.status}`)
  }
  return res.json() as Promise<{ title: string }>
}
