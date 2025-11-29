import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { User } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ""

/**
 * Get server-side Supabase client with user session
 * This uses cookies to get the session token
 */
export async function getServerSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase credentials not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY."
    )
  }

  const cookieStore = await cookies()
  
  // Supabase stores session in cookies with specific naming
  // Look for the auth token cookie (format: sb-<project-ref>-auth-token)
  const allCookies = cookieStore.getAll()
  const authCookie = allCookies.find((cookie) =>
    cookie.name.includes("auth-token") || cookie.name.includes("supabase.auth.token")
  )

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: authCookie
        ? {
            Authorization: `Bearer ${authCookie.value.split(".")[0]}`, // Simplified - we'll get session from header
          }
        : {},
    },
  })

  // Get session from Authorization header if available
  const authHeader = cookieStore.get("Authorization")?.value
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "")
    const { data: { user } } = await supabase.auth.getUser(token)
    
    return { supabase, user: user ?? null }
  }

  // Try to get session from request
  // For API routes, we can pass the session from client
  return { supabase, user: null }
}

/**
 * Get current user from server session
 * This is a simplified version - for full SSR support, install @supabase/ssr
 */
export async function getServerUser(): Promise<User | null> {
  try {
    const { user } = await getServerSupabaseClient()
    return user
  } catch (error) {
    console.error("Error getting server user:", error)
    return null
  }
}

/**
 * Require authentication - redirects to login if not authenticated
 */
export async function requireAuth(): Promise<User> {
  const user = await getServerUser()
  
  if (!user) {
    redirect("/login")
  }

  return user
}

/**
 * Alternative: Get user ID from request headers (for API routes)
 * Client should send user_id in Authorization header or request body
 */
export async function getUserIdFromRequest(
  request: Request
): Promise<string | null> {
  // Try to get from Authorization header
  const authHeader = request.headers.get("authorization")
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "")
    try {
      const { data: { user } } = await getServerSupabaseClient()
      const { supabase } = await getServerSupabaseClient()
      const { data } = await supabase.auth.getUser(token)
      return data.user?.id ?? null
    } catch {
      return null
    }
  }

  // For API routes, user_id might be passed in body
  // This is handled in individual API routes
  return null
}

