"use client"

import { useState, FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { getSupabaseBrowserClient } from "@/lib/supabase-browser"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()
    if (!trimmedEmail || !trimmedPassword) {
      setError("Email dan password wajib diisi.")
      return
    }

    setIsSubmitting(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      })

      if (authError) {
        setError(authError.message || "Login gagal. Coba lagi.")
        return
      }

      // Set flag bahwa user pernah login
      localStorage.setItem("aura_has_logged_in", "true")

      setSuccess("Berhasil masuk. Mengarahkan...")
      setTimeout(() => {
        router.push("/")
        router.refresh()
      }, 600)
    } catch (err) {
      console.error("Login error:", err)
      setError("Terjadi kesalahan tak terduga.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn("w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg space-y-6")}>
      <div className={cn("space-y-2 text-center")}>
        <h1 className={cn("text-2xl font-semibold text-gray-900")}>Masuk ke AURA</h1>
        <p className={cn("text-sm text-muted-foreground")}>
          Lanjutkan percakapan dan akses riwayat chat kamu.
        </p>
      </div>

      <form className={cn("space-y-4")} onSubmit={handleSubmit}>
        <div className={cn("space-y-1")}>
          <label className={cn("text-sm font-medium text-gray-700")}>Email</label>
          <Input
            type="email"
            autoComplete="email"
            placeholder="you@uii.ac.id"
            value={email}
            disabled={isSubmitting}
            onChange={(event) => setEmail(event.target.value)}
            className={cn("border-gray-300 focus-visible:ring-black")}
          />
        </div>

        <div className={cn("space-y-1")}>
          <label className={cn("text-sm font-medium text-gray-700")}>Password</label>
          <Input
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            disabled={isSubmitting}
            onChange={(event) => setPassword(event.target.value)}
            className={cn("border-gray-300 focus-visible:ring-black")}
          />
        </div>

        {error && (
          <p className={cn("text-sm text-red-500 bg-red-50 rounded-md px-3 py-2")}>{error}</p>
        )}

        {success && (
          <p className={cn("text-sm text-emerald-600 bg-emerald-50 rounded-md px-3 py-2")}>{success}</p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className={cn("w-full bg-black text-white hover:bg-gray-800")}
        >
          {isSubmitting ? "Memproses..." : "Masuk"}
        </Button>
      </form>

      <p className={cn("text-sm text-center text-muted-foreground")}>
        Belum punya akun?{" "}
        <Link href="/signup" className={cn("text-gray-900 underline underline-offset-4")}>
          Daftar sekarang
        </Link>
      </p>
    </div>
  )
}

