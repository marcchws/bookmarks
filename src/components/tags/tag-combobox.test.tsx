import { describe, it, expect, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { http, HttpResponse } from "msw"
import React, { useState } from "react"
import { server } from "@/mocks/server"
import { populatedTags, emptyTags, networkError } from "@/mocks/tags-seed"
import { TagCombobox } from "./tag-combobox"

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
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
  return { Wrapper, queryClient }
}

/** Stateful wrapper so we can test controlled onChange updates */
function ControlledCombobox(props: { initialValue?: string[]; name?: string }) {
  const [value, setValue] = useState<string[]>(props.initialValue ?? [])
  return React.createElement(TagCombobox, { value, onChange: setValue, name: props.name })
}

function renderCombobox(props: { initialValue?: string[]; name?: string } = {}) {
  const { Wrapper } = makeWrapper()
  render(React.createElement(ControlledCombobox, props), { wrapper: Wrapper })
}

// ─── REQ-a11y-2: trigger button accessibility ──────────────────────────────────

describe("TagCombobox — trigger accessibility (REQ-a11y-2)", () => {
  it("should render a trigger button with aria-haspopup='listbox'", async () => {
    server.use(http.get("/tags", () => HttpResponse.json(populatedTags)))
    renderCombobox()

    const trigger = screen.getByRole("button")
    expect(trigger).toHaveAttribute("aria-haspopup", "listbox")
  })

  it("should show 'Select tags…' placeholder when no tags are selected", async () => {
    server.use(http.get("/tags", () => HttpResponse.json(populatedTags)))
    renderCombobox()

    expect(screen.getByRole("button")).toHaveTextContent(/select tags/i)
  })

  it("should display selected tag labels in the trigger button", async () => {
    server.use(http.get("/tags", () => HttpResponse.json(populatedTags)))
    renderCombobox({ initialValue: ["network"] })

    await waitFor(() =>
      expect(screen.getByRole("button")).toHaveTextContent(/network/i),
    )
  })
})

// ─── REQ-state-1: Loading state in dropdown ────────────────────────────────────

