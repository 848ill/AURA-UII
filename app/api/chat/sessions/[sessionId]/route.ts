import { NextResponse } from "next/server"
import { deleteChatSession, renameChatSession } from "@/lib/supabase"
import { validateSessionOwnership } from "@/lib/session-ownership"

interface RouteParams {
  params: {
    sessionId: string
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { title, userId } = await request.json().catch(() => ({}))

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      )
    }

    // Validate ownership if userId provided
    if (userId) {
      const isOwner = await validateSessionOwnership(params.sessionId, userId)
      if (!isOwner) {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        )
      }
    }

    const success = await renameChatSession(params.sessionId, title)
    if (!success) {
      return NextResponse.json(
        { error: "Failed to rename chat session" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`PATCH session ${params.sessionId} failed:`, error)
    return NextResponse.json(
      { error: "Failed to rename chat session" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    // Get userId from query params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    // Validate ownership if userId provided
    if (userId) {
      const isOwner = await validateSessionOwnership(params.sessionId, userId)
      if (!isOwner) {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        )
      }
    }

    const success = await deleteChatSession(params.sessionId)
    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete chat session" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`DELETE session ${params.sessionId} failed:`, error)
    return NextResponse.json(
      { error: "Failed to delete chat session" },
      { status: 500 }
    )
  }
}

