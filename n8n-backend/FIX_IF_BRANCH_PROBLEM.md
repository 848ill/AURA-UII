# 🔧 Fix: IF Node Branch Problem - Teks vs Gambar

## ⚠️ Masalah
- Jika set ke branch True (ada gambar): gambar terdeteksi tapi teks tidak dibalas
- Jika set ke branch False (tidak ada gambar): teks dibalas tapi gambar tidak terdeteksi

## 🔍 Penyebab
Setelah IF node, kedua branch terpisah dan tidak terhubung dengan benar ke Simple Memory dan AI Agent. Atau Set node di branch True tidak mengembalikan message dengan benar.

## ✅ Solusi: Pastikan Kedua Branch Terhubung dengan Benar

**⚠️ CATATAN:** Simple Memory adalah tool di AI Agent, bukan node terpisah!

### Flow yang Benar dengan Simple Memory sebagai Tool

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

**Konfigurasi Simple Memory Tool di AI Agent:**
- **Session ID Type:** Custom Key
- **Session Key:** `={{ $json.sessionId }}`
- **Memory Type:** Buffer Window Memory
- **Window Size:** 5

**Pastikan input ke AI Agent mengandung `sessionId` dari Merge node!**

**Lihat panduan lengkap:** `FIX_IF_CONDITION_CORRECT.md`

### Opsi 3: Fix Set Node di Branch True

**Pastikan Set node setelah Analyze Image mengembalikan message:**

1. **Klik Set node setelah Analyze Image**
2. **Fields to Set:**
   - `sessionId`: `={{ $('Set').item.json.sessionId }}` (dari Set node pertama)
   - `message`: `={{ $('Set').item.json.message }}` (MESSAGE HARUS ADA!)
   - `imageAnalysis`: `={{ $json.output || $json.text || $json.content }}`
   - `files`: `={{ $('Set').item.json.files }}`

**⚠️ PENTING:** Field `message` HARUS ada di Set node!

## 🔧 Step-by-Step Fix

### Fix 1: Pastikan Message Terpass di Branch True

**Di Set node setelah Analyze Image:**

Fields to Set:
```
sessionId: ={{ $('Set').item.json.sessionId }}
message: ={{ $('Set').item.json.message }}  ← PASTIKAN ADA INI!
imageAnalysis: ={{ $json.output || $json.text || $json.content }}
files: ={{ $('Set').item.json.files }}
```

### Fix 2: Pastikan Kedua Branch Terhubung ke Simple Memory

**Jika pakai Opsi 2 (Merge):**

1. **Tambahkan node "Merge"** setelah kedua branch
2. **Settings Merge:**
   - **Mode:** Merge by Index atau Merge by Key
   - Pastikan kedua branch mengembalikan struktur yang sama

3. **Connect:**
   - Set (True branch) → Merge
   - Set (False branch) → Merge
   - Merge → Simple Memory → AI Agent

**Simple Memory Session Key:**
```
={{ $json.sessionId }}
```

### Fix 3: Pastikan AI Agent Menerima Message

**Di AI Agent node:**

Text input:
```
={{ $json.message }}

{{ $json.imageAnalysis ? '\n\n[User mengirim gambar. Hasil analisis: ' + $json.imageAnalysis + ']' : '' }}
```

**Pastikan expression ini bisa handle kedua case:**
- Jika ada `imageAnalysis`: message + analisis gambar
- Jika tidak ada `imageAnalysis`: message saja

## 📝 Flow yang Benar

### Flow Recommended (Simple Memory Sebelum IF):

```
Webhook Trigger
    ↓
Set Node
    ↓
Simple Memory
    ↓
IF Node (ada file gambar?)
    ├─→ True: HTTP Request → Analyze Image → Set → AI Agent
    └─→ False: Langsung ke AI Agent
                ↓
        Respond to Webhook
```

**Di branch True:**
- Set node HARUS mengembalikan `message` + `imageAnalysis`
- Connect ke AI Agent

**Di branch False:**
- Langsung ke AI Agent dengan `message` saja

### Flow Alternatif (Merge Kedua Branch):

```
Webhook Trigger
    ↓
Set Node
    ↓
IF Node (ada file gambar?)
    ├─→ True: HTTP Request → Analyze Image → Set (message + imageAnalysis)
    └─→ False: Set (message saja)
            ↓
    Merge Node
            ↓
    Simple Memory
            ↓
    AI Agent
```

## ✅ Checklist Fix

- [ ] Set node di branch True mengembalikan `message` (PENTING!)
- [ ] Set node di branch True mengembalikan `imageAnalysis`
- [ ] Kedua branch terhubung ke Simple Memory (atau Simple Memory sebelum IF)
- [ ] AI Agent menerima message + imageAnalysis (jika ada)
- [ ] Test dengan upload gambar + teks → keduanya harus bisa dibalas
- [ ] Test tanpa gambar, hanya teks → teks harus bisa dibalas

## 🔍 Troubleshooting

### Teks tidak dibalas di branch True
- ✅ Cek: Set node setelah Analyze Image mengembalikan `message`?
- ✅ Cek: AI Agent menerima `message` dari branch True?
- ✅ Cek: Expression di AI Agent Text sudah benar?

### Gambar tidak terdeteksi di branch False
- ✅ Ini normal - branch False tidak ada file gambar
- ✅ Pastikan IF condition sudah benar

### Kedua branch tidak terhubung
- ✅ Cek: Kedua branch terhubung ke Simple Memory atau Merge?
- ✅ Cek: Simple Memory di posisi yang benar?

Setelah fix ini, baik teks maupun gambar akan bisa diproses dengan benar!

