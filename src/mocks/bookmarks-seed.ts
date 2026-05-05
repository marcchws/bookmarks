import { http, HttpResponse } from "msw"

import type { Bookmark } from "@/types/bookmark"

/**
 * REQ-state-1: Empty list — no bookmarks saved yet.
 * Used to exercise the empty state / ASCII art CTA.
 */
export const emptyBookmarks: Bookmark[] = []

/**
 * REQ-state-2: Populated list — covers all card anatomy (favicon, title, URL,
 * description, tags, relative date) and filter scenarios (multi-tag, no-tag).
 */
export const populatedBookmarks: Bookmark[] = [
  {
    id: "1",
    url: "https://github.com/tanstack/query",
    title: "TanStack Query",
    description:
      "Powerful asynchronous state management, server-state utilities and data fetching for the web.",
    tags: ["network", "tools"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "2",
    url: "https://tanstack.com/router/latest",
    title: "TanStack Router",
    description:
      "A fully type-safe router with built-in caching and first-class search-params support.",
    tags: ["network", "tools"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "3",
    url: "https://tailwindcss.com",
    title: "Tailwind CSS",
    description: "A utility-first CSS framework for rapid UI development.",
    tags: ["tools"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "4",
    url: "https://www.typescriptlang.org",
    title: "TypeScript",
    description:
      "TypeScript is JavaScript with syntax for types. It transpiles to JavaScript.",
    tags: ["tools", "encrypted"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    id: "5",
    url: "https://mswjs.io",
    title: "Mock Service Worker",
    description:
      "Industry standard API mocking for JavaScript. Intercepts requests on the network level.",
    tags: ["network", "secure"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: "6",
    url: "https://vitejs.dev",
    title: "Vite",
    description:
      "Next generation frontend tooling. It's fast! The dev server starts in milliseconds.",
    tags: ["tools"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), // 2 weeks ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
  {
    id: "7",
    url: "https://storybook.js.org",
    title: "Storybook",
    description:
      "Storybook is a frontend workshop for building UI components and pages in isolation.",
    tags: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), // 1 month ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
  {
    id: "8",
    url: "https://zod.dev",
    title: "Zod",
    description:
      "TypeScript-first schema validation with static type inference. Dead simple.",
    tags: ["encrypted", "secure"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(), // 2 months ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
  },
]

/**
 * REQ-state-3: Network error scenario.
 * Override handler that makes GET /bookmarks fail.
 */
export const bookmarkNetworkError = http.get("/bookmarks", () =>
  HttpResponse.error(),
)

/**
 * REQ-state-5: Single bookmark for detail view — all fields populated.
 */
export const detailBookmark: Bookmark = populatedBookmarks[0]!

/**
 * REQ-state-6: Not-found scenario for detail view.
 * Override handler that returns 404 for any bookmark ID.
 */
export const bookmarkNotFound = http.get("/bookmarks/:id", () =>
  HttpResponse.json({ message: "Bookmark not found" }, { status: 404 }),
)
