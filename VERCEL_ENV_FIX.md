# 🔧 Fix Environment Variables di Vercel

## ⚠️ Masalah yang Ditemukan

URL Supabase terpotong! Harus ditambahkan `.co` di akhir.

---

## ✅ Perbaikan yang Diperlukan

### Edit di Vercel Environment Variables:

1. **SUPABASE_URL**
   - ❌ Salah: `https://zfrzwychuigqybtuaoco.supabase`
   - ✅ Benar: `https://zfrzwychuigqybtuaoco.supabase.co`

2. **NEXT_PUBLIC_SUPABASE_URL**
   - ❌ Salah: `https://zfrzwychuigqybtuaoco.supabase`
   - ✅ Benar: `https://zfrzwychuigqybtuaoco.supabase.co`

---

## 📋 Checklist Final

Setelah diperbaiki, pastikan:

- [x] `SUPABASE_URL` = `https://zfrzwychuigqybtuaoco.supabase.co`
- [x] `SUPABASE_ANON_KEY` = `eyJhbGci...` (lengkap, tidak terpotong)
- [x] `NEXT_PUBLIC_SUPABASE_URL` = `https://zfrzwychuigqybtuaoco.supabase.co`
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGci...` (lengkap, sama dengan di atas)
- [x] `N8N_WEBHOOK_BASE_URL` = `https://carl-unnoisy-matha.ngrok-free.dev`

**Set untuk:** Production, Preview, Development (semua environments)

---

## 🚀 Setelah Fix, Deploy!

Klik **"Deploy"** setelah semua variables sudah benar! 🎉

