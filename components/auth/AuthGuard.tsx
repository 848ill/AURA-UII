"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      fallback || (
        <div className={cn("flex items-center justify-center min-h-screen")}>
          <div className={cn("text-center space-y-4")}>
            <div className={cn("text-lg font-medium")}>Memuat...</div>
            <div className={cn("text-sm text-muted-foreground")}>
              Memeriksa autentikasi...
            </div>
          </div>
        </div>
      )
    )
  }

  if (!user) {
    return null // Redirecting...
  }

  return <>{children}</>
}

