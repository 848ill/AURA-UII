import { assertSupabaseClient } from "./supabase"

/**
 * Check if a session belongs to a specific user
 */
export async function validateSessionOwnership(
  sessionId: string,
  userId: string
): Promise<boolean> {
  try {
    const client = assertSupabaseClient()
    const { data, error } = await client
      .from("chat_sessions")
      .select("user_id")
      .eq("id", sessionId)
      .single()

    if (error || !data) {
      return false
    }

    return data.user_id === userId
  } catch (error) {
    console.error("Error validating session ownership:", error)
    return false
  }
}

