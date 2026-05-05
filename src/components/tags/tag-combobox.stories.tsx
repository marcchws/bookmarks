import type { Meta, StoryObj } from "@storybook/react-vite"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { http, HttpResponse } from "msw"
import { useState } from "react"
import { Toaster } from "sonner"

import { TagCombobox } from "./tag-combobox"
import { populatedTags, emptyTags, networkError } from "@/mocks/tags-seed"

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
})

const meta = {
  title: "Tags/TagCombobox",
  component: TagCombobox,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background p-8">
          <div className="max-w-sm">
            <label className="mb-2 block font-mono text-label-caps font-bold uppercase tracking-[0.1em] text-on-surface-variant">
              Tags
            </label>
            <Story />
          </div>
        </div>
        <Toaster />
      </QueryClientProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof TagCombobox>

export default meta
type Story = StoryObj<typeof TagCombobox>

function ComboboxWrapper(props: { initialValue?: string[] }) {
  const [value, setValue] = useState<string[]>(props.initialValue ?? [])
  return <TagCombobox value={value} onChange={setValue} name="tags" />
}

/** REQ-state-1: Loading spinner inside the dropdown while GET /tags is in-flight */
export const Loading: Story = {
  render: () => <ComboboxWrapper />,
  parameters: {
    msw: {
      handlers: [
        http.get("/tags", async () => {
          await new Promise((r) => setTimeout(r, 60_000))
          return HttpResponse.json([])
        }),
      ],
    },
  },
}

/** REQ-state-2: Empty — "No tags yet — type to create one" in the dropdown */
export const Empty: Story = {
  render: () => <ComboboxWrapper />,
  parameters: {
    msw: {
      handlers: [http.get("/tags", () => HttpResponse.json(emptyTags))],
    },
  },
}

/** REQ-state-3: Error — "Failed to load tags" with retry link inside the dropdown */
export const ErrorState: Story = {
  name: "Error",
  render: () => <ComboboxWrapper />,
  parameters: {
    msw: { handlers: [networkError] },
  },
}

/** Default: all tags available, none selected */
export const Default: Story = {
  render: () => <ComboboxWrapper />,
  parameters: {
    msw: {
      handlers: [http.get("/tags", () => HttpResponse.json(populatedTags))],
    },
  },
}

/** Pre-selected tags showing magenta chips in the summary bar */
export const WithSelection: Story = {
  render: () => <ComboboxWrapper initialValue={["network", "archive"]} />,
  parameters: {
    msw: {
      handlers: [http.get("/tags", () => HttpResponse.json(populatedTags))],
    },
  },
}

/**
 * REQ-state-4: Inline create loading — "Create" option shows spinner and is
 * disabled while POST /tags is in-flight (prevents double-submit).
 */
export const CreateLoading: Story = {
  name: "Create (loading)",
  render: () => <ComboboxWrapper />,
  parameters: {
    msw: {
      handlers: [
        http.get("/tags", () => HttpResponse.json(populatedTags)),
        http.post("/tags", async () => {
          await new Promise((r) => setTimeout(r, 60_000))
          return HttpResponse.json({})
        }),
      ],
    },
  },
}

/**
 * REQ-state-5: Inline create error — toast shown on POST failure;
 * combobox stays open and typed value is preserved for retry.
 */
export const CreateError: Story = {
  name: "Create (error)",
  render: () => <ComboboxWrapper />,
  parameters: {
    msw: {
      handlers: [
        http.get("/tags", () => HttpResponse.json(populatedTags)),
        http.post("/tags", () =>
          HttpResponse.json({ message: "Internal server error" }, { status: 500 }),
        ),
      ],
    },
  },
}
