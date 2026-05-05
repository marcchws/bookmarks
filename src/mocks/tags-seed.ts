import { http, HttpResponse } from "msw"

import type { Tag } from "@/types/tag"

/**
 * REQ-state-1 (empty): GET /tags returns [].
 * Used to exercise "No tags yet" empty state in both TagFilterBar (renders null)
 * and TagCombobox dropdown.
 */
export const emptyTags: Tag[] = []

/**
 * REQ-state-2 (populated): realistic set of tags covering all chip states
 * (inactive, single-active, multi-active) and combobox search scenarios.
 */
export const populatedTags: Tag[] = [
  { id: "1", slug: "network", label: "Network" },
  { id: "2", slug: "encrypted", label: "Encrypted" },
  { id: "3", slug: "media", label: "Media" },
  { id: "4", slug: "sys-logs", label: "Sys Logs" },
  { id: "5", slug: "archive", label: "Archive" },
  { id: "6", slug: "secure", label: "Secure" },
  { id: "7", slug: "quarantine", label: "Quarantine" },
  { id: "8", slug: "temp-files", label: "Temp Files" },
  { id: "9", slug: "research", label: "Research" },
  { id: "10", slug: "tools", label: "Tools" },
]

/**
 * MSW handler override that simulates a network error on GET /tags.
 * Used in Storybook stories and tests to exercise REQ-state-3.
 *
 * Usage in a story:
 *   parameters: { msw: { handlers: { tags: networkError } } }
 */
export const networkError = http.get("/tags", () =>
  HttpResponse.error(),
)
