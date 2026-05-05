import { describe, it, expect, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { http, HttpResponse } from "msw"
import React from "react"
import { server } from "@/mocks/server"
import { BookmarkForm } from "./bookmark-form"

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

const mockNavigate = vi.fn()
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}))

// Mock TagCombobox — not under test here
vi.mock("@/components/tags/tag-combobox", () => ({
  TagCombobox: ({ onChange }: { value: string[]; onChange: (v: string[]) => void }) =>
    React.createElement("div", {
      "data-testid": "tag-combobox",
      onClick: () => onChange(["tools"]),
    }, "TagCombobox"),
}))

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return { Wrapper }
}

function renderForm(props: Partial<React.ComponentProps<typeof BookmarkForm>> = {}) {
  const { Wrapper } = makeWrapper()
  return render(<BookmarkForm mode="create" {...props} />, { wrapper: Wrapper })
}

// REQ-5: Field presence
describe("BookmarkForm — field presence", () => {
  it("should render URL, Title, Description, and Tags fields", () => {
    renderForm()
    expect(screen.getByLabelText(/url/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByTestId("tag-combobox")).toBeInTheDocument()
  })

  it("should render submit button labeled 'Archive' in create mode", () => {
    renderForm({ mode: "create" })
    expect(screen.getByRole("button", { name: /archive/i })).toBeInTheDocument()
  })

  it("should render submit button labeled 'Save Changes' in edit mode", () => {
    renderForm({ mode: "edit", bookmarkId: "1" })
    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument()
  })
})

// REQ-8: Edit mode pre-populates fields
describe("BookmarkForm — edit mode pre-population", () => {
  it("should pre-populate URL field from defaultValues", () => {
    renderForm({
      mode: "edit",
      bookmarkId: "1",
      defaultValues: { url: "https://example.com", title: "My Site", tags: [] },
    })
    expect(screen.getByLabelText(/url/i)).toHaveValue("https://example.com")
  })

  it("should pre-populate Title field from defaultValues", () => {
    renderForm({
      mode: "edit",
      bookmarkId: "1",
      defaultValues: { url: "https://example.com", title: "My Site", tags: [] },
    })
    expect(screen.getByLabelText(/title/i)).toHaveValue("My Site")
  })

  it("should pre-populate Description from defaultValues", () => {
    renderForm({
      mode: "edit",
      bookmarkId: "1",
      defaultValues: {
        url: "https://example.com",
        title: "My Site",
        description: "A nice site",
        tags: [],
      },
    })
    expect(screen.getByLabelText(/description/i)).toHaveValue("A nice site")
  })
})

// REQ-5: Zod validation — submit disabled gate (URL)
describe("BookmarkForm — URL field validation (REQ-5)", () => {
  it("should show URL required error when URL is left empty and field is blurred", async () => {
    const user = userEvent.setup()
    renderForm()
    const urlInput = screen.getByLabelText(/url/i)
    await user.click(urlInput)
    await user.tab() // blur triggers onBlur validation
    await waitFor(() =>
      expect(screen.getByRole("alert", { hidden: true })).toHaveTextContent(/url is required/i),
    )
  })

  it("should show invalid URL error when URL is not a valid URL format", async () => {
    const user = userEvent.setup()
    renderForm()
    await user.type(screen.getByLabelText(/url/i), "not-a-url")
    await user.tab()
    await waitFor(() =>
      expect(screen.getByRole("alert", { hidden: true })).toHaveTextContent(/valid url/i),
    )
  })

  it("should not show URL error for a valid URL", async () => {
    const user = userEvent.setup()
    renderForm()
    await user.type(screen.getByLabelText(/url/i), "https://example.com")
    await user.tab()
    await waitFor(() =>
      expect(screen.queryByText(/valid url/i)).not.toBeInTheDocument(),
    )
  })
})

// REQ-5: Zod validation — Title field
describe("BookmarkForm — Title field validation (REQ-5)", () => {
  it("should show Title required error when title is left empty on blur", async () => {
    const user = userEvent.setup()
    renderForm()
    const titleInput = screen.getByLabelText(/title/i)
    await user.click(titleInput)
    await user.tab()
    await waitFor(() => {
      const alerts = screen.getAllByRole("alert", { hidden: true })
      expect(alerts.some((a) => a.textContent?.match(/title is required/i))).toBe(true)
    })
  })
})

// REQ-7: Successful create navigates to detail
describe("BookmarkForm — create submission (REQ-7)", () => {
  it("should navigate to /bookmarks/:id after successful create", async () => {
    const user = userEvent.setup()
    server.use(
      http.post("/bookmarks", async ({ request }) => {
        const body = (await request.json()) as { url: string; title: string; tags: string[] }
        return HttpResponse.json({
          id: "new-99",
          ...body,
          createdAt: "",
          updatedAt: "",
        }, { status: 201 })
      }),
      http.get("/bookmarks", () => HttpResponse.json([])),
    )
    renderForm({ mode: "create" })

    await user.type(screen.getByLabelText(/url/i), "https://example.com")
    await user.type(screen.getByLabelText(/title/i), "Example Site")
    await user.click(screen.getByRole("button", { name: /archive/i }))

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({ to: "/bookmarks/$id", params: { id: "new-99" } }),
      ),
    )
  })
})

