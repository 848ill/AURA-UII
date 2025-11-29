import { NextResponse } from "next/server"
import { createChatSession, getRecentChatSessions } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    // Get userId from query params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Filter by userId - even if RLS is disabled, we filter at application level
    const sessions = await getRecentChatSessions(25, userId)
    return NextResponse.json({ sessions })
  } catch (error) {
    console.error("GET /api/chat/sessions error:", error)
    return NextResponse.json(
      { error: "Failed to load chat sessions" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { title, userId } = await request.json().catch(() => ({}))
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    const session = await createChatSession(title, userId)

    if (!session) {
      return NextResponse.json(
        { error: "Unable to create chat session" },
        { status: 500 }
      )
    }

    return NextResponse.json({ session }, { status: 201 })
  } catch (error) {
    console.error("POST /api/chat/sessions error:", error)
    return NextResponse.json(
      { error: "Failed to create chat session" },
      { status: 500 }
    )
  }
}

