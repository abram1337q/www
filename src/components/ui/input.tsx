import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles
        "flex h-10 sm:h-11 w-full rounded-xl border-2 border-zinc-200 bg-white px-3.5 sm:px-4 py-2 text-base transition-all duration-200",
        // File input styles
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-zinc-950",
        // Placeholder
        "placeholder:text-zinc-400",
        // Focus states
        "focus-visible:outline-none focus-visible:border-zinc-400 focus-visible:ring-4 focus-visible:ring-zinc-100",
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-zinc-50",
        // Hover state
        "hover:border-zinc-300",
        // Text size
        "text-sm sm:text-base",
        // Dark mode
        "dark:border-zinc-700 dark:bg-zinc-950 dark:file:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus-visible:border-zinc-500 dark:focus-visible:ring-zinc-800 dark:hover:border-zinc-600",
        className
      )}
      {...props}
    />
  )
}

export { Input }
