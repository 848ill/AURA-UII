"use client"

import { useState, FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { getSupabaseBrowserClient } from "@/lib/supabase-browser"

export function SignupForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()
    const trimmedConfirm = confirmPassword.trim()

    if (!trimmedEmail || !trimmedPassword) {
      setError("Email dan password wajib diisi.")
      return
    }

    if (trimmedPassword.length < 8) {
      setError("Password minimal 8 karakter.")
      return
    }

    if (trimmedPassword !== trimmedConfirm) {
      setError("Konfirmasi password tidak cocok.")
      return
    }

    setIsSubmitting(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const { error: signupError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPassword,
      })

      if (signupError) {
        setError(signupError.message || "Pendaftaran gagal. Coba lagi.")
        return
      }

      // Check if email confirmation is required
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // Email confirmation required
        setSuccess("Berhasil mendaftar! Silakan cek email untuk verifikasi sebelum login.")
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        // Already confirmed, can login directly
        setSuccess("Berhasil mendaftar! Mengarahkan ke halaman utama...")
        setTimeout(() => {
          router.push("/")
          router.refresh()
        }, 600)
      }
    } catch (err) {
      console.error("Signup error:", err)
      setError("Terjadi kesalahan tak terduga.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn("w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg space-y-6")}>
      <div className={cn("space-y-2 text-center")}>
        <h1 className={cn("text-2xl font-semibold text-gray-900")}>Buat Akun AURA</h1>
        <p className={cn("text-sm text-muted-foreground")}>
          Mulai chat dengan asisten virtual UII dan simpan riwayat percakapan kamu.
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
            autoComplete="new-password"
            placeholder="Minimal 8 karakter"
            value={password}
            disabled={isSubmitting}
            onChange={(event) => setPassword(event.target.value)}
            className={cn("border-gray-300 focus-visible:ring-black")}
          />
        </div>

        <div className={cn("space-y-1")}>
          <label className={cn("text-sm font-medium text-gray-700")}>Konfirmasi Password</label>
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="Konfirmasi password"
            value={confirmPassword}
            disabled={isSubmitting}
            onChange={(event) => setConfirmPassword(event.target.value)}
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
          {isSubmitting ? "Memproses..." : "Daftar"}
        </Button>
      </form>

      <p className={cn("text-sm text-center text-muted-foreground")}>
        Sudah punya akun?{" "}
        <Link href="/login" className={cn("text-gray-900 underline underline-offset-4")}>
          Masuk di sini
        </Link>
      </p>
    </div>
  )
}

