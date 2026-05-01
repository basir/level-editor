"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn("w-full rounded border border-editor-border bg-zinc-800 px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-amber-500", className)}
    {...props}
  />
))

Input.displayName = "Input"
