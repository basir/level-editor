"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type Variant = "default" | "secondary" | "ghost" | "destructive"
type Size = "default" | "sm" | "lg" | "icon"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants: Record<Variant, string> = {
      default: "bg-zinc-700 hover:bg-zinc-600 text-white",
      secondary: "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-editor-border",
      ghost: "bg-transparent hover:bg-zinc-800 text-zinc-200",
      destructive: "bg-red-800 hover:bg-red-700 text-red-100"
    }

    const sizes: Record<Size, string> = {
      default: "px-3 py-1 text-sm",
      sm: "px-2 py-0.5 text-xs",
      lg: "px-4 py-2 text-base",
      icon: "p-2"
    }

    return (
      <button
        ref={ref}
        className={cn(
          "rounded transition-colors disabled:opacity-50 inline-flex items-center justify-center whitespace-nowrap font-medium",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"
