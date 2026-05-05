import type { Meta, StoryObj } from "@storybook/react-vite"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  createMemoryHistory,
  createRouter,
  RouterContextProvider,
} from "@tanstack/react-router"
import { http, HttpResponse } from "msw"
import { Toaster } from "sonner"
import { userEvent, within, expect } from "storybook/test"

import { BookmarkForm } from "./bookmark-form"
import { populatedBookmarks } from "@/mocks/bookmarks-seed"
import { populatedTags } from "@/mocks/tags-seed"
import { routeTree } from "@/routeTree.gen"

function makeRouter() {
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/bookmarks/new"] }),
  })
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

const meta = {
  title: "Bookmarks/BookmarkForm",
  component: BookmarkForm,
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      const queryClient = makeQueryClient()
      const router = makeRouter()
      return (
        <QueryClientProvider client={queryClient}>
          <RouterContextProvider router={router}>
            <div className="min-h-screen bg-background p-8">
              <div className="max-w-xl">
                <Story />
              </div>
            </div>
            <Toaster />
          </RouterContextProvider>
        </QueryClientProvider>
      )
    },
  ],
  args: {
    mode: "create",
  },
  parameters: {
    layout: "fullscreen",
    msw: {
      handlers: [
        http.get("/tags", () => HttpResponse.json(populatedTags)),
        http.get("/bookmarks/meta", ({ request }) => {
          const url = new URL(request.url)
          const target = url.searchParams.get("url") ?? ""
          return HttpResponse.json({ title: `Page title for ${target}` })
        }),
        http.post("/bookmarks", async ({ request }) => {
          const body = (await request.json()) as { url: string; title: string }
          return HttpResponse.json(
            { id: "new-1", ...body, tags: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { status: 201 },
          )
        }),
      ],
    },
  },
} satisfies Meta<typeof BookmarkForm>

export default meta
type Story = StoryObj<typeof BookmarkForm>

/** Default (create mode): blank form ready to archive a new bookmark node */
export const Default: Story = {
  args: {
    mode: "create",
  },
}

/** Edit mode: form pre-populated with existing bookmark data (REQ-8) */
export const EditMode: Story = {
  args: {
    mode: "edit",
    bookmarkId: populatedBookmarks[0]!.id,
    defaultValues: {
      url: populatedBookmarks[0]!.url,
      title: populatedBookmarks[0]!.title,
      description: populatedBookmarks[0]!.description,
      tags: populatedBookmarks[0]!.tags,
    },
  },
  parameters: {
    msw: {
      handlers: [
        http.get("/tags", () => HttpResponse.json(populatedTags)),
        http.patch("/bookmarks/:id", async ({ params, request }) => {
          const body = (await request.json()) as Record<string, unknown>
          return HttpResponse.json({ id: params.id, ...body, updatedAt: new Date().toISOString() })
        }),
      ],
    },
  },
}

/**
 * REQ-state-4: Server error — form-level error banner appears above the submit
 * button when POST /bookmarks returns a non-2xx response. Field-level Zod errors
 * are client-side; this story exercises the server-error path.
 */
export const ServerError: Story = {
  args: {
    mode: "create",
  },
  parameters: {
    msw: {
      handlers: [
        http.get("/tags", () => HttpResponse.json(populatedTags)),
        http.get("/bookmarks/meta", () =>
          HttpResponse.json({ title: "Some page" }),
        ),
        http.post("/bookmarks", () =>
          HttpResponse.json(
            { message: "Internal server error — bookmark could not be saved." },
            { status: 500 },
          ),
        ),
      ],
    },
  },
  /**
   * play: fills valid fields and submits, which triggers the 500 handler and
   * surfaces the server-error banner above the submit button.
   */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const urlInput = canvas.getByRole("textbox", { name: /url/i })
    await userEvent.type(urlInput, "https://example.com", { delay: 30 })

    const titleInput = canvas.getByRole("textbox", { name: /title/i })
    await userEvent.type(titleInput, "Example Site", { delay: 30 })

    const submitButton = canvas.getByRole("button", { name: /archive/i })
    await userEvent.click(submitButton)

    // Server error banner should appear
    await expect(
      await canvas.findByRole("alert"),
    ).toBeInTheDocument()
  },
}

/**
 * Submitting: form in the pending state — submit button shows a spinner and
 * is disabled while the mutation request is in-flight.
 */
export const Submitting: Story = {
  args: {
    mode: "create",
  },
  parameters: {
    msw: {
      handlers: [
        http.get("/tags", () => HttpResponse.json(populatedTags)),
        http.get("/bookmarks/meta", () => HttpResponse.json({ title: "" })),
        http.post("/bookmarks", async () => {
          await new Promise((r) => setTimeout(r, 60_000))
          return HttpResponse.json({})
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const urlInput = canvas.getByRole("textbox", { name: /url/i })
    await userEvent.type(urlInput, "https://example.com", { delay: 30 })

    const titleInput = canvas.getByRole("textbox", { name: /title/i })
    await userEvent.type(titleInput, "Example Site", { delay: 30 })

    const submitButton = canvas.getByRole("button", { name: /archive/i })
    await userEvent.click(submitButton)

    await expect(submitButton).toBeDisabled()
  },
}
