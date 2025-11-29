# 📎 File Upload & Recall Setup

Dokumentasi untuk setup file upload dan recall seperti Gemini/ChatGPT.

## 🗄️ Database Schema

Jalankan SQL berikut di Supabase SQL Editor:

```sql
-- Tabel untuk menyimpan metadata file
create table chat_files (
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

create index chat_files_session_id_idx on chat_files (session_id);
create index chat_files_message_id_idx on chat_files (message_id);

-- Enable RLS
alter table chat_files enable row level security;

-- Policy untuk anon: bisa insert dan select file mereka sendiri
create policy "Users can insert their own files"
  on chat_files for insert
  to anon
  with check (true);

create policy "Users can view files in their sessions"
  on chat_files for select
  to anon
  using (true);
```

## 📦 Supabase Storage Setup (WAJIB!)

### ⚠️ Langkah 1: Create Bucket (PENTING!)

1. **Buka Supabase Dashboard:**
   - Login ke https://supabase.com/dashboard
   - Pilih project Anda
   - Klik menu **Storage** di sidebar kiri

2. **Create New Bucket:**
   - Klik tombol **"New bucket"** atau **"Create bucket"**
   - **Name:** `chat-files` (harus exact, case-sensitive!)
   - **Public bucket:** ✅ **YES** (centang ini agar file bisa diakses via URL public)
   - **File size limit:** 10MB (atau sesuai kebutuhan)
   - **Allowed MIME types:** (opsional, bisa dikosongkan untuk allow semua)
     ```
     image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/*,text/csv
     ```
   - Klik **"Create bucket"**

3. **Verifikasi Bucket:**
   - Pastikan bucket `chat-files` muncul di list
   - Status harus **Public** (bukan Private)

### ⚠️ Langkah 2: Set Storage Policies (PENTING!)

Jalankan SQL berikut di **Supabase SQL Editor**:

```sql
-- Policy untuk upload file (anon users bisa upload)
create policy "Users can upload files"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'chat-files');

-- Policy untuk read file (anon users bisa baca)
create policy "Users can read files"
  on storage.objects for select
  to anon
  using (bucket_id = 'chat-files');

-- Policy untuk update file (opsional, jika perlu)
create policy "Users can update their files"
  on storage.objects for update
  to anon
  using (bucket_id = 'chat-files');

-- Policy untuk delete file (opsional, jika perlu)
create policy "Users can delete their files"
  on storage.objects for delete
  to anon
  using (bucket_id = 'chat-files');
```

**Catatan:** Jika policy sudah ada, Anda akan mendapat error. Hapus policy lama dulu atau gunakan `CREATE POLICY IF NOT EXISTS` (jika didukung).

### ✅ Verifikasi Setup

Setelah setup, test dengan:
1. Upload file dari web interface
2. Cek Supabase Dashboard → Storage → chat-files
3. File harus muncul di folder `chat-files/{sessionId}/`

Jika masih error, cek:
- ✅ Bucket name exact: `chat-files` (bukan `Chat-Files` atau `chat_files`)
- ✅ Bucket status: **Public** (bukan Private)
- ✅ Storage policies sudah dibuat
- ✅ Environment variables `SUPABASE_URL` dan `SUPABASE_ANON_KEY` sudah benar
   ```sql
   -- Policy untuk upload file
   create policy "Users can upload files"
     on storage.objects for insert
     to anon
     with check (bucket_id = 'chat-files');

   -- Policy untuk read file
   create policy "Users can read files"
     on storage.objects for select
     to anon
     using (bucket_id = 'chat-files');
   ```

## 🔧 N8N Workflow Setup

### ⚠️ Perubahan yang Diperlukan di N8N

**TIDAK PERLU PERUBAHAN BESAR!** N8N hanya perlu menerima data file (URL, metadata), bukan file langsung.

### Update Webhook untuk Handle Files

Di workflow N8N, pastikan webhook bisa menerima file data:

**Input Format (sudah otomatis dari Next.js):**
```json
{
  "message": "Pertanyaan user",
  "sessionId": "uuid-session-id",
  "files": [
    {
      "id": "file-uuid",
      "fileName": "document.pdf",
      "fileType": "application/pdf",
      "fileSize": 123456,
      "url": "https://supabase.co/storage/v1/object/public/chat-files/...",
      "metadata": {}
    }
  ]
}
```

