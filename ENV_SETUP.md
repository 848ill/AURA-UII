# 🔧 Environment Variables Setup

## ⚠️ Error: Supabase client not configured

Jika Anda mendapat error ini:
```
Supabase client is not configured for the browser. 
Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
```

Berarti environment variables belum dikonfigurasi.

---

## 📋 Langkah Setup

### Step 1: Buat File `.env.local`

Di root folder project, buat file baru bernama `.env.local`

```bash
# Di terminal
touch .env.local
```

**ATAU** copy dari `.env.example`:
```bash
cp .env.example .env.local
```

---

### Step 2: Dapatkan Supabase Credentials

1. **Login ke Supabase Dashboard**
   - Buka: https://supabase.com/dashboard
   - Pilih project Anda

2. **Buka Settings → API**
   - Klik menu **Settings** (icon gear) di sidebar kiri
   - Pilih **API**

3. **Copy Credentials**
   - **Project URL** → ini adalah `SUPABASE_URL`
   - **anon public** key → ini adalah `SUPABASE_ANON_KEY`

---

### Step 3: Isi `.env.local`

Buka file `.env.local` dan isi dengan:

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Next.js Public Environment Variables (REQUIRED untuk browser)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# n8n Webhook Configuration
N8N_WEBHOOK_BASE_URL=https://your-ngrok-url.ngrok-free.dev
```

**⚠️ PENTING:**
- `NEXT_PUBLIC_*` variables **HARUS** sama dengan non-public variables
- Ini diperlukan karena Next.js membutuhkan public variables untuk client-side code
- Variabel `NEXT_PUBLIC_*` akan di-expose ke browser (aman untuk anon key)

---

### Step 4: Restart Dev Server

Setelah membuat/update `.env.local`:

1. **Stop dev server** (Ctrl+C)
2. **Start lagi:**
   ```bash
   npm run dev
   ```

**⚠️ Next.js hanya membaca `.env.local` saat startup!**

---

## ✅ Verifikasi

Setelah setup, coba:

1. **Login/Signup** - seharusnya tidak ada error lagi
2. **Check browser console** - tidak ada error Supabase client

---

## 🔍 Troubleshooting

### Error masih muncul setelah setup?

1. **Pastikan file bernama `.env.local` (dengan titik di depan)**
   - Bukan `env.local`
   - Bukan `.env`
   - Tapi `.env.local`

2. **Pastikan sudah restart dev server**
   ```bash
   # Stop dengan Ctrl+C, lalu:
   npm run dev
   ```

3. **Check variabel sudah benar:**
   ```bash
   # Di terminal, cek:
   cat .env.local
   ```
   
   Pastikan ada:
   - `NEXT_PUBLIC_SUPABASE_URL=...`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`

4. **Pastikan URL dan Key benar:**
   - URL format: `https://xxxxx.supabase.co`
   - Key format: `eyJhbGci...` (long string)
   - Tidak ada space atau quote di awal/akhir

5. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

---

## 📝 Contoh `.env.local` Lengkap

```env
# ============================================
# Supabase Configuration
# ============================================
# Get from: Supabase Dashboard → Settings → API

SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ============================================
# Next.js Public Variables (REQUIRED!)
# ============================================
# Same values as above, but with NEXT_PUBLIC_ prefix

NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ============================================
# n8n Webhook Configuration
# ============================================

N8N_WEBHOOK_BASE_URL=https://your-ngrok-url.ngrok-free.dev
```

---

## 🛡️ Security Notes

- ✅ **`.env.local` sudah di-ignore oleh git** (tidak akan ter-commit)
- ✅ **Anon key aman untuk di-expose ke browser** (it's public by design)
- ⚠️ **Jangan commit `.env.local` ke git!**
- ⚠️ **Jangan share anon key di public places** (meskipun aman, tetap best practice)

---

## 🆘 Masih Error?

1. Check file `.env.local` ada dan berisi variabel yang benar
2. Restart dev server
3. Clear `.next` folder dan restart
4. Check Supabase Dashboard → Settings → API untuk credentials yang benar

Jika masih error, cek:
- Format URL (harus `https://...`)
- Format Key (harus `eyJ...`)
- Tidak ada typo di nama variabel

---

**Setelah setup `.env.local`, restart dev server dan coba lagi!** 🚀

