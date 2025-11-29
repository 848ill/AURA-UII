# 🔐 AUTH IMPLEMENTATION PLAN

## Status Saat Ini

✅ **Yang Sudah Ada:**
- Login/Signup pages (`/login`, `/signup`)
- Supabase Auth integration (forms sudah functional)
- Supabase Auth client setup

❌ **Yang Belum Ada:**
- Chat sessions belum terhubung dengan `user_id`
- Tidak ada auth guard/middleware
- Header belum show user info/logout
- RLS policies belum user-based
- API routes belum check authentication

---

## 📋 Implementation Checklist

### 1. Database Schema Updates

#### Step 1.1: Update `chat_sessions` table
```sql
ALTER TABLE chat_sessions 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX chat_sessions_user_id_idx ON chat_sessions(user_id);
```

#### Step 1.2: Update `chat_messages` table (optional, via session)
- `chat_messages` sudah punya `session_id`, jadi bisa access via session
- Tapi bisa juga tambahkan `user_id` langsung untuk extra security

#### Step 1.3: Update `chat_files` table
```sql
ALTER TABLE chat_files 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX chat_files_user_id_idx ON chat_files(user_id);
```

---

### 2. RLS (Row Level Security) Policies

#### Step 2.1: Enable RLS
```sql
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_files ENABLE ROW LEVEL SECURITY;
```

#### Step 2.2: Create Policies untuk `chat_sessions`
```sql
-- Users can only see their own sessions
CREATE POLICY "Users can view own sessions"
  ON chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can insert own sessions"
  ON chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions"
  ON chat_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users can delete own sessions"
  ON chat_sessions FOR DELETE
  USING (auth.uid() = user_id);
```

#### Step 2.3: Create Policies untuk `chat_messages`
```sql
-- Users can view messages from their own sessions
CREATE POLICY "Users can view own messages"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- Users can insert messages to their own sessions
CREATE POLICY "Users can insert own messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  );
```

#### Step 2.4: Create Policies untuk `chat_files`
```sql
-- Users can view their own files
CREATE POLICY "Users can view own files"
  ON chat_files FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own files
CREATE POLICY "Users can insert own files"
  ON chat_files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own files
CREATE POLICY "Users can delete own files"
  ON chat_files FOR DELETE
  USING (auth.uid() = user_id);
```

---

### 3. Next.js Middleware

#### Step 3.1: Create `middleware.ts`
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect routes that require auth
  if (req.nextUrl.pathname.startsWith('/chat') || req.nextUrl.pathname === '/') {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if (req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/signup')) {
    if (session) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

**ATAU** jika tidak pakai `@supabase/auth-helpers-nextjs`, bisa pakai approach lebih sederhana dengan server-side checks.

---

### 4. Update Header Component

#### Step 4.1: Create Auth Hook
```typescript
// hooks/useAuth.ts
"use client"
import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
  }

  return { user, loading, signOut }
}
```

#### Step 4.2: Update Header
- Show user email if logged in
- Show "Logout" button instead of "Login/Sign Up"
- Handle logout functionality

---

### 5. Update Supabase Functions

#### Step 5.1: Update `getRecentChatSessions()`
- Add `user_id` parameter
- Filter by `user_id`

#### Step 5.2: Update `createChatSession()`
- Include `user_id` when creating

#### Step 5.3: Update all file functions
- Include `user_id` when saving files

---

### 6. Update API Routes

#### Step 6.1: Create Auth Helper
```typescript
// lib/auth-helpers.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getServerSession() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  return { session, supabase }
}

export async function requireAuth() {
  const { session } = await getServerSession()
  if (!session) {
    redirect('/login')
  }
  return session
}
```

#### Step 6.2: Update All API Routes
- Use `requireAuth()` or `getServerSession()`
- Include `user_id` in queries
- Validate ownership before operations

---

### 7. Update Chat Interface

#### Step 7.1: Get User Session
- Use `useAuth()` hook
- Pass `user_id` when creating sessions
- Only show user's own sessions

---

## 🚀 Implementation Order

1. ✅ **Database Schema** - Add `user_id` columns
2. ✅ **RLS Policies** - Enable security
3. ✅ **Auth Helper Functions** - Server-side auth
4. ✅ **Update Supabase Functions** - Include user_id
5. ✅ **Update API Routes** - Check auth & user_id
6. ✅ **Update Chat Interface** - Use authenticated user
7. ✅ **Update Header** - Show user info
8. ✅ **Middleware** - Protect routes

---

## ⚠️ Important Notes

1. **Backward Compatibility**: Existing sessions tanpa `user_id` perlu di-handle
   - Bisa set `user_id = NULL` untuk anonymous sessions
   - Atau migrate existing data

2. **Migration Strategy**:
   - Bisa allow `user_id` nullable untuk backward compatibility
   - Or require login untuk semua new features

3. **Testing**:
   - Test dengan user yang berbeda
   - Test RLS policies
   - Test logout/login flow

---

## 📝 SQL Migration Script

Create file: `MIGRATE_ADD_USER_ID.sql`

```sql
-- Step 1: Add user_id columns
ALTER TABLE chat_sessions 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE chat_files 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS chat_sessions_user_id_idx ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS chat_files_user_id_idx ON chat_files(user_id);

-- Step 3: Enable RLS
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_files ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view own sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can view own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can view own files" ON chat_files;
DROP POLICY IF EXISTS "Users can insert own files" ON chat_files;
DROP POLICY IF EXISTS "Users can delete own files" ON chat_files;

-- Step 5: Create new policies (see section 2 above)
-- ... (copy policies from section 2)

-- Step 6: Optional - Allow anonymous access temporarily
-- ALTER TABLE chat_sessions ALTER COLUMN user_id DROP NOT NULL;
```

---

## 🎯 Expected Outcome

Setelah implementasi:
- ✅ Users harus login untuk akses chat
- ✅ Users hanya lihat sessions mereka sendiri
- ✅ RLS policies protect data di database level
- ✅ Header show user info & logout button
- ✅ Secure API routes dengan auth checks

---

**Ready to implement?** Let's start! 🚀

