import { describe, it, expect } from "vitest"
import { http, HttpResponse } from "msw"
import { server } from "@/mocks/server"
import { fetchTags, createTag, deriveSlug, tagKeys } from "./tags"
import { populatedTags, emptyTags } from "@/mocks/tags-seed"

// ─── tagKeys ──────────────────────────────────────────────────────────────────

describe("tagKeys", () => {
  it("should expose a stable all key tuple", () => {
    expect(tagKeys.all).toEqual(["tags"])
  })
})

// ─── deriveSlug ───────────────────────────────────────────────────────────────

describe("deriveSlug", () => {
  it("should lowercase the label", () => {
    expect(deriveSlug("Network")).toBe("network")
  })

  it("should replace spaces with hyphens", () => {
    expect(deriveSlug("sys logs")).toBe("sys-logs")
  })

  it("should collapse multiple spaces into a single hyphen", () => {
    // \s+ matches each whitespace run, so double spaces become a single hyphen
    expect(deriveSlug("my  cool  tag")).toBe("my-cool-tag")
  })

  it("should strip non-alphanumeric characters except hyphens", () => {
    expect(deriveSlug("hello@world!")).toBe("helloworld")
  })

  it("should handle a label that already is a slug", () => {
    expect(deriveSlug("already-slug")).toBe("already-slug")
  })

  it("should return an empty string for an empty label", () => {
    expect(deriveSlug("")).toBe("")
  })

  it("should handle unicode / special characters by stripping them", () => {
    expect(deriveSlug("café")).toBe("caf")
  })
})

// ─── fetchTags ────────────────────────────────────────────────────────────────

describe("fetchTags", () => {
  it("should return the tag array on a successful GET /tags (REQ-1)", async () => {
    server.use(
      http.get("/tags", () => HttpResponse.json(populatedTags)),
    )
    const result = await fetchTags()
    expect(result).toEqual(populatedTags)
  })

  it("should return an empty array when the server returns [] (REQ-state-2)", async () => {
    server.use(
      http.get("/tags", () => HttpResponse.json(emptyTags)),
    )
    const result = await fetchTags()
    expect(result).toEqual([])
  })

  it("should throw an error when GET /tags returns a non-ok status (REQ-state-3)", async () => {
    server.use(
      http.get("/tags", () => HttpResponse.json({ message: "Internal Error" }, { status: 500 })),
    )
    await expect(fetchTags()).rejects.toThrow("Failed to fetch tags")
  })
})

// ─── createTag ────────────────────────────────────────────────────────────────

describe("createTag", () => {
  it("should POST { label, slug } and return the created tag (REQ-4)", async () => {
    const newTag = { id: "99", slug: "new-tag", label: "New Tag" }
    server.use(
      http.post("/tags", () => HttpResponse.json(newTag, { status: 201 })),
    )
    const result = await createTag("New Tag")
    expect(result).toEqual(newTag)
  })

  it("should derive slug from the label before posting (REQ-6)", async () => {
    let receivedBody: { label: string; slug: string } | null = null
    server.use(
      http.post("/tags", async ({ request }) => {
        receivedBody = (await request.json()) as { label: string; slug: string }
        return HttpResponse.json({ id: "98", slug: receivedBody.slug, label: receivedBody.label }, { status: 201 })
      }),
    )
    await createTag("Sys Logs")
    expect(receivedBody).toMatchObject({ label: "Sys Logs", slug: "sys-logs" })
  })

  it("should throw an error with the server message when POST /tags fails (REQ-state-5)", async () => {
    server.use(
      http.post("/tags", () =>
        HttpResponse.json({ message: "Tag with slug already exists" }, { status: 409 }),
      ),
    )
    await expect(createTag("Network")).rejects.toThrow("Tag with slug already exists")
  })

  it("should throw a generic error when the server returns non-JSON error body", async () => {
    server.use(
      http.post("/tags", () => new HttpResponse("Internal Server Error", { status: 500 })),
    )
    await expect(createTag("bad")).rejects.toThrow("Failed to create tag: 500")
  })
})
