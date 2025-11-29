import { ReactNode } from "react"
import { cn } from "@/lib/utils"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100",
        "flex items-center justify-center px-4 py-16"
      )}
    >
      {children}
    </div>
  )
}

