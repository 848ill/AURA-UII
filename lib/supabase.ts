import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ""

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export interface ActivityLog {
  id: number
  activity: string | null
  status: string | null
  created_at: string | null
}

export interface ChatSession {
  id: string
  title: string | null
  user_id?: string | null
  created_at: string | null
}

export interface ChatMessage {
  id: string
  session_id: string
  role: "user" | "assistant"
  content: string
  created_at: string | null
}

export interface ChatFile {
  id: string
  session_id: string
  message_id: string | null
  user_id?: string | null
  file_name: string
  file_type: string
  file_size: number
  storage_path: string
  storage_url: string | null
  metadata: Record<string, any> | null
  created_at: string | null
}

export async function getLatestLogs(): Promise<ActivityLog[]> {
  try {
    if (!supabase) {
      console.warn("Supabase client not initialized. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env.local")
      return []
    }

    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      console.error("Error fetching logs:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getLatestLogs:", error)
    return []
  }
}

export function assertSupabaseClient() {
  if (!supabase) {
    throw new Error("Supabase client not initialized. Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env.local")
  }
  return supabase
}

export async function getRecentChatSessions(
  limit = 10,
  userId?: string
): Promise<ChatSession[]> {
  try {
    const client = assertSupabaseClient()
    
    let query = client
      .from("chat_sessions")
      .select("id,title,user_id,created_at")
      .order("created_at", { ascending: false })
      .limit(limit)

    // Filter by userId if provided (application-level filtering)
    if (userId) {
      // Filter by user_id AND ensure it's not NULL (exclude orphaned sessions)
      query = query.eq("user_id", userId).not("user_id", "is", null)
    } else {
      // If no userId provided, only return sessions with NULL user_id (legacy/anonymous)
      // This prevents returning all sessions when userId is missing
      query = query.is("user_id", null)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching chat sessions:", error)
      return []
    }

    // Filter out any sessions with NULL user_id to prevent orphaned sessions
    // This is a safety measure in case some sessions slipped through
    const filtered = (data || []).filter((session) => {
      if (userId) {
        // If filtering by userId, only return sessions that match exactly
        return session.user_id === userId && session.user_id !== null && session.user_id !== undefined
      }
      // If no userId, return sessions with NULL user_id (legacy/anonymous)
      return session.user_id === null
    })

    return filtered
  } catch (error) {
    console.error("Error in getRecentChatSessions:", error)
    return []
  }
}

export async function getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
  if (!sessionId) return []

  try {
    const client = assertSupabaseClient()
    const { data, error } = await client
      .from("chat_messages")
      .select("id,session_id,role,content,created_at")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching chat messages:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getSessionMessages:", error)
    return []
  }
}

export async function createChatSession(
  title?: string,
  userId?: string
): Promise<ChatSession | null> {
  try {
    const client = assertSupabaseClient()
    const normalizedTitle = title?.trim().length
      ? title.trim().slice(0, 80)
      : `New chat - ${new Date().toLocaleString()}`

    const sessionData: { title: string; user_id?: string } = {
      title: normalizedTitle,
    }

    if (userId) {
      sessionData.user_id = userId
    }

    const { data, error } = await client
      .from("chat_sessions")
      .insert(sessionData)
      .select("id,title,user_id,created_at")
      .single()

    if (error) {
      console.error("Error creating chat session:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in createChatSession:", error)
    return null
  }
}

export async function insertChatMessage(params: {
  sessionId: string
  role: "user" | "assistant"
  content: string
}): Promise<ChatMessage | null> {
  try {
    const client = assertSupabaseClient()
    const { sessionId, role, content } = params

    const { data, error } = await client
      .from("chat_messages")
      .insert({
        session_id: sessionId,
        role,
        content,
      })
      .select("id,session_id,role,content,created_at")
      .single()

    if (error) {
      console.error("Error inserting chat message:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in insertChatMessage:", error)
    return null
  }
}

export async function renameChatSession(sessionId: string, title: string) {
  try {
    const client = assertSupabaseClient()
    const normalizedTitle = title.trim().slice(0, 80)

    const { error } = await client
      .from("chat_sessions")
      .update({ title: normalizedTitle })
      .eq("id", sessionId)

    if (error) {
      console.error("Error renaming chat session:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in renameChatSession:", error)
    return false
  }
}

export async function deleteChatSession(sessionId: string) {
  try {
    const client = assertSupabaseClient()
    const { error } = await client
      .from("chat_sessions")
      .delete()
      .eq("id", sessionId)

    if (error) {
      console.error("Error deleting chat session:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in deleteChatSession:", error)
    return false
  }
}

export async function insertChatFile(params: {
  sessionId: string
  messageId?: string | null
  userId?: string | null
  fileName: string
  fileType: string
  fileSize: number
  storagePath: string
  storageUrl: string | null
  metadata?: Record<string, any>
}): Promise<ChatFile | null> {
  try {
    const client = assertSupabaseClient()
    const { sessionId, messageId, userId, fileName, fileType, fileSize, storagePath, storageUrl, metadata } = params

    const fileData: {
      session_id: string
      message_id: string | null
      user_id?: string
      file_name: string
      file_type: string
      file_size: number
      storage_path: string
      storage_url: string | null
      metadata: Record<string, any> | null
    } = {
      session_id: sessionId,
      message_id: messageId || null,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
      storage_path: storagePath,
      storage_url: storageUrl,
      metadata: metadata || null,
    }

    if (userId) {
      fileData.user_id = userId
    }

    const { data, error } = await client
      .from("chat_files")
      .insert(fileData)
      .select("id,session_id,message_id,user_id,file_name,file_type,file_size,storage_path,storage_url,metadata,created_at")
      .single()

    if (error) {
      console.error("Error inserting chat file:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in insertChatFile:", error)
    return null
  }
}

export async function getSessionFiles(sessionId: string): Promise<ChatFile[]> {
  try {
    const client = assertSupabaseClient()
    const { data, error } = await client
      .from("chat_files")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching session files:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getSessionFiles:", error)
    return []
  }
}

export async function getMessageFiles(messageId: string): Promise<ChatFile[]> {
  try {
    const client = assertSupabaseClient()
    const { data, error } = await client
      .from("chat_files")
      .select("*")
      .eq("message_id", messageId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching message files:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getMessageFiles:", error)
    return []
  }
}

