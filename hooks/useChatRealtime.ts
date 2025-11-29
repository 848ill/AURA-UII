"use client"

import { useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase-browser"
import type { ChatMessage } from "@/lib/supabase"

export function useChatRealtime(
  sessionId: string | null,
  onInsert: (message: ChatMessage) => void
) {
  useEffect(() => {
    if (!sessionId) return

    let mounted = true

    async function subscribe() {
      try {
        const supabase = getSupabaseBrowserClient()
        const channel = supabase
          .channel(`chat_messages:${sessionId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "chat_messages",
              filter: `session_id=eq.${sessionId}`,
            },
            (payload) => {
              if (!mounted) return
              onInsert(payload.new as ChatMessage)
            }
          )
          .subscribe()

        return () => {
          supabase.removeChannel(channel)
        }
      } catch (error) {
        console.error("useChatRealtime subscription failed:", error)
        return () => {}
      }
    }

    let cleanup: (() => void) | undefined
    subscribe().then((fn) => {
      cleanup = fn
    })

    return () => {
      mounted = false
      cleanup?.()
    }
  }, [sessionId, onInsert])
}

