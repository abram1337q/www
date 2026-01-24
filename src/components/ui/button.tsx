import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-zinc-900 text-zinc-50 shadow-md hover:bg-zinc-800 hover:shadow-lg focus-visible:ring-zinc-950 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200",
        destructive:
          "bg-red-500 text-white shadow-md hover:bg-red-600 hover:shadow-lg focus-visible:ring-red-500",
        outline:
          "border-2 border-zinc-200 bg-white shadow-sm hover:bg-zinc-50 hover:border-zinc-300 hover:shadow-md focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:hover:border-zinc-600",
        secondary:
          "bg-zinc-100 text-zinc-900 shadow-sm hover:bg-zinc-200 hover:shadow-md focus-visible:ring-zinc-400 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-700",
        ghost:
          "hover:bg-zinc-100 hover:text-zinc-900 focus-visible:ring-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
        link:
          "text-zinc-900 underline-offset-4 hover:underline focus-visible:ring-zinc-400 dark:text-zinc-50",
      },
      size: {
        default: "h-10 sm:h-11 px-4 sm:px-5 py-2",
        sm: "h-8 sm:h-9 rounded-lg gap-1.5 px-3 sm:px-4 text-xs sm:text-sm",
        lg: "h-12 sm:h-14 rounded-2xl px-6 sm:px-8 text-base",
        icon: "size-9 sm:size-10 rounded-xl",
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
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
