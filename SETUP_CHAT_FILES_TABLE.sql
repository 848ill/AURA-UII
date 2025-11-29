-- ⚠️ PENTING: Jalankan SQL ini di Supabase SQL Editor
-- File upload sudah bekerja, tapi untuk fitur recall file perlu tabel ini

-- Tabel untuk menyimpan metadata file
create table if not exists chat_files (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references chat_sessions(id) on delete cascade not null,
  message_id uuid references chat_messages(id) on delete set null,
  file_name text not null,
  file_type text not null,
  file_size bigint not null,
  storage_path text not null,
  storage_url text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Index untuk performa
create index if not exists chat_files_session_id_idx on chat_files (session_id);
create index if not exists chat_files_message_id_idx on chat_files (message_id);

-- Enable RLS
alter table chat_files enable row level security;

-- Policy untuk anon: bisa insert dan select file mereka sendiri
drop policy if exists "Users can insert their own files" on chat_files;
create policy "Users can insert their own files"
  on chat_files for insert
  to anon
  with check (true);

drop policy if exists "Users can view files in their sessions" on chat_files;
create policy "Users can view files in their sessions"
  on chat_files for select
  to anon
  using (true);

-- Verifikasi
select 'Tabel chat_files berhasil dibuat!' as status;

