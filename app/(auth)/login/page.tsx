import { Metadata } from "next"
import { LoginForm } from "@/components/sections/auth/LoginForm"
import { LoginGreeting } from "@/components/sections/auth/LoginGreeting"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Masuk | AURA",
  description: "Masuk ke AURA untuk melanjutkan percakapan dengan asisten virtual UII.",
}

export default function LoginPage() {
  return (
    <main className={cn("w-full max-w-6xl mx-auto space-y-10")}>
      <div className={cn("space-y-2 text-center")}>
        <p className={cn("text-sm uppercase tracking-[0.2em] text-gray-500")}>
          AURA UII
        </p>
        <LoginGreeting />
      </div>
      <div className={cn("flex justify-center")}>
        <LoginForm />
      </div>
    </main>
  )
}