// REQ-9: Successful edit navigates to detail
describe("BookmarkForm — edit submission (REQ-9)", () => {
  it("should navigate to /bookmarks/:id after successful edit", async () => {
    const user = userEvent.setup()
    server.use(
      http.patch("/bookmarks/:id", async ({ params }) => {
        return HttpResponse.json({
          id: params.id,
          url: "https://example.com",
          title: "Updated",
          tags: [],
          createdAt: "",
          updatedAt: "",
        })
      }),
      http.get("/bookmarks", () => HttpResponse.json([])),
      http.get("/bookmarks/:id", ({ params }) =>
        HttpResponse.json({
          id: params.id,
          url: "https://example.com",
          title: "Updated",
          tags: [],
          createdAt: "",
          updatedAt: "",
        }),
      ),
    )
    renderForm({
      mode: "edit",
      bookmarkId: "42",
      defaultValues: { url: "https://example.com", title: "Old Title", tags: [] },
    })

    const titleInput = screen.getByLabelText(/title/i)
    await user.clear(titleInput)
    await user.type(titleInput, "Updated")
    await user.click(screen.getByRole("button", { name: /save changes/i }))

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({ to: "/bookmarks/$id", params: { id: "42" } }),
      ),
    )
  })
})

// REQ-state-4: Server error banner
describe("BookmarkForm — server error (REQ-state-4)", () => {
  it("should show a form-level error banner when POST fails", async () => {
    const user = userEvent.setup()
    server.use(
      http.post("/bookmarks", () =>
        HttpResponse.json({ message: "Internal server error" }, { status: 500 }),
      ),
    )
    renderForm({ mode: "create" })

    await user.type(screen.getByLabelText(/url/i), "https://example.com")
    await user.type(screen.getByLabelText(/title/i), "Example Site")
    await user.click(screen.getByRole("button", { name: /archive/i }))

    await waitFor(() => {
      const alerts = screen.getAllByRole("alert", { hidden: true })
      expect(alerts.some((a) => a.textContent?.match(/internal server error/i))).toBe(true)
    })
  })
})

// REQ-6: URL auto-populate
describe("BookmarkForm — URL auto-populate (REQ-6)", () => {
  it("should populate the Title field from meta when URL is blurred and title is empty", async () => {
    const user = userEvent.setup()
    server.use(
      http.get("/bookmarks/meta", () => HttpResponse.json({ title: "GitHub" })),
    )
    renderForm({ mode: "create" })

    await user.type(screen.getByLabelText(/url/i), "https://github.com")
    await user.tab() // triggers onBlur

    await waitFor(() =>
      expect(screen.getByLabelText(/title/i)).toHaveValue("GitHub"),
    )
  })

  it("should NOT overwrite an existing title when URL is blurred", async () => {
    const user = userEvent.setup()
    server.use(
      http.get("/bookmarks/meta", () => HttpResponse.json({ title: "GitHub" })),
    )
    renderForm({ mode: "create" })

    await user.type(screen.getByLabelText(/title/i), "My Custom Title")
    await user.type(screen.getByLabelText(/url/i), "https://github.com")
    await user.tab()

    // Title should remain unchanged
    await waitFor(() =>
      expect(screen.getByLabelText(/title/i)).toHaveValue("My Custom Title"),
    )
  })

  it("should silently suppress errors from meta endpoint and leave title blank", async () => {
    const user = userEvent.setup()
    server.use(
      http.get("/bookmarks/meta", () =>
        HttpResponse.json({ message: "Invalid URL" }, { status: 422 }),
      ),
    )
    renderForm({ mode: "create" })

    await user.type(screen.getByLabelText(/url/i), "https://unknown.example.com")
    await user.tab()

    // Title should stay empty, no error banner from meta failure
    await waitFor(() => expect(screen.getByLabelText(/title/i)).toHaveValue(""))
  })
})

// REQ-a11y-1: form accessible label
describe("BookmarkForm — accessibility (REQ-a11y-1)", () => {
  it("should render form with aria-label 'Add bookmark' in create mode", () => {
    renderForm({ mode: "create" })
    expect(screen.getByRole("form", { name: /add bookmark/i })).toBeInTheDocument()
  })

  it("should render form with aria-label 'Edit bookmark' in edit mode", () => {
    renderForm({ mode: "edit", bookmarkId: "1" })
    expect(screen.getByRole("form", { name: /edit bookmark/i })).toBeInTheDocument()
  })
})
