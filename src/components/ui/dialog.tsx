"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "transition-all duration-300",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          // Позиционирование
          "fixed z-50",
          // Мобильная версия - полноэкранная снизу
          "inset-x-0 bottom-0 w-full max-w-full",
          "rounded-t-3xl rounded-b-none",
          // Десктоп - по центру с ограниченной шириной
          "sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2",
          "sm:w-[calc(100%-2rem)] sm:max-w-lg",
          "sm:rounded-3xl",
          // Стили
          "grid gap-4 border border-zinc-200/80 bg-white p-6 shadow-2xl shadow-black/10",
          // Анимации
          "duration-300 ease-out",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          // Мобильная анимация - slide from bottom
          "data-[state=closed]:slide-out-to-bottom-full data-[state=open]:slide-in-from-bottom-full",
          // Десктоп анимация - zoom и slide
          "sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=open]:slide-in-from-bottom-0",
          "sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95",
          "sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=open]:slide-in-from-left-1/2",
          "sm:data-[state=closed]:slide-out-to-top-[48%] sm:data-[state=open]:slide-in-from-top-[48%]",
          // Dark mode
          "dark:border-zinc-800 dark:bg-zinc-950",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className={cn(
            "absolute right-4 top-4 z-10",
            "flex h-8 w-8 items-center justify-center",
            "rounded-full bg-zinc-100 text-zinc-500",
            "opacity-80 transition-all duration-200",
            "hover:opacity-100 hover:bg-zinc-200 hover:text-zinc-700",
            "focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2",
            "disabled:pointer-events-none",
            "data-[state=open]:bg-zinc-100 data-[state=open]:text-zinc-500",
            "dark:ring-offset-zinc-950 dark:focus:ring-zinc-300",
            "dark:bg-zinc-800 dark:text-zinc-400",
            "dark:hover:bg-zinc-700 dark:hover:text-zinc-200",
            "dark:data-[state=open]:bg-zinc-800 dark:data-[state=open]:text-zinc-400"
          )}
        >
          <XIcon className="h-4 w-4" />
          <span className="sr-only">Закрыть</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "flex flex-col space-y-2 text-center sm:text-left",
        "pr-8", // Space for close button
        className
      )}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-3 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "text-xl font-semibold leading-tight tracking-tight text-zinc-900",
        "dark:text-zinc-100",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-zinc-500 leading-relaxed",
        "dark:text-zinc-400",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
