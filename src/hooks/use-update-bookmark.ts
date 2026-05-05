import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { bookmarkKeys, updateBookmark } from "@/lib/queries/bookmarks"
import type { BookmarkFormValues } from "@/types/bookmark"

// REQ-9
export function useUpdateBookmark() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string
      values: Partial<BookmarkFormValues>
    }) => updateBookmark(id, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bookmarkKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
