import { createFileRoute } from "@tanstack/react-router"

import { BookmarkEditRoute } from "@/components/bookmarks/bookmark-edit-route"

export const Route = createFileRoute("/bookmarks/$id/edit")({
  component: BookmarkEditPage,
})

function BookmarkEditPage() {
  const { id } = Route.useParams()
  return <BookmarkEditRoute id={id} />
}
