-- =====================================================
-- CLEANUP ORPHANED SESSIONS (Sessions without user_id)
-- =====================================================
-- Run this script in Supabase SQL Editor to remove
-- sessions that don't belong to any user

-- Option 1: Delete all sessions without user_id (RECOMMENDED)
DELETE FROM chat_sessions 
WHERE user_id IS NULL;

-- Option 2: Check how many orphaned sessions exist first
-- SELECT COUNT(*) FROM chat_sessions WHERE user_id IS NULL;

-- Option 3: Check sessions and their user_ids
-- SELECT id, title, user_id, created_at 
-- FROM chat_sessions 
-- ORDER BY created_at DESC 
-- LIMIT 20;

-- =====================================================
-- IMPORTANT:
-- - Sessions without user_id are "orphaned" and appear to all users
-- - After running this cleanup, each user will only see their own sessions
-- - Messages linked to deleted sessions will be automatically deleted (CASCADE)
-- =====================================================

