"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type Variant = "default" | "secondary" | "ghost" | "destructive"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants: Record<Variant, string> = {
      default: "bg-zinc-700 hover:bg-zinc-600 text-white",
      secondary: "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-editor-border",
      ghost: "bg-transparent hover:bg-zinc-800 text-zinc-200",
      destructive: "bg-red-800 hover:bg-red-700 text-red-100"
    }

    return (
      <button
        ref={ref}
        className={cn("rounded px-3 py-1 text-sm transition-colors disabled:opacity-50", variants[variant], className)}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"
