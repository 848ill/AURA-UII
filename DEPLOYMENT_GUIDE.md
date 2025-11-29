# 🚀 Deployment Guide: AURA UII ke Vercel

**Repository:** https://github.com/848ill/AURA-UII.git

---

## 📋 Step 1: Push Code ke GitHub

Code sudah siap di commit. Sekarang push ke GitHub:

### Option A: Via Terminal (Recommended)

```bash
# Push ke GitHub (akan diminta login)
git push -u origin main
```

**Jika diminta credentials:**
- Username: GitHub username kamu
- Password: **Personal Access Token** (bukan password biasa)

**Cara buat Personal Access Token:**
1. Buka GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Beri nama: `AURA-UII-Deploy`
4. Pilih scope: `repo` (full control)
5. Copy token dan gunakan sebagai password saat push

### Option B: Via GitHub Desktop

1. Install [GitHub Desktop](https://desktop.github.com/)
2. File → Add Local Repository → Pilih folder `/Users/billyhanif/AURAUII`
3. Publish repository → Pilih `848ill/AURA-UII`
4. Push

### Option C: Via VS Code

1. Buka VS Code di folder project
2. Source Control panel (Ctrl+Shift+G)
3. Klik "..." → Push
4. Login dengan GitHub credentials

---

## 🌐 Step 2: Setup Vercel

### 2.1. Import Project ke Vercel

1. Buka https://vercel.com
2. Sign in dengan GitHub account
3. Klik **"Add New..."** → **"Project"**
4. Import Git Repository:
   - Pilih `848ill/AURA-UII`
   - Klik **"Import"**

### 2.2. Configure Project Settings

**Framework Preset:** Next.js (auto-detect)

**Root Directory:** `./` (default)

**Build Command:** (auto-detect, biasanya `npm run build`)

**Output Directory:** (auto-detect)

**Install Command:** `npm install`

---

## 🔐 Step 3: Setup Environment Variables di Vercel

PENTING! Tambahkan semua environment variables ini di Vercel:

### 3.1. Di Vercel Dashboard

1. Setelah import project, klik **"Environment Variables"**
2. Tambahkan satu per satu:

### 3.2. Supabase Variables

```bash
SUPABASE_URL=https://zfrzwychuigqybtuaoco.supabase.co
SUPABASE_ANON_KEY=[your-anon-key]
NEXT_PUBLIC_SUPABASE_URL=https://zfrzwychuigqybtuaoco.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

**Catatan:** `NEXT_PUBLIC_*` variables HARUS ada karena digunakan di client-side!

### 3.3. n8n Webhook Variable

```bash
N8N_WEBHOOK_BASE_URL=https://your-ngrok-url.ngrok-free.dev
```

**Atau jika sudah ada production URL:**
```bash
N8N_WEBHOOK_BASE_URL=https://your-production-n8n-url.com
```

### 3.4. Semua Environment Variables

Buka file `.env.local` kamu dan copy semua variables ke Vercel:

```bash
# Contoh (ganti dengan values kamu):
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
N8N_WEBHOOK_BASE_URL=...
```

**⚠️ IMPORTANT:**
- Jangan commit `.env.local` ke GitHub (sudah di `.gitignore`)
- Pastikan semua variables dengan prefix `NEXT_PUBLIC_` ditambahkan
- Set untuk semua environments: Production, Preview, Development

---

## 🏗️ Step 4: Deploy!

### 4.1. Deploy otomatis

1. Setelah setup environment variables, klik **"Deploy"**
2. Vercel akan:
   - Install dependencies
   - Build project
   - Deploy ke production URL

### 4.2. Monitor Deployment

- Progress bisa dilihat di Vercel dashboard
- Jika ada error, cek logs di Vercel dashboard
- Build time biasanya 2-5 menit

---

## ✅ Step 5: Post-Deployment Checklist

### 5.1. Test Production Site

1. Buka production URL (misalnya: `aura-uii.vercel.app`)
2. Test semua fitur:
   - ✅ Login/Signup
   - ✅ Create new chat
   - ✅ Send message
   - ✅ File upload
   - ✅ Search sessions
   - ✅ Mobile view

### 5.2. Common Issues & Fixes

#### Issue: "Supabase client is not configured"
**Fix:** Pastikan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` sudah di-set di Vercel

#### Issue: "Failed to load sessions"
**Fix:** 
- Cek Supabase RLS policies sudah enable
- Pastikan user sudah login
- Cek browser console untuk error details

#### Issue: "N8N webhook error"
**Fix:**
- Pastikan `N8N_WEBHOOK_BASE_URL` sudah benar
- Pastikan n8n workflow sudah aktif
- Cek ngrok URL masih valid (jika pakai ngrok)

#### Issue: "File upload failed"
**Fix:**
- Cek Supabase Storage bucket sudah dibuat (`chat-files`)
- Cek storage policies sudah setup
- Pastikan `NEXT_PUBLIC_SUPABASE_ANON_KEY` sudah di-set

---

## 🔄 Step 6: Continuous Deployment

Setelah setup pertama, setiap push ke `main` branch akan otomatis:
- Trigger new deployment
- Build & deploy ke production
- Update production URL dengan versi terbaru

**Manual Redeploy:**
- Vercel Dashboard → Deployments → Klik "..." → Redeploy

---

## 📝 Step 7: Custom Domain (Optional)

1. Vercel Dashboard → Settings → Domains
2. Add domain: `aura.uii.ac.id` (atau domain kamu)
3. Follow DNS setup instructions
4. Wait for DNS propagation (biasanya 5-30 menit)

---

## 🛠️ Troubleshooting

### Build Fails

**Check:**
1. Build logs di Vercel dashboard
2. TypeScript errors: `npm run build` di local
3. Missing dependencies: cek `package.json`

### Runtime Errors

**Check:**
1. Browser console untuk client-side errors
2. Vercel function logs untuk API errors
3. Environment variables sudah benar

### Environment Variables Not Working

**Fix:**
1. Redeploy setelah add environment variables
2. Pastikan format benar (no spaces, no quotes)
3. Restart deployment

---

## 📚 Quick Reference

### Repository
- **GitHub:** https://github.com/848ill/AURA-UII.git
- **Vercel:** (akan muncul setelah import)

### Important URLs
- **Production:** `https://aura-uii.vercel.app` (contoh)
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Vercel Dashboard:** https://vercel.com/dashboard

### Support Files
- Environment setup: `ENV_SETUP.md`
- Auth setup: `AUTH_SETUP_INSTRUCTIONS.md`
- Storage setup: `QUICK_SETUP_STORAGE.md`

---

## ✅ Deployment Checklist

- [ ] Code pushed ke GitHub
- [ ] Project imported ke Vercel
- [ ] Environment variables di-set
- [ ] First deployment successful
- [ ] Login/Signup working
- [ ] Chat interface working
- [ ] File upload working
- [ ] Mobile view tested
- [ ] Production URL shared

---

**Selamat! Aplikasi kamu sudah live! 🎉**

Jika ada masalah, cek logs di Vercel dashboard atau hubungi support.

