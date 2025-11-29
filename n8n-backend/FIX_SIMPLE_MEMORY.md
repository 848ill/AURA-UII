# 🔧 Fix: Simple Memory Error "input values have 3 keys"

## ⚠️ Error
```
input values have 3 keys, you must specify an input key or pass only 1 key as input
```

## 🔍 Penyebab

Simple Memory node menerima multiple keys dari webhook:
- `message` (string)
- `sessionId` (string) 
- `files` (array)

Simple Memory tidak tahu key mana yang harus digunakan untuk session key.

## ✅ Solusi Cepat

### Opsi 1: Gunakan "Set" Node (Recommended)

**Tambahkan node "Set" setelah Webhook:**

1. **Tambahkan node "Set"** (atau "Edit Fields") setelah Webhook Trigger
2. **Settings:**
   - **Mode:** Manual (atau biarkan default)
   - **Values to Set / Fields to Set:**
     - Klik **"Add Value"** atau **"Add Field"**
     - **Field 1:**
       - Name: `sessionId`
       - Value: `={{ $json.sessionId }}`
       - Type: String
     - **Field 2:**
       - Name: `message`
       - Value: `={{ $json.message }}`
       - Type: String
     - **Field 3:**
       - Name: `files`
       - Value: `={{ $json.files }}`
       - Type: Array/Object
3. **Connect:** Webhook → **Set** → Simple Memory → AI Agent

**Catatan:** 
- Jika ada opsi "Keep Only Set Fields", **UNCHECK** (biarkan semua field dari webhook)
- Jika tidak ada opsi tersebut, tidak masalah, mode Manual akan tetap pass semua field

**Di Simple Memory:**
- **Session ID Type:** **Custom Key** (PENTING! Bukan Auto atau Fixed)
- **Session Key:** `={{ $json.sessionId }}`
- **Memory Type:** Buffer Window Memory (default)
- **Window Size:** 5 (default, bisa diubah 3-10)

**Lihat dokumentasi lengkap:** `SIMPLE_MEMORY_CONFIG.md`

**Lihat dokumentasi lengkap:** `SET_NODE_CONFIG.md`

### Opsi 2: Konfigurasi Input Key di Simple Memory

1. Klik node **Simple Memory**
2. Cari field **"Input Key"** atau **"Input Data"**
3. Pilih key yang berisi session ID:
   - **Input Key:** `sessionId`
4. **Session Key:** `={{ $json.sessionId }}`

### Opsi 3: Extract dengan Expression

Di Simple Memory node:
- **Session ID Type:** Custom Key
- **Session Key:** `={{ $json.sessionId || $json.body?.sessionId || 'default-session' }}`

## 📝 Flow yang Benar

```
Webhook Trigger
    ↓
Set Node (format data)
    ↓
Simple Memory (sessionId dari Set)
    ↓
AI Agent (message + files dari Set)
    ↓
Respond to Webhook
```

## 🔍 Debugging

### Cek Input Simple Memory

1. Buka execution di N8N
2. Klik node Simple Memory
3. Lihat **Input Data**:
   - Harus ada field `sessionId`
   - Session Key harus bisa di-resolve

### Test Expression

Di Simple Memory, test expression:
- `={{ $json.sessionId }}` → harus return session ID
- Jika error, coba: `={{ $('Set').item.json.sessionId }}` (jika pakai Set node)

## ✅ Checklist

- [ ] Ada node "Set" setelah Webhook (opsional tapi recommended)
- [ ] Simple Memory Session Key menggunakan `={{ $json.sessionId }}`
- [ ] Input Key di Simple Memory dikonfigurasi dengan benar
- [ ] Test execution tidak ada error di Simple Memory

Setelah fix ini, Simple Memory akan bekerja dan AI bisa mengingat konteks percakapan per session!

