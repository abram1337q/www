"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        // Base styles
        "peer h-5 w-5 shrink-0 rounded-lg border-2 border-zinc-300 bg-white",
        // Transition
        "transition-all duration-200",
        // Ring styles
        "ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2",
        // Hover
        "hover:border-zinc-400 hover:bg-zinc-50",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Checked state
        "data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900 data-[state=checked]:text-white data-[state=checked]:hover:bg-zinc-800 data-[state=checked]:hover:border-zinc-800",
        // Dark mode
        "dark:border-zinc-600 dark:bg-zinc-900 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300",
        "dark:hover:border-zinc-500 dark:hover:bg-zinc-800",
        "dark:data-[state=checked]:bg-zinc-50 dark:data-[state=checked]:border-zinc-50 dark:data-[state=checked]:text-zinc-900",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <CheckIcon className="h-3.5 w-3.5 stroke-[3]" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