**Catatan:**
- Field `files` adalah **optional** (hanya ada jika user upload file)
- Jika tidak ada file, `files` akan `undefined` atau tidak ada di payload
- N8N webhook sudah otomatis menerima payload ini, tidak perlu konfigurasi tambahan

### AI Agent Configuration (UPDATE SYSTEM PROMPT)

Di AI Agent node, **tambahkan** instruksi untuk handle files di System Message:

```
Kamu adalah AURA (AI RAG UII), asisten virtual resmi Universitas Islam Indonesia (UII).

FITUR FILE (PENTING!):
- Jika user mengirim file, data file akan ada di payload dengan format:
  {
    "message": "pertanyaan user",
    "files": [
      {
        "id": "file-id",
        "fileName": "nama-file.pdf",
        "fileType": "application/pdf",
        "url": "https://supabase.co/storage/.../file.pdf",
        "metadata": {}
      }
    ]
  }

- Jika ada field "files" di payload, berarti user mengirim file
- File bisa berupa gambar, PDF, dokumen, dll
- Gunakan URL file (files[].url) untuk mengakses konten file
- Untuk gambar: gunakan image analysis tool dengan URL dari files[].url
- Untuk dokumen: gunakan document parsing tool dengan URL dari files[].url
- Jika user bertanya "kok gitu? emg kamu tau darimana?" atau "coba file tadi kirim lg kesini", kamu bisa refer ke file yang sudah diupload sebelumnya
- Gunakan Simple Memory untuk mengingat file yang sudah diupload di session yang sama

CONTOH:
User upload file "document.pdf" dan tanya: "Apa isi file ini?"
→ Kamu bisa akses file via URL di files[0].url, parse isinya, dan jawab berdasarkan konten file.

User tanya: "Kok gitu? Emg kamu tau darimana?"
→ Kamu bisa jawab: "Saya tahu dari file 'document.pdf' yang Anda upload tadi. Di file tersebut disebutkan bahwa..."

INGAT: 
- Field "files" adalah array, bisa ada multiple files
- File URL adalah public URL dari Supabase Storage
- Kamu bisa recall file yang sudah diupload di session yang sama melalui Simple Memory
```

### Tools untuk File Processing

1. **Image Analysis Tool:**
   - Gunakan node "Analyze image" (OpenAI Vision)
   - Input: URL gambar dari `files[].url`

2. **Document Parser:**
   - Gunakan node untuk parse PDF/DOCX
   - Extract text dari dokumen
   - Simpan ke context untuk recall

3. **File Memory:**
   - Simpan file metadata di Simple Memory
   - Format: `[File: document.pdf - uploaded at 2025-01-15]`

## 🎯 Usage Examples

### User Upload File
1. User klik tombol 📎 (paperclip)
2. Pilih file (gambar, PDF, dll)
3. File muncul di preview
4. User ketik pesan + kirim
5. File diupload ke Supabase Storage
6. Metadata disimpan ke `chat_files`
7. File data dikirim ke N8N bersama message

### AI Recall File
User: "Kok gitu? Emg kamu tau darimana?"
AI: "Saya tahu dari file yang Anda upload tadi, yaitu 'document.pdf'. Di file tersebut disebutkan bahwa..."

User: "Coba file tadi kirim lagi kesini"
AI: "File yang Anda maksud adalah 'document.pdf' yang sudah diupload sebelumnya. Berikut link untuk mengaksesnya: [URL]"

## 🔍 Testing

1. **Upload file:**
   - Klik tombol 📎
   - Pilih file (max 10MB)
   - File muncul di preview
   - Ketik pesan dan kirim

2. **Check database:**
   ```sql
   select * from chat_files order by created_at desc limit 5;
   ```

3. **Check storage:**
   - Buka Supabase Dashboard → Storage → chat-files
   - File harus ada di folder `chat-files/{sessionId}/`

4. **Test recall:**
   - Upload file
   - Tanya: "Apa isi file tadi?"
   - AI harus bisa refer ke file

## ⚠️ Troubleshooting

### File tidak terupload
- Cek: Supabase Storage bucket sudah dibuat?
- Cek: Storage policies sudah di-set?
- Cek: File size tidak melebihi limit?

### File tidak muncul di chat
- Cek: `chat_files` table sudah dibuat?
- Cek: RLS policies sudah di-set?
- Cek: Browser console untuk error

### AI tidak bisa recall file
- Cek: File data dikirim ke N8N?
- Cek: AI Agent sudah dikonfigurasi untuk handle files?
- Cek: Simple Memory menyimpan file metadata?

