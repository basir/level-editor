import type { Metadata } from "next"
import { Toaster } from "sonner"

import "@/app/globals.css"

export const metadata: Metadata = {
  title: "Optical Grid Level Editor",
  description: "Level editor for The Optical Grid"
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster theme="dark" />
      </body>
    </html>
  )
}
