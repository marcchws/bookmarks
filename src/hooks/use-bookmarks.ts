import { useQuery } from "@tanstack/react-query"

import { bookmarkKeys, fetchBookmarks } from "@/lib/queries/bookmarks"

// REQ-1, REQ-3, REQ-4, REQ-state-2, REQ-state-3
export function useBookmarks(filters: { q?: string; tag?: string[] } = {}) {
  return useQuery({
    queryKey: bookmarkKeys.list(filters),
    queryFn: () => fetchBookmarks(filters),
    staleTime: 30_000,
  })
}
