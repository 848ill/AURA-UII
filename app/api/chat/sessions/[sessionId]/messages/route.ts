import { NextResponse } from "next/server"
import { getSessionMessages, insertChatMessage } from "@/lib/supabase"
import { validateSessionOwnership } from "@/lib/session-ownership"

interface RouteParams {
  params: {
    sessionId: string
  }
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    // Get userId from query params for validation
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    // If userId provided, validate ownership
    if (userId) {
      const isOwner = await validateSessionOwnership(params.sessionId, userId)
      if (!isOwner) {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        )
      }
    }

    const messages = await getSessionMessages(params.sessionId)
    return NextResponse.json({ messages })
  } catch (error) {
    console.error(`GET messages for session ${params.sessionId} failed:`, error)
    return NextResponse.json(
      { error: "Failed to load messages" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { role, content } = await request.json().catch(() => ({}))

    if (!role || !["user", "assistant"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role value" },
        { status: 400 }
      )
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      )
    }

    const message = await insertChatMessage({
      sessionId: params.sessionId,
      role,
      content,
    })

    if (!message) {
      return NextResponse.json(
        { error: "Unable to store chat message" },
        { status: 500 }
      )
    }

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error(`POST message for session ${params.sessionId} failed:`, error)
    return NextResponse.json(
      { error: "Failed to store message" },
      { status: 500 }
    )
  }
}

