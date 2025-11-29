"use client"

import { AuthGuard } from "@/components/auth/AuthGuard"
import ChatInterface from "@/components/sections/ChatInterface"
import type { ChatSession, ChatMessage } from "@/lib/supabase"

interface ProtectedChatProps {
  initialSessions: ChatSession[]
  initialMessages: ChatMessage[]
  initialSessionId?: string | null
}

export function ProtectedChat({
  initialSessions,
  initialMessages,
  initialSessionId,
}: ProtectedChatProps) {
  return (
    <AuthGuard>
      <ChatInterface
        initialSessions={initialSessions}
        initialMessages={initialMessages}
        initialSessionId={initialSessionId}
      />
    </AuthGuard>
  )
}

