import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { bookmarkKeys, deleteBookmark } from "@/lib/queries/bookmarks"

// REQ-11
export function useDeleteBookmark() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteBookmark(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bookmarkKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
