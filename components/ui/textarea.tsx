"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn("w-full rounded border border-editor-border bg-zinc-800 px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-amber-500", className)}
    {...props}
  />
))

Textarea.displayName = "Textarea"
