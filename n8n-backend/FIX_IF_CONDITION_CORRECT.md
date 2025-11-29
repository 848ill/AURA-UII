# 🔧 Fix: IF Node Condition yang Benar

## ⚠️ Masalah di Kondisi IF Node Anda

**Kondisi saat ini (SALAH):**
```
{{ $json.files }} exists
AND
{{ $json.message }} does not exist
```

**Masalah:**
- Ini akan return True hanya jika ada files DAN tidak ada message
- Tapi seharusnya kita cek apakah ada file gambar, bukan cek apakah tidak ada message
- Jika user kirim message + file, kondisi ini akan False (karena message exists)

## ✅ Kondisi yang Benar

### Opsi 1: Cek Apakah Ada File Gambar (Recommended)

**Value1:**
```
{{ $json.files && $json.files.length > 0 && $json.files[0].fileType.startsWith('image/') }}
```

**Operator:** `is true`

**Value2:** (kosongkan)

### Opsi 2: Cek Apakah Ada File (Sederhana)

**Value1:**
```
{{ $json.files && $json.files.length > 0 }}
```

**Operator:** `is true`

**Value2:** (kosongkan)

## 🔧 Cara Fix di N8N

### Step 1: Update Condition 1

1. **Klik field Value1 di condition pertama**
2. **Klik icon expression** (icon `{{ }}`)
3. **Ganti dengan:**
   ```
   {{ $json.files && $json.files.length > 0 && $json.files[0].fileType.startsWith('image/') }}
   ```
4. **Operator:** `is true`
5. **Value2:** (kosongkan)

### Step 2: Hapus Condition 2

1. **Hapus condition kedua** (yang cek "message does not exist")
2. **Hapus juga "AND"** yang menghubungkan kedua condition

**Atau jika ingin tetap pakai 2 condition:**

**Condition 1:**
- Value1: `{{ $json.files && $json.files.length > 0 }}`
- Operator: `is true`
- Value2: (kosongkan)

**Condition 2:** (HAPUS INI - tidak perlu!)

## 📝 Flow yang Benar dengan Simple Memory sebagai Tool

Karena Simple Memory adalah tool di AI Agent, flow yang benar:

```
Webhook Trigger
    ↓
Set Node
    ↓
IF Node (ada file gambar?)
    ├─→ True: HTTP Request → Analyze Image → Set (merge) → Merge
    └─→ False: Set (pass through) → Merge
            ↓
    Merge Node (gabungkan kedua branch)
            ↓
    AI Agent
        ├─→ Tool: Simple Memory (sessionId dari input)
        └─→ Output: Response
            ↓
    Respond to Webhook
```

### Konfigurasi Simple Memory Tool di AI Agent

1. **Di AI Agent node, tambahkan tool "Simple Memory"**
2. **Settings:**
   - **Session ID Type:** Custom Key
   - **Session Key:** `={{ $json.sessionId }}`
   - **Memory Type:** Buffer Window Memory
   - **Window Size:** 5

**Pastikan input ke AI Agent mengandung `sessionId`!**

## ✅ Checklist Fix

- [ ] Condition 1: cek apakah ada file gambar (bukan "message does not exist")
- [ ] Condition 2: HAPUS (tidak perlu)
- [ ] Operator: `is true`
- [ ] Set node di branch True mengembalikan `message` + `imageAnalysis`
- [ ] Set node di branch False mengembalikan `message`
- [ ] Merge kedua branch sebelum AI Agent
- [ ] Simple Memory tool di AI Agent menggunakan `sessionId` dari input
- [ ] Test dengan upload gambar + teks → keduanya harus bisa diproses

## 🎯 Kondisi Final yang Benar

**Hanya 1 condition:**

```
Value1: {{ $json.files && $json.files.length > 0 && $json.files[0].fileType.startsWith('image/') }}
Operator: is true
Value2: (kosongkan)
```

**Ini akan return True jika ada file gambar, False jika tidak ada.**

Setelah fix ini, IF node akan bekerja dengan benar!

