import { useQuery } from "@tanstack/react-query"

import { bookmarkKeys, fetchBookmark } from "@/lib/queries/bookmarks"

// REQ-12, REQ-state-5, REQ-state-6
export function useBookmark(id: string) {
  return useQuery({
    queryKey: bookmarkKeys.detail(id),
    queryFn: () => fetchBookmark(id),
    staleTime: 30_000,
  })
}
