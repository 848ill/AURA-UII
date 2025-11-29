# 🔧 Fix: Branch False Tidak Terhubung + HTTP Request Error

## ⚠️ Masalah
1. Branch False dari IF node tidak terhubung ke mana-mana
2. Error "Cannot read properties of undefined (reading 'startsWith')"
3. Teks tidak bisa dibalas karena flow terhenti di branch False

## 🔍 Penyebab
- Branch False tidak terhubung, jadi flow terhenti
- HTTP Request masih mencoba akses property yang undefined
- Tidak ada Merge node untuk gabungkan kedua branch

## ✅ Solusi: Hubungkan Branch False dan Tambahkan Merge Node

### Step 1: Hubungkan Branch False ke Set Node

1. **Tambahkan node "Set" di branch False**
2. **Connect:** IF False → Set (pass through)
3. **Settings Set node di branch False:**
   - **Mode:** Manual
   - **Fields to Set:**
     - `sessionId`: `={{ $json.sessionId }}`
     - `message`: `={{ $json.message }}`
     - `files`: `={{ $json.files }}`

### Step 2: Tambahkan Merge Node

1. **Tambahkan node "Merge"** setelah kedua branch
2. **Connect:**
   - Set (True branch, setelah Edit Fields1) → Merge
   - Set (False branch) → Merge

3. **Settings Merge:**
   - **Mode:** Merge by Index atau Merge by Key
   - Pastikan kedua branch mengembalikan struktur yang sama

### Step 3: Update HTTP Request URL dengan Safety Check

1. **Klik node "HTTP Request"**
2. **Update URL expression:**
   ```
   ={{ $json.files && $json.files.length > 0 && $json.files[0] && $json.files[0].url ? $json.files[0].url : '' }}
   ```

   Atau lebih sederhana dengan optional chaining:
   ```
   ={{ $json.files?.[0]?.url || '' }}
   ```

### Step 4: Update IF Condition dengan Safety Check

**Pastikan IF condition punya safety check:**

```
Value1: {{ $json.files && $json.files.length > 0 && $json.files[0] && $json.files[0].fileType && $json.files[0].fileType.startsWith && $json.files[0].fileType.startsWith('image/') }}
```

**Atau lebih sederhana:**
```
Value1: {{ $json.files?.[0]?.fileType?.startsWith('image/') }}
```

**Operator:** `is true`

**Value2:** (kosongkan)

### Step 5: Connect Merge ke AI Agent

1. **Connect:** Merge → AI Agent
2. **Pastikan AI Agent menerima data dari Merge**

## 📝 Flow Lengkap yang Benar

```
Webhook Trigger
    ↓
Edit Fields (Set)
    ↓
IF Node (ada file gambar?)
    ├─→ True: HTTP Request → Analyze image → Edit Fields1 → Merge
    └─→ False: Set (pass through) → Merge
            ↓
    Merge Node (gabungkan kedua branch)
            ↓
    AI Agent (dengan Simple Memory tool)
            ↓
    Respond to Webhook
```

## 🔧 Konfigurasi Detail

### Set Node di Branch False

```
Mode: Manual
Fields to Set:
  - sessionId: ={{ $json.sessionId }}
  - message: ={{ $json.message }}
  - files: ={{ $json.files }}
```

### Set Node di Branch True (Edit Fields1)

```
Mode: Manual
Fields to Set:
  - sessionId: ={{ $('Edit Fields').item.json.sessionId }}
  - message: ={{ $('Edit Fields').item.json.message }}
  - imageAnalysis: ={{ $json.output || $json.text || $json.content }}
  - files: ={{ $('Edit Fields').item.json.files }}
```

### HTTP Request Node

```
Method: GET
URL: ={{ $json.files?.[0]?.url || '' }}
Response Format: File
Options:
  - Response: File
  - Binary Property: data
```

### Merge Node

```
Mode: Merge by Index
Inputs: 2
  - Input 1: Set (True branch)
  - Input 2: Set (False branch)
```

## ✅ Checklist Fix

- [ ] Branch False terhubung ke Set node
- [ ] Set node di branch False mengembalikan message + sessionId
- [ ] Merge node ditambahkan untuk gabungkan kedua branch
- [ ] HTTP Request URL expression punya safety check (`?.[0]?.url`)
- [ ] IF condition punya safety check (`?.[0]?.fileType?.startsWith`)
- [ ] Merge terhubung ke AI Agent
- [ ] Test dengan kirim teks saja → harus bisa dibalas
- [ ] Test dengan kirim gambar → harus bisa dianalisis

## 🔍 Troubleshooting

### Error "Cannot read properties of undefined"
- ✅ Pastikan semua expression pakai optional chaining: `?.`
- ✅ HTTP Request URL: `={{ $json.files?.[0]?.url || '' }}`
- ✅ IF condition: `={{ $json.files?.[0]?.fileType?.startsWith('image/') }}`

### Branch False tidak terhubung
- ✅ Tambahkan Set node di branch False
- ✅ Connect Set → Merge
- ✅ Pastikan Merge menerima input dari kedua branch

### Teks tidak bisa dibalas
- ✅ Pastikan branch False terhubung
- ✅ Pastikan Merge menggabungkan kedua branch
- ✅ Pastikan AI Agent menerima data dari Merge

Setelah fix ini, baik teks maupun gambar akan bisa diproses dengan benar!

