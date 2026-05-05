import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      // DESIGN.md: no shimmer — CSS opacity pulse only; surface-container-high block
    className={cn("animate-pulse rounded-none bg-surface-container-high", className)}
      {...props}
    />
  )
}

export { Skeleton }
