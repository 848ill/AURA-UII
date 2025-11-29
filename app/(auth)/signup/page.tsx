import { Metadata } from "next"
import { SignupForm } from "@/components/sections/auth/SignupForm"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Daftar | AURA",
  description: "Buat akun baru untuk mulai menggunakan AURA, asisten virtual UII.",
}

export default function SignupPage() {
  return (
    <main className={cn("w-full max-w-6xl mx-auto space-y-10")}>
      <div className={cn("space-y-2 text-center")}>
        <p className={cn("text-sm uppercase tracking-[0.2em] text-gray-500")}>
          AURA UII
        </p>
        <h1 className={cn("text-3xl font-semibold text-gray-900")}>
          Mulai Perjalananmu
        </h1>
      </div>
      <div className={cn("flex justify-center")}>
        <SignupForm />
      </div>
    </main>
  )
}

