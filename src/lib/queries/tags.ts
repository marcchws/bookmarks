import type { Tag } from "@/types/tag"

export const tagKeys = {
  all: ["tags"] as const,
}

export async function fetchTags(): Promise<Tag[]> {
  const res = await fetch("/tags")
  if (!res.ok) {
    throw new Error(`Failed to fetch tags: ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<Tag[]>
}

export async function createTag(label: string): Promise<Tag> {
  const slug = deriveSlug(label)

  const res = await fetch("/tags", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label, slug }),
  })

  if (!res.ok) {
    const text = await res.text()
    let message = `Failed to create tag: ${res.status}`
    try {
      const json = JSON.parse(text) as { message?: string }
      if (json.message) message = json.message
    } catch {
      // ignore parse errors
    }
    throw new Error(message)
  }

  return res.json() as Promise<Tag>
}

/** Derive a slug from a user-typed label (same logic used client-side for collision detection). */
export function deriveSlug(label: string): string {
  return label
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}
