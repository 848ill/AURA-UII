# ⚡ QUICK FIX: Environment Variables Error

## 🐛 Error yang Anda Alami

```
Supabase client is not configured for the browser. 
Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
```

## ✅ Solusi Cepat (5 menit)

### Step 1: Buat File `.env.local`

Buka terminal di folder project Anda, lalu jalankan:

```bash
cd /Users/billyhanif/AURAUII
touch .env.local
```

### Step 2: Buka Supabase Dashboard

1. Buka: https://supabase.com/dashboard
2. Pilih project Anda
3. Klik **Settings** (icon gear ⚙️) di sidebar kiri
4. Klik **API** di menu Settings

### Step 3: Copy Credentials

Di halaman API, Anda akan melihat:
- **Project URL** → Copy ini
- **anon public** key → Copy ini (yang panjang, dimulai dengan `eyJ...`)

### Step 4: Isi `.env.local`

Buka file `.env.local` yang baru dibuat, lalu paste ini (ganti dengan credentials Anda):

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Next.js Public Variables (REQUIRED untuk browser)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# n8n Webhook (ganti dengan URL ngrok Anda)
N8N_WEBHOOK_BASE_URL=https://your-ngrok-url.ngrok-free.dev
```

**⚠️ PENTING:**
- Ganti `xxxxx.supabase.co` dengan URL project Anda
- Ganti `eyJ...` dengan anon key Anda (yang panjang)
- `NEXT_PUBLIC_*` harus **sama persis** dengan yang di atas (tanpa prefix)

### Step 5: Restart Dev Server

**WAJIB:** Next.js hanya membaca `.env.local` saat startup!

1. Stop dev server (tekan `Ctrl+C` di terminal)
2. Start lagi:
   ```bash
   npm run dev
   ```

## ✅ Selesai!

Setelah restart, error seharusnya hilang. Coba signup/login lagi!

---

## 📝 Contoh `.env.local` yang Benar

```env
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

N8N_WEBHOOK_BASE_URL=https://carl-unnoisy-matha.ngrok-free.dev
```

---

## 🔍 Checklist

Pastikan:
- [ ] File bernama `.env.local` (dengan titik di depan)
- [ ] Ada 5 variabel (SUPABASE_URL, SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, N8N_WEBHOOK_BASE_URL)
- [ ] URL format: `https://xxxxx.supabase.co`
- [ ] Key format: `eyJ...` (string panjang)
- [ ] Tidak ada space atau quote di awal/akhir value
- [ ] Sudah restart dev server setelah membuat file

---

**Jika masih error setelah ini, cek file `ENV_SETUP.md` untuk troubleshooting lengkap!**

