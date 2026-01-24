import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Base styles
        "flex min-h-[100px] w-full rounded-xl border-2 border-zinc-200 bg-white px-3.5 sm:px-4 py-3 text-base transition-all duration-200",
        // Placeholder
        "placeholder:text-zinc-400",
        // Focus states
        "focus-visible:outline-none focus-visible:border-zinc-400 focus-visible:ring-4 focus-visible:ring-zinc-100",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-zinc-50",
        // Hover state
        "hover:border-zinc-300",
        // Text size
        "text-sm sm:text-base leading-relaxed",
        // Resize
        "resize-y",
        // Dark mode
        "dark:border-zinc-700 dark:bg-zinc-950 dark:placeholder:text-zinc-500 dark:focus-visible:border-zinc-500 dark:focus-visible:ring-zinc-800 dark:hover:border-zinc-600",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
