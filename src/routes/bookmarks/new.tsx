import { createFileRoute } from "@tanstack/react-router"

import { BookmarkForm } from "@/components/bookmarks/bookmark-form"

export const Route = createFileRoute("/bookmarks/new")({
  component: BookmarkNewPage,
})

function BookmarkNewPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <BookmarkForm mode="create" />
    </main>
  )
}
