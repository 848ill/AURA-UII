# 🔧 Konfigurasi "Set" Node di N8N

## 📝 Tujuan
Node "Set" digunakan untuk format data dari Webhook agar Simple Memory bisa membaca `sessionId` dengan benar.

## 🎯 Step-by-Step Setup

### Step 1: Tambahkan Node "Set"

1. Di workflow N8N, klik **"+"** setelah Webhook Trigger
2. Cari dan pilih node **"Set"** (bisa juga disebut "Edit Fields")
3. Connect: **Webhook** → **Set** → **Simple Memory**

### Step 2: Konfigurasi "Set" Node

**Settings yang perlu di-set:**

1. **Mode:** Pilih **"Manual"** atau **"Keep Only Set Fields"**
   - Jika **"Keep Only Set Fields"**: ❌ **UNCHECK** (biarkan semua field dari webhook)
   - Jika **"Manual"**: ✅ Biarkan default

2. **Values to Set / Fields to Set:**
   Klik **"Add Value"** atau **"Add Field"** untuk setiap field:

   **Field 1:**
   - **Name:** `sessionId`
   - **Value:** `={{ $json.sessionId }}`
   - **Type:** String

   **Field 2:**
   - **Name:** `message`
   - **Value:** `={{ $json.message }}`
   - **Type:** String

   **Field 3:**
   - **Name:** `files`
   - **Value:** `={{ $json.files }}`
   - **Type:** Array (atau Object)

### Step 3: Alternatif (Jika Tidak Ada Field "Keep Only Set Fields")

Jika di N8N Anda tidak ada opsi "Keep Only Set Fields", gunakan mode **"Manual"**:

1. **Mode:** Manual
2. **Values to Set:**
   - Tambahkan 3 values:
     - `sessionId` = `={{ $json.sessionId }}`
     - `message` = `={{ $json.message }}`
     - `files` = `={{ $json.files }}`

**Catatan:** Dengan mode Manual, field lain dari webhook akan tetap ada, jadi tidak masalah.

### Step 4: Connect ke Simple Memory

Setelah Set node dikonfigurasi:
- **Output dari Set** → **Input ke Simple Memory**
- Di Simple Memory, Session Key: `={{ $json.sessionId }}`

## 📸 Visual Guide

```
Webhook Trigger
    Output: { message, sessionId, files }
    ↓
Set Node
    Mode: Manual
    Values:
      - sessionId: ={{ $json.sessionId }}
      - message: ={{ $json.message }}
      - files: ={{ $json.files }}
    Output: { sessionId, message, files } (sama, tapi ter-format)
    ↓
Simple Memory
    Session Key: ={{ $json.sessionId }}
    ↓
AI Agent
    Text: ={{ $json.message }}
    Files: ={{ $json.files }}
```

## ⚠️ Catatan Penting

1. **Tidak perlu "Keep Only Set Fields"** - biarkan semua field dari webhook tetap ada
2. **Session ID tetap perlu di-set** - untuk memastikan format konsisten
3. **Expression `={{ $json.sessionId }}`** - mengambil sessionId dari webhook input

## 🔍 Troubleshooting

### Jika Set node tidak muncul di list
- Cari dengan nama: **"Set"**, **"Edit Fields"**, atau **"Set Fields"**
- Di N8N versi baru, mungkin disebut **"Edit Fields"**

### Jika expression tidak bekerja
- Pastikan menggunakan format: `={{ $json.sessionId }}`
- Test expression di N8N expression editor
- Cek execution log untuk melihat output Set node

### Jika masih error di Simple Memory
- Cek output Set node di execution log
- Pastikan field `sessionId` ada di output
- Pastikan Session Key di Simple Memory: `={{ $json.sessionId }}`

## ✅ Checklist

- [ ] Node "Set" ditambahkan setelah Webhook
- [ ] Set node meng-set: sessionId, message, files
- [ ] Expression menggunakan `={{ $json.sessionId }}`
- [ ] Simple Memory Session Key: `={{ $json.sessionId }}`
- [ ] Test execution tidak ada error

Setelah ini, Simple Memory akan bisa membaca sessionId dengan benar!

