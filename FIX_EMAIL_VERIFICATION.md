# 🔧 Fix: Email Not Confirmed Error

## 🐛 Error yang Anda Alami

```
Failed to load resource: 400
Email not confirmed
```

Ini berarti Supabase email verification sedang **aktif**. User harus konfirmasi email dulu sebelum bisa login.

---

## ✅ Solusi (Pilih Salah Satu)

### Opsi 1: Disable Email Verification (Recommended untuk Development)

**Untuk development/testing, lebih mudah disable email verification:**

1. **Buka Supabase Dashboard**
   - https://supabase.com/dashboard
   - Pilih project Anda

2. **Buka Authentication Settings**
   - Klik **Authentication** di sidebar kiri
   - Klik **Providers** tab
   - Scroll ke bawah, cari **Email** section

3. **Disable Email Confirmation**
   - Uncheck/disable: **"Enable email confirmations"**
   - Atau cari di **Settings** → **Auth** → **Email Auth**
   - Toggle OFF: **"Enable email confirmations"**

4. **Save Settings**

5. **Test Lagi:**
   - User yang sudah signup bisa langsung login
   - User baru juga bisa langsung login tanpa konfirmasi email

---

### Opsi 2: Konfirmasi Email (Untuk Production)

**Jika ingin tetap menggunakan email verification (recommended untuk production):**

#### A. Check Email Inbox
- Buka email yang digunakan saat signup
- Cari email dari Supabase (bisa di spam folder)
- Klik link konfirmasi di email tersebut

#### B. Konfirmasi Manual via Supabase Dashboard
1. Buka Supabase Dashboard → **Authentication** → **Users**
2. Cari user yang baru signup
3. Klik **..."** (three dots) → **Send confirmation email**
4. Atau langsung set user sebagai confirmed

#### C. Setup Email Templates (Optional)
Jika email tidak sampai:
1. Supabase Dashboard → **Authentication** → **Email Templates**
2. Check template **"Confirm signup"**
3. Pastikan email template aktif

---

## 🎯 Recommended Setup untuk Development

**Untuk development/testing, saya sarankan:**

### Disable Email Verification
✅ User bisa langsung login setelah signup  
✅ Tidak perlu check email  
✅ Development lebih cepat  

### Setup Email di Production
✅ Enable email verification  
✅ Setup custom email template  
✅ Setup SMTP (optional, untuk custom domain)  

---

## 📝 Langkah Detail: Disable Email Verification

### Via Supabase Dashboard UI:

1. Login ke: https://supabase.com/dashboard
2. Pilih project: `zfrzwychuigqybtuaoco`
3. Klik **Authentication** (di sidebar kiri)
4. Klik tab **Providers**
5. Scroll ke **Email** section
6. Cari setting: **"Confirm email"** atau **"Enable email confirmations"**
7. Toggle OFF atau uncheck
8. Click **Save**

### Via Supabase SQL (Alternatif):

Jika tidak menemukan setting di UI, jalankan SQL ini di Supabase SQL Editor:

```sql
-- Disable email confirmation requirement
UPDATE auth.config 
SET enable_signup = true,
    enable_confirmations = false;
```

**Note:** SQL ini mungkin tidak bekerja untuk semua project. Lebih baik lewat UI.

---

## 🔍 Cek Status Email Verification

Setelah disable, test:

1. **Signup user baru** → Harus langsung bisa login
2. **Login dengan user yang sudah ada** → Harus langsung masuk

Jika masih error, kemungkinan:
- Setting belum di-save
- Cache browser → Clear cache atau incognito mode
- User sudah dibuat dengan email verification → Delete user dan buat baru

---

## ✅ Checklist

- [ ] Buka Supabase Dashboard
- [ ] Authentication → Providers → Email
- [ ] Disable "Enable email confirmations"
- [ ] Save settings
- [ ] Test login dengan user baru
- [ ] Test signup → langsung bisa login

---

**Setelah disable email verification, coba login lagi!** 🚀

