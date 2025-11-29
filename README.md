<div align="center">

# AURA UII Ops Assistant
Light-mode Next.js 14 app for orchestrating Supabase + n8n workflows with GPT-style chat history.

</div>

## Tech Stack
- Next.js 14 App Router + TypeScript
- Supabase (Postgres + Realtime)
- n8n webhook proxy (Ngrok-friendly)
- shadcn/ui + Tailwind for styling

## Quick Start
1. **Install deps**
   ```bash
   npm install
   npx shadcn-ui@latest add button card input table
   ```
2. **Environment**
   Create `.env.local`:
   ```
   SUPABASE_URL=...
   SUPABASE_ANON_KEY=...
   NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
   N8N_WEBHOOK_BASE_URL=https://<your-ngrok-host>
   ```
   The `NEXT_PUBLIC_*` keys enable browser Realtime subscriptions while keeping server helpers on the private vars.
3. **Run dev server**
   ```bash
   npm run dev
   ```

## Supabase Schema
Run once inside Supabase SQL editor:
```sql
create table chat_sessions (
  id uuid primary key default gen_random_uuid(),
  title text,
  created_at timestamptz default now()
);

create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references chat_sessions(id) on delete cascade,
  role text check (role in ('user','assistant')) not null,
  content text not null,
  created_at timestamptz default now()
);

create index chat_messages_session_id_created_at_idx
  on chat_messages (session_id, created_at);
```
Enable RLS and allow the `anon` key to `select`/`insert` on both tables.

## Chat Experience
- **Persistent sessions**: server loads latest sessions + history, client hydrates instantly.
- **Rename/Delete**: inline editing and confirmation buttons keep history tidy.
- **Realtime sync**: Supabase Realtime streams inserts into the active session so concurrent tabs stay in sync.
- **Typing animation**: responses type out smoothly using `lib/typingeffect`.

## n8n Proxy
- `/api/n8n/trigger` forwards POST payloads to your n8n webhook.
- Includes Ngrok interstitial bypass + content-type checks.
- Hook is consumed via `useN8nTrigger`, and ChatInterface persists responses automatically.

## Deployment Tips
- Set the same env vars on Vercel (remember to expose `NEXT_PUBLIC_*` versions).
- Keep n8n hosted separately (VPS / PaaS); update `N8N_WEBHOOK_BASE_URL` when Ngrok URL rotates.
- Re-run `npm run build` locally before deploying to spot type/lint errors early.

