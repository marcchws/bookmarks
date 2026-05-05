import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// DESIGN.md: rectangular ghost border by default; hover = solid neon fill + glow;
// active = 2px horizontal translate (mechanical press); zero-radius everywhere.
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-none border border-transparent bg-clip-padding font-mono text-sm font-medium whitespace-nowrap transition-[border-color,background-color,box-shadow,transform] duration-75 outline-none select-none focus-visible:border-ring focus-visible:shadow-[0_0_0_1px_var(--color-ring)] active:not-aria-[haspopup]:translate-x-0.5 disabled:pointer-events-none disabled:opacity-40 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Ghost rectangular + neon fill on hover
        default:
          "border-primary text-primary hover:bg-primary hover:text-on-primary hover:shadow-[0_0_10px_2px_color-mix(in_srgb,var(--color-primary)_50%,transparent)]",
        outline:
          "border-border text-foreground hover:border-primary hover:text-primary hover:shadow-[0_0_10px_2px_color-mix(in_srgb,var(--color-primary)_50%,transparent)]",
        secondary:
          "border-secondary text-secondary hover:bg-secondary hover:text-on-secondary hover:shadow-[0_0_10px_2px_color-mix(in_srgb,var(--color-secondary)_50%,transparent)]",
        ghost:
          "hover:bg-surface-container hover:text-foreground hover:border-border",
        destructive:
          "border-error text-error hover:bg-error hover:text-on-error hover:shadow-[0_0_10px_2px_color-mix(in_srgb,var(--color-error)_50%,transparent)]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "relative h-6 gap-1 px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3 after:absolute after:left-0 after:right-0 after:-inset-y-[10px] after:content-['']",
        sm: "relative h-7 gap-1 px-3 text-[0.8rem] has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5 after:absolute after:left-0 after:right-0 after:-inset-y-[8px] after:content-['']",
        lg: "h-11 gap-2 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-9",
        "icon-xs": "relative size-6 [&_svg:not([class*='size-'])]:size-3 after:absolute after:content-[''] after:-inset-[10px]",
        "icon-sm": "relative size-7 [&_svg:not([class*='size-'])]:size-3.5 after:absolute after:content-[''] after:-inset-[8px]",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
