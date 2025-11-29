# 🔧 Fix: Branch False Tidak Jalan - Hanya Bisa Handle File

## ⚠️ Masalah
- Branch True (dengan file) jalan dengan baik
- Branch False (teks saja) tidak jalan
- Hanya bisa baca kalau kirim foto/file, tidak bisa handle teks saja

## 🔍 Penyebab
1. IF condition selalu return True (meskipun tidak ada file)
2. Branch False tidak terhubung dengan benar
3. Condition tidak bisa detect ketika tidak ada file

## ✅ Solusi: Fix IF Condition

### Step 1: Pastikan IF Condition Benar

**Condition harus return False ketika tidak ada file:**

```
Value1: {{ $json.files?.length > 0 }}
Operator: is true
Value2: (kosongkan)
```

**Penjelasan:**
- Return True hanya jika `files.length > 0` (ada file)
- Return False jika `files.length = 0` atau files tidak ada (tidak ada file)

### Step 2: Test Condition

1. **Klik node "If"**
2. **Klik "Execute step"**
3. **Cek OUTPUT:**
   - **Test dengan data TANPA file:**
     - False Branch harus ada data
     - True Branch harus kosong
   - **Test dengan data DENGAN file:**
     - True Branch harus ada data
     - False Branch harus kosong

### Step 3: Pastikan Branch False Terhubung

**Flow yang benar:**

```
IF Node
    ├─→ True: HTTP Request → Analyze image → Edit Fields1 → Merge
    └─→ False: Edit Fields2 → Merge
            ↓
    Merge Node
            ↓
    AI Agent
```

**Pastikan:**
- Branch False terhubung ke Edit Fields2
- Edit Fields2 terhubung ke Merge
- Merge terhubung ke AI Agent

### Step 4: Konfigurasi Edit Fields2 (Branch False)

**Settings Edit Fields2:**

Fields to Set:
- `sessionId`: `={{ $json.sessionId }}`
- `message`: `={{ $json.message }}`
- `files`: `={{ $json.files || [] }}`

**Pastikan field `message` ada!**

## 🔧 Condition Alternatif (Jika Masih Tidak Jalan)

### Opsi 1: Pakai Operator "is greater than"

```
Value1: {{ $json.files?.length || 0 }}
Operator: is greater than
Value2: 0
```

### Opsi 2: Pakai "is not empty" dengan Safety Check

```
Value1: {{ $json.files && Array.isArray($json.files) && $json.files.length > 0 }}
Operator: is true
Value2: (kosongkan)
```

### Opsi 3: Pakai "exists" Check

```
Value1: {{ $json.files }}
Operator: exists
Value2: (kosongkan)
```

**Tapi ini bisa error jika files = undefined. Lebih baik pakai Opsi 1 atau 2.**

## 📝 Flow Lengkap yang Benar

```
Webhook → Edit Fields → IF Node
            ├─→ True (ada file):
            │   HTTP Request → Analyze image → Edit Fields1 → Merge
            └─→ False (tidak ada file):
                Edit Fields2 → Merge
                        ↓
                Merge Node
                        ↓
                AI Agent
                        ↓
                Respond to Webhook
```

## 🔍 Troubleshooting

### Condition Selalu True

**Penyebab:**
- Expression return truthy value meskipun tidak ada file
- Condition tidak cek dengan benar

**Solusi:**
- Gunakan condition yang lebih eksplisit: `{{ $json.files?.length || 0 }}` + "is greater than" + `0`
- Test dengan Execute step untuk lihat output

### Branch False Tidak Jalan

**Penyebab:**
- Condition selalu True
- Branch False tidak terhubung
- Edit Fields2 tidak mengembalikan data

**Solusi:**
- Pastikan condition bisa return False
- Cek koneksi branch False
- Pastikan Edit Fields2 mengembalikan `message`

### Edit Fields2 Tidak Mengembalikan Message

**Penyebab:**
- Fields to Set tidak include `message`
- Expression salah

**Solusi:**
- Pastikan field `message`: `={{ $json.message }}`
- Test output Edit Fields2 dengan Execute step

## ✅ Checklist Fix

- [ ] IF condition: `{{ $json.files?.length > 0 }}` + "is true"
- [ ] Test condition: return False ketika tidak ada file
- [ ] Branch False terhubung ke Edit Fields2
- [ ] Edit Fields2 mengembalikan `message` + `sessionId`
- [ ] Edit Fields2 terhubung ke Merge
- [ ] Merge terhubung ke AI Agent
- [ ] Test dengan kirim teks saja → harus bisa dibalas
- [ ] Test dengan kirim file → harus bisa dianalisis

## 🎯 Condition Final yang Disarankan

**Untuk cek apakah ada file:**

```
Value1: {{ $json.files?.length || 0 }}
Operator: is greater than
Value2: 0
```

**Ini paling reliable karena:**
- Return True hanya jika files.length > 0
- Return False jika files.length = 0 atau files undefined
- Lebih eksplisit dan mudah di-debug

Setelah fix ini, branch False akan jalan dan bisa handle teks saja!

