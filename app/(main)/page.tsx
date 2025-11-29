import { ProtectedChat } from "@/components/sections/ProtectedChat"
import { Header } from "@/components/layout/Header"
import { cn } from "@/lib/utils"

export default async function HomePage() {
  // Sessions will be fetched client-side after auth to ensure proper user filtering
  // Server-side can't access user session easily, so we start empty
  const sessions: never[] = []
  const initialMessages: never[] = []

  return (
    <>
      <Header />
      <main className={cn("min-h-screen bg-background")}>
        <section className={cn("container py-6 md:py-8 lg:py-10")}>
          <div className={cn("mx-auto max-w-6xl")}>
            <ProtectedChat
              initialSessions={sessions}
              initialMessages={initialMessages}
              initialSessionId={null}
            />
          </div>
        </section>
      </main>
    </>
  )
}

