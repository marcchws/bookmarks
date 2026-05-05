import { createFileRoute } from "@tanstack/react-router"

import { BookmarkDetailRoute } from "@/components/bookmarks/bookmark-detail-route"

export const Route = createFileRoute("/bookmarks/$id")({
  component: BookmarkDetailPage,
})

function BookmarkDetailPage() {
  const { id } = Route.useParams()
  return <BookmarkDetailRoute id={id} />
}
