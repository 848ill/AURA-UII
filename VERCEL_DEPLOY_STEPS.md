# 🚀 Next: Deploy ke Vercel

## ✅ Code sudah di GitHub!

Repository: https://github.com/848ill/AURA-UII

---

## 🌐 Deploy ke Vercel (5 langkah mudah)

### Step 1: Buka Vercel
👉 https://vercel.com/new

### Step 2: Sign In dengan GitHub
- Klik **"Continue with GitHub"**
- Authorize Vercel

### Step 3: Import Project
- Pilih repository: **`848ill/AURA-UII`**
- Klik **"Import"**

### Step 4: Setup Environment Variables

**⚠️ PENTING:** Copy semua dari `.env.local` kamu!

Klik **"Environment Variables"** dan tambahkan:

```
SUPABASE_URL=https://zfrzwychuigqybtuaoco.supabase.co
SUPABASE_ANON_KEY=[your-anon-key-dari-env-local]
NEXT_PUBLIC_SUPABASE_URL=https://zfrzwychuigqybtuaoco.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key-dari-env-local]
N8N_WEBHOOK_BASE_URL=[your-ngrok-url-atau-production-n8n-url]
```

**Pastikan:**
- ✅ Semua variables dengan `NEXT_PUBLIC_` prefix ditambahkan
- ✅ Set untuk semua environments: Production, Preview, Development
- ✅ Values sama persis dengan `.env.local` kamu

### Step 5: Deploy!

1. Klik **"Deploy"** button
2. Tunggu build (2-5 menit)
3. ✅ Done! Kamu akan dapat production URL seperti: `aura-uii.vercel.app`

---

## 🎉 Selesai!

Setelah deploy, test:
- ✅ Login/Signup
- ✅ Chat interface
- ✅ File upload
- ✅ Mobile view

---

## 📚 Need Help?

Lihat `DEPLOYMENT_GUIDE.md` untuk detail lengkap!

