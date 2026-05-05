import { http, HttpResponse } from "msw"

import { populatedTags } from "./tags-seed"
import type { Tag } from "@/types/tag"

// In-memory store for dev session (reset on page reload)
let tagsStore: Tag[] = [...populatedTags]

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

export const handlers = [...tagHandlers]

export type { http, HttpResponse }
