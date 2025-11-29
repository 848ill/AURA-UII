# ⚡ Quick Deploy Guide

## 🚀 Push ke GitHub (5 menit)

### Via Terminal:

```bash
# Push ke GitHub
git push -u origin main
```

**Jika diminta login:**
- Username: GitHub username
- Password: **Personal Access Token** (bukan password!)

**Cara buat token:**
1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token → Pilih scope `repo`
3. Copy token → Gunakan sebagai password

---

## 🌐 Deploy ke Vercel (10 menit)

### 1. Import Project
- Buka https://vercel.com
- Sign in dengan GitHub
- Import `848ill/AURA-UII`

### 2. Add Environment Variables

Copy dari `.env.local` kamu:

```bash
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
N8N_WEBHOOK_BASE_URL=...
```

**⚠️ Penting:** Tambahkan di Vercel → Settings → Environment Variables

### 3. Deploy!

Klik **"Deploy"** → Tunggu build selesai → ✅ Done!

---

## ✅ Test

Buka production URL dan test:
- Login/Signup ✅
- Chat ✅
- File upload ✅

---

**Detail lengkap ada di `DEPLOYMENT_GUIDE.md`** 📚