describe("TagCombobox — loading state (REQ-state-1)", () => {
  it("should show a loading indicator inside the dropdown while tags are fetching", async () => {
    const user = userEvent.setup()
    server.use(
      http.get("/tags", () => new Promise(() => { /* never resolves */ })),
    )
    renderCombobox()

    await user.click(screen.getByRole("button"))

    // Loading text is rendered while isLoading = true
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
})

// ─── REQ-state-2: Empty state in dropdown ─────────────────────────────────────

describe("TagCombobox — empty state (REQ-state-2)", () => {
  it("should show 'No tags yet — type to create one' when tag list is empty", async () => {
    const user = userEvent.setup()
    server.use(http.get("/tags", () => HttpResponse.json(emptyTags)))
    renderCombobox()

    await user.click(screen.getByRole("button"))
    await screen.findByText(/no tags yet/i)
  })
})

// ─── REQ-state-3: Error state in dropdown ─────────────────────────────────────

describe("TagCombobox — error state (REQ-state-3)", () => {
  it("should show 'Failed to load tags' inside an alert when GET /tags fails", async () => {
    const user = userEvent.setup()
    server.use(networkError)
    renderCombobox()

    await user.click(screen.getByRole("button"))
    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent(/failed to load tags/i)
  })

  it("should render a retry button inside the error alert in the dropdown", async () => {
    const user = userEvent.setup()
    server.use(networkError)
    renderCombobox()

    await user.click(screen.getByRole("button"))
    await screen.findByRole("alert")
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument()
  })
})

// ─── REQ-5: Multi-select — selecting / deselecting tags ───────────────────────

describe("TagCombobox — multi-select (REQ-5)", () => {
  it("should render all existing tags as options in the listbox", async () => {
    const user = userEvent.setup()
    server.use(http.get("/tags", () => HttpResponse.json(populatedTags)))
    renderCombobox()

    await user.click(screen.getByRole("button"))
    const listbox = await screen.findByRole("listbox")
    expect(listbox).toBeInTheDocument()
    const options = screen.getAllByRole("option")
    // All populated tags should appear
    expect(options.length).toBe(populatedTags.length)
  })

  it("should mark already-selected options with aria-selected=true", async () => {
    const user = userEvent.setup()
    server.use(http.get("/tags", () => HttpResponse.json(populatedTags)))
    renderCombobox({ initialValue: ["network"] })

    await user.click(screen.getByRole("button"))
    await screen.findByRole("listbox")

    const options = screen.getAllByRole("option")
    const networkOption = options.find((o) => o.textContent?.includes("Network"))
    expect(networkOption).toHaveAttribute("aria-selected", "true")
  })

  it("should mark unselected options with aria-selected=false", async () => {
    const user = userEvent.setup()
    server.use(http.get("/tags", () => HttpResponse.json(populatedTags)))
    renderCombobox({ initialValue: [] })

    await user.click(screen.getByRole("button"))
    await screen.findByRole("listbox")

    const options = screen.getAllByRole("option")
    options.forEach((o) => expect(o).toHaveAttribute("aria-selected", "false"))
  })

  it("should select a tag when its option is clicked and update trigger label", async () => {
    const user = userEvent.setup()
    server.use(http.get("/tags", () => HttpResponse.json(populatedTags)))
    renderCombobox()

    // Use aria-haspopup to pinpoint the trigger among all buttons
    const trigger = screen.getByRole("button", { name: /select tags/i })
    await user.click(trigger)
    await screen.findByRole("listbox")

    await user.click(screen.getByRole("option", { name: /network/i }))

    // Trigger updates its label — query by aria-haspopup to stay unambiguous
    await waitFor(() => {
      const btn = document.querySelector('[aria-haspopup="listbox"]') as HTMLElement
      expect(btn).toHaveTextContent(/network/i)
    })
  })

  it("should deselect a tag when its already-selected option is clicked again", async () => {
    const user = userEvent.setup()
    server.use(http.get("/tags", () => HttpResponse.json(populatedTags)))
    renderCombobox({ initialValue: ["network"] })

    // Wait for trigger to show selected label before opening
    const trigger = document.querySelector('[aria-haspopup="listbox"]') as HTMLElement
    await waitFor(() => expect(trigger).toHaveTextContent(/network/i))

    await user.click(trigger)
    await screen.findByRole("listbox")

    await user.click(screen.getByRole("option", { name: /network/i }))

    await waitFor(() =>
      expect(document.querySelector('[aria-haspopup="listbox"]')).not.toHaveTextContent(/network/i),
    )
  })

  it("should allow multiple tags to be selected simultaneously (REQ-5)", async () => {
    const user = userEvent.setup()
    server.use(http.get("/tags", () => HttpResponse.json(populatedTags)))
    renderCombobox()

    await user.click(screen.getByRole("button", { name: /select tags/i }))
    await screen.findByRole("listbox")

    await user.click(screen.getByRole("option", { name: /network/i }))
    // Dropdown stays open — click another tag
    await user.click(screen.getByRole("option", { name: /media/i }))

    // Check trigger via aria-haspopup selector (unambiguous even with dropdown open)
    await waitFor(() => {
      const trigger = document.querySelector('[aria-haspopup="listbox"]') as HTMLElement
      expect(trigger).toHaveTextContent(/network/i)
      expect(trigger).toHaveTextContent(/media/i)
    })
  })
})

// ─── REQ-5: Search filtering ───────────────────────────────────────────────────

describe("TagCombobox — search filtering (REQ-5)", () => {
  it("should filter options by the typed search query", async () => {
    const user = userEvent.setup()
    server.use(http.get("/tags", () => HttpResponse.json(populatedTags)))
    renderCombobox()

    await user.click(screen.getByRole("button"))
    const input = await screen.findByRole("combobox")

    await user.type(input, "net")
    const options = screen.getAllByRole("option")
    // Only "Network" should match — and possibly a create option
    const tagOptions = options.filter((o) => !o.textContent?.includes("Create"))
    expect(tagOptions.length).toBe(1)
    expect(tagOptions[0]).toHaveTextContent(/network/i)
  })
})

// ─── REQ-5: Keyboard navigation ────────────────────────────────────────────────

describe("TagCombobox — keyboard navigation (REQ-5)", () => {
  it("should close the dropdown when Escape is pressed", async () => {
    const user = userEvent.setup()
    server.use(http.get("/tags", () => HttpResponse.json(populatedTags)))
    renderCombobox()

    await user.click(screen.getByRole("button"))
    await screen.findByRole("listbox")

    await user.keyboard("{Escape}")
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
  })

  it("should navigate options with ArrowDown without throwing (REQ-5)", async () => {
    const user = userEvent.setup()
    server.use(http.get("/tags", () => HttpResponse.json(populatedTags)))
    renderCombobox()

    await user.click(screen.getByRole("button"))
    const input = await screen.findByRole("combobox")

    await user.type(input, "{ArrowDown}")
    // activeIndex moves to 0 — aria-activedescendant should be set
    expect(input).toHaveAttribute("aria-activedescendant")
  })
})

// ─── REQ-4 / REQ-a11y-3: Inline tag creation ──────────────────────────────────

describe("TagCombobox — inline tag creation (REQ-4, REQ-a11y-3)", () => {
  it("should show a 'Create' option when typed text doesn't match any existing tag", async () => {
    const user = userEvent.setup()
    server.use(http.get("/tags", () => HttpResponse.json(populatedTags)))
    renderCombobox()

    await user.click(screen.getByRole("button"))
    const input = await screen.findByRole("combobox")

    await user.type(input, "brand-new-tag")
    // Create option labelled `Create "brand-new-tag"` (REQ-a11y-3)
    expect(screen.getByRole("option", { name: /create/i })).toHaveTextContent(/create/i)
  })

  it("should NOT show a 'Create' option when typed text exactly matches an existing tag", async () => {
    const user = userEvent.setup()
    server.use(http.get("/tags", () => HttpResponse.json(populatedTags)))
    renderCombobox()

    await user.click(screen.getByRole("button"))
    const input = await screen.findByRole("combobox")

    await user.type(input, "network")
    // Existing slug "network" — no create option
    expect(screen.queryByRole("option", { name: /create/i })).not.toBeInTheDocument()
  })

  it("should call POST /tags when 'Create' option is clicked (REQ-4)", async () => {
    const user = userEvent.setup()
    const newTag = { id: "99", slug: "brand-new", label: "brand new" }
    let postCalled = false
    server.use(
      http.get("/tags", () => HttpResponse.json(populatedTags)),
      http.post("/tags", async () => {
        postCalled = true
        return HttpResponse.json(newTag, { status: 201 })
      }),
    )
    renderCombobox()

    await user.click(screen.getByRole("button"))
    const input = await screen.findByRole("combobox")
    await user.type(input, "brand new")

    const createOption = screen.getByRole("option", { name: /create/i })
    await user.click(createOption)

    await waitFor(() => expect(postCalled).toBe(true))
  })

  it("should be labelled as 'Create <value>' so screen readers announce intent (REQ-a11y-3)", async () => {
    const user = userEvent.setup()
    server.use(http.get("/tags", () => HttpResponse.json(populatedTags)))
    renderCombobox()

    await user.click(screen.getByRole("button"))
    const input = await screen.findByRole("combobox")
    await user.type(input, "my-tag")

    const createOption = screen.getByRole("option", { name: /create/i })
    expect(createOption.textContent).toMatch(/create/i)
    expect(createOption.textContent).toMatch(/my-tag/)
  })
})

// ─── REQ-6: Slug collision detection ──────────────────────────────────────────

describe("TagCombobox — slug collision detection (REQ-6)", () => {
  it("should select the existing tag instead of posting when derived slug already exists", async () => {
    const user = userEvent.setup()
    let postCalled = false
    server.use(
      http.get("/tags", () => HttpResponse.json(populatedTags)),
      http.post("/tags", () => {
        postCalled = true
        return HttpResponse.json({}, { status: 201 })
      }),
    )
    renderCombobox()

    await user.click(screen.getByRole("button"))
    const input = await screen.findByRole("combobox")

    // "Network" derives to slug "network" which already exists
    await user.type(input, "Network")

    // The create option should not appear since the derived slug matches
    expect(screen.queryByRole("option", { name: /create/i })).not.toBeInTheDocument()
    expect(postCalled).toBe(false)
  })
})

// ─── REQ-state-4: Inline create loading ────────────────────────────────────────

describe("TagCombobox — inline create loading state (REQ-state-4)", () => {
  it("should disable the 'Create' option and show spinner while POST is in-flight", async () => {
    const user = userEvent.setup()
    let resolvePost!: () => void
    server.use(
      http.get("/tags", () => HttpResponse.json(populatedTags)),
      http.post("/tags", () =>
        new Promise<Response>((resolve) => {
          resolvePost = () =>
            resolve(HttpResponse.json({ id: "99", slug: "brand-new", label: "brand new" }, { status: 201 }))
        }),
      ),
    )
    renderCombobox()

    await user.click(screen.getByRole("button"))
    const input = await screen.findByRole("combobox")
    await user.type(input, "brand new")

    const createOption = screen.getByRole("option", { name: /create/i })
    await user.click(createOption)

    // While pending, create option should have aria-disabled=true
    await waitFor(() =>
      expect(screen.getByRole("option", { name: /create/i })).toHaveAttribute("aria-disabled", "true"),
    )

    // Resolve to clean up
    resolvePost()
  })
})

// ─── REQ-state-5: Inline create error ──────────────────────────────────────────

describe("TagCombobox — inline create error state (REQ-state-5)", () => {
  it("should show a toast error and keep dropdown open when POST /tags fails", async () => {
    const { toast } = await import("sonner")
    const user = userEvent.setup()
    server.use(
      http.get("/tags", () => HttpResponse.json(populatedTags)),
      http.post("/tags", () =>
        HttpResponse.json({ message: "Server error" }, { status: 500 }),
      ),
    )
    renderCombobox()

    await user.click(screen.getByRole("button"))
    const input = await screen.findByRole("combobox")
    await user.type(input, "brand new")

    const createOption = screen.getByRole("option", { name: /create/i })
    await user.click(createOption)

    // Dropdown should stay open
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeInTheDocument())
    // Toast was fired
    await waitFor(() => expect(toast.error).toHaveBeenCalled())
  })

  it("should preserve the typed value after a failed create (REQ-state-5)", async () => {
    const user = userEvent.setup()
    server.use(
      http.get("/tags", () => HttpResponse.json(populatedTags)),
      http.post("/tags", () =>
        HttpResponse.json({ message: "Server error" }, { status: 500 }),
      ),
    )
    renderCombobox()

    await user.click(screen.getByRole("button"))
    const input = await screen.findByRole("combobox")
    await user.type(input, "brand new")

    await user.click(screen.getByRole("option", { name: /create/i }))

    // After error the input should still show the typed value
    await waitFor(() => expect(input).toHaveValue("brand new"))
  })
})

// ─── REQ-4: Cache invalidation after successful create ────────────────────────

describe("TagCombobox — cache invalidation on create success (REQ-4)", () => {
  it("should automatically select the newly created tag in the trigger after successful create", async () => {
    const user = userEvent.setup()
    const newTag = { id: "99", slug: "brand-new", label: "brand new" }

    // After create, GET /tags returns the updated list including the new tag
    const updatedTags = [...populatedTags, newTag]
    let created = false
    server.use(
      http.get("/tags", () => HttpResponse.json(created ? updatedTags : populatedTags)),
      http.post("/tags", () => {
        created = true
        return HttpResponse.json(newTag, { status: 201 })
      }),
    )
    renderCombobox()

    await user.click(screen.getByRole("button", { name: /select tags/i }))
    const input = await screen.findByRole("combobox")
    await user.type(input, "brand new")
    await user.click(screen.getByRole("option", { name: /create/i }))

    // Trigger should show the new tag's label after cache invalidation refetch
    await waitFor(() => {
      const trigger = document.querySelector('[aria-haspopup="listbox"]') as HTMLElement
      expect(trigger).toHaveTextContent(/brand new/i)
    })
  })
})

// ─── name prop — hidden input for form compatibility ───────────────────────────

describe("TagCombobox — name prop (REQ-a11y-2)", () => {
  it("should render a hidden input with the provided name and comma-joined value", async () => {
    server.use(http.get("/tags", () => HttpResponse.json(populatedTags)))
    const { Wrapper } = makeWrapper()
    render(
      React.createElement(TagCombobox, { value: ["network", "media"], onChange: vi.fn(), name: "tags" }),
      { wrapper: Wrapper },
    )

    const hidden = document.querySelector('input[type="hidden"][name="tags"]') as HTMLInputElement
    expect(hidden).not.toBeNull()
    expect(hidden.value).toBe("network,media")
  })
})
