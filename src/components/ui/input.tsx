import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      // DESIGN.md: 1px border, focus = outline-active + neon glow, zero radius
      className={cn(
        "h-10 w-full min-w-0 rounded-none border border-input bg-transparent px-3 py-2 font-mono text-sm transition-[border-color,box-shadow] duration-75 outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:shadow-[0_0_0_1px_var(--color-ring),0_0_10px_2px_color-mix(in_srgb,var(--color-ring)_40%,transparent)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:border-destructive aria-invalid:shadow-[0_0_0_1px_var(--color-destructive)] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Input }
