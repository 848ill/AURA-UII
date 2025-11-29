# 🚀 Quick Setup: Supabase Storage untuk File Upload

## ⚠️ Error: "Bucket not found"

Jika Anda mendapat error ini, berarti bucket `chat-files` belum dibuat di Supabase.

## ✅ Solusi Cepat (5 menit)

### Step 1: Buat Bucket di Supabase Dashboard

1. Buka https://supabase.com/dashboard
2. Pilih project Anda
3. Klik **Storage** di sidebar kiri
4. Klik **"New bucket"** atau **"Create bucket"**
5. Isi form:
   - **Name:** `chat-files` ⚠️ **HARUS EXACT!**
   - **Public bucket:** ✅ **Centang/Enable** (PENTING!)
   - **File size limit:** 10MB (atau sesuai kebutuhan)
6. Klik **"Create bucket"**

### Step 2: Set Storage Policies

1. Buka **SQL Editor** di Supabase Dashboard
2. Copy-paste SQL berikut:

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

3. Klik **Run** atau **Execute**

### Step 3: Verifikasi

1. Refresh halaman web Anda
2. Coba upload file lagi
3. Jika masih error, cek:
   - ✅ Bucket name: `chat-files` (bukan `Chat-Files` atau `chat_files`)
   - ✅ Bucket status: **Public** (bukan Private)
   - ✅ Policies sudah dibuat
   - ✅ Environment variables sudah benar

## 🎯 Setelah Setup

File upload akan bekerja dan file akan tersimpan di:
- **Storage:** `chat-files/{sessionId}/{filename}`
- **Database:** Tabel `chat_files` (jika sudah dibuat)

## 📝 Catatan

- Bucket harus **Public** agar file bisa diakses via URL
- File size limit default: 10MB per file
- File akan otomatis terorganisir per session

