import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// DESIGN.md: rectangular chips, monospaced label-caps, secondary=magenta, tertiary=lime
const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-none border border-transparent px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-[0.1em] whitespace-nowrap transition-all focus-visible:border-ring focus-visible:shadow-[0_0_0_1px_var(--color-ring)] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        // Primary (cyan) — system status
        default:
          "border-primary text-primary",
        // Secondary (magenta) — tag categorisation
        secondary:
          "border-secondary text-secondary",
        // Tertiary (lime) — success / active state
        success:
          "border-tertiary text-tertiary",
        // Error
        destructive:
          "border-error text-error",
        // Solid fills
        "default-solid":
          "bg-primary text-on-primary border-primary",
        "secondary-solid":
          "bg-secondary text-on-secondary border-secondary",
        "success-solid":
          "bg-tertiary text-on-tertiary border-tertiary",
        outline:
          "border-border text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
