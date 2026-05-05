import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { bookmarkKeys, createBookmark } from "@/lib/queries/bookmarks"
import type { BookmarkFormValues } from "@/types/bookmark"

// REQ-7
export function useCreateBookmark() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: BookmarkFormValues) => createBookmark(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bookmarkKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
