import { useQuery } from "@tanstack/react-query"

import { fetchTags, tagKeys } from "@/lib/queries/tags"

/**
 * REQ-1: Fetch all tags with a 5-minute stale time.
 * Both TagFilterBar and TagCombobox consume this hook so only one network
 * request is ever made per cache window.
 */
export function useTags() {
  return useQuery({
    queryKey: tagKeys.all,
    queryFn: fetchTags,
    staleTime: 5 * 60 * 1000,
  })
}
