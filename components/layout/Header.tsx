"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { LogOut, User } from "lucide-react"

export function Header() {
  const { user, loading, signOut } = useAuth()

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur",
        "supports-[backdrop-filter]:bg-background/60"
      )}
    >
      <div className="container flex h-14 items-center justify-between">
        <div className="mr-4 flex items-center space-x-3">
          <Link className="flex items-center space-x-2" href="/">
            <span className="font-bold text-xl tracking-tight">AURA</span>
            <span className="text-sm font-normal text-muted-foreground hidden sm:inline">UII Assistant</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : user ? (
            <>
              <div className="flex items-center gap-2 text-sm text-foreground/80">
                <User className="h-4 w-4" />
                <span className="max-w-[150px] truncate hidden sm:inline">{user.email}</span>
                <span className="sm:hidden">{user.email?.split("@")[0] || "User"}</span>
              </div>
              <Button
                onClick={() => signOut()}
                variant="outline"
                size="sm"
                className={cn("text-sm font-medium gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300")}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={cn("text-sm font-medium text-foreground/70 hover:text-foreground")}
              >
                Login
              </Link>
              <Button
                asChild
                className={cn("bg-black text-white hover:bg-gray-800 text-sm px-4 py-2")}
              >
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

