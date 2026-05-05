import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createTag, tagKeys } from "@/lib/queries/tags"
import type { Tag } from "@/types/tag"

/**
 * REQ-4: Inline tag creation.
 * On success: invalidates ['tags'] so both TagFilterBar and TagCombobox
 * refresh without a manual refetch.
 * On error: shows a toast with the server error message; the combobox stays
 * open and input value is preserved (controlled by the caller).
 */
export function useCreateTag() {
  const queryClient = useQueryClient()

  return useMutation<Tag, Error, string>({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all })
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to create tag")
    },
  })
}
