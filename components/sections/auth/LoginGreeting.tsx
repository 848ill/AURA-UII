"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function LoginGreeting() {
  const [hasVisitedBefore, setHasVisitedBefore] = useState(false)

  useEffect(() => {
    // Cek apakah user pernah login sebelumnya (ada session di localStorage atau cookie)
    const checkPreviousVisit = () => {
      // Cek localStorage untuk flag pernah login
      const hasLoggedInBefore = localStorage.getItem("aura_has_logged_in")
      
      // Atau cek apakah ada Supabase session di cookie
      const hasSession = document.cookie.includes("sb-")
      
      setHasVisitedBefore(!!hasLoggedInBefore || hasSession)
    }

    checkPreviousVisit()
  }, [])

  return (
    <h1 className={cn("text-3xl font-semibold text-gray-900")}>
      {hasVisitedBefore ? "Selamat datang kembali" : "Selamat Datang"}
    </h1>
  )
}

