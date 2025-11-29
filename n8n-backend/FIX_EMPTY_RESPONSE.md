# 🔧 Fix: N8N Mengembalikan Response Kosong

## ⚠️ Masalah
N8N webhook mengembalikan status 200 (success) tapi response body kosong.

## ✅ Solusi: Pastikan Webhook Node Mengembalikan Output

### Step 1: Cek Webhook Node di N8N

1. Buka workflow N8N Anda
2. Cari node **Webhook** (yang menerima request dari Next.js)
3. Klik node tersebut

### Step 2: Konfigurasi Webhook Node

**Settings yang harus ada:**
- **HTTP Method:** POST
- **Path:** `auraragsuii` (akan menjadi `/webhook/auraragsuii`)
- **Response Mode:** ⚠️ **"Respond to Webhook"** (PENTING!)
- **Response Data:** **"Last Entry JSON"** atau **"All Entries"**

### Step 3: Pastikan Ada Node "Respond to Webhook"

Di akhir workflow, pastikan ada node **"Respond to Webhook"** yang mengembalikan output dari AI Agent.

**Flow yang benar:**
```
Webhook Trigger
    ↓
AI Agent (memproses message + files)
    ↓
Respond to Webhook (mengembalikan output)
```

### Step 4: Konfigurasi "Respond to Webhook" Node

1. Tambahkan node **"Respond to Webhook"** di akhir workflow
2. **Response Code:** 200
3. **Response Body:**
   - **Response Data:** "Last Entry JSON"
   - Atau gunakan **"Set"** node untuk format response:
     ```json
     {
       "output": "={{ $json.output }}"
     }
     ```

### Step 5: Format Response yang Benar

**Opsi 1: Langsung dari AI Agent**
- AI Agent node → Output langsung ke Respond to Webhook
- Response akan otomatis format array n8n

**Opsi 2: Format Manual (Recommended)**
Tambahkan node **"Set"** sebelum Respond to Webhook:
- **Keep Only Set Fields:** ✅
- **Fields to Set:**
  - `output`: `={{ $json.output || $json.text || $json.message }}`

Lalu di Respond to Webhook:
- **Response Data:** "Last Entry JSON"
- Response akan menjadi: `{ "output": "jawaban AI" }`

### Step 6: Test

1. Save workflow di N8N
2. Pastikan workflow **Active**
3. Test dari web interface
4. Cek N8N execution logs untuk melihat output

## 🔍 Debugging

### Cek Execution Logs di N8N

1. Buka N8N Dashboard
2. Klik workflow Anda
3. Klik tab **"Executions"**
4. Cari execution terbaru
5. Cek output dari setiap node:
   - Webhook: harus ada data input
   - AI Agent: harus ada output
   - Respond to Webhook: harus ada response body

### Common Issues

**Issue 1: Webhook tidak mengembalikan response**
- ✅ Pastikan ada node "Respond to Webhook" di akhir workflow
- ✅ Pastikan Response Mode = "Respond to Webhook"

**Issue 2: Response format tidak sesuai**
- ✅ Gunakan "Set" node untuk format response
- ✅ Pastikan field `output` berisi jawaban AI

**Issue 3: AI Agent tidak menghasilkan output**
- ✅ Cek AI Agent node execution
- ✅ Pastikan model OpenAI sudah dikonfigurasi
- ✅ Pastikan system prompt sudah di-set

## 📝 Template Workflow yang Benar

```
1. Webhook Trigger
   - Method: POST
   - Path: auraragsuii
   - Response Mode: Respond to Webhook

2. AI Agent
   - Input: $json.message
   - Files: $json.files (jika ada)
   - Output: text response

3. Set (Optional - untuk format response)
   - output: ={{ $json.output }}

4. Respond to Webhook
   - Response Code: 200
   - Response Data: Last Entry JSON
```

## ✅ Checklist

- [ ] Webhook node: Response Mode = "Respond to Webhook"
- [ ] Ada node "Respond to Webhook" di akhir workflow
- [ ] AI Agent menghasilkan output
- [ ] Response format sesuai (ada field `output` atau `text`)
- [ ] Workflow status: **Active**

---

## 🔧 Fix: Simple Memory Error "input values have 3 keys"

### ⚠️ Error
```
input values have 3 keys, you must specify an input key or pass only 1 key as input
```

### ✅ Solusi

**Masalah:** Simple Memory node menerima multiple keys dari webhook (`message`, `sessionId`, `files`) dan tidak tahu key mana yang harus digunakan.

**Solusi 1: Gunakan "Set" Node untuk Format Data**

Tambahkan node **"Set"** setelah Webhook dan sebelum Simple Memory:

1. **Tambahkan node "Set"** setelah Webhook Trigger
2. **Settings:**
   - **Keep Only Set Fields:** ❌ (uncheck - keep all fields)
   - **Fields to Set:**
     - `sessionId`: `={{ $json.sessionId }}`
     - `message`: `={{ $json.message }}`
     - `files`: `={{ $json.files }}`
3. **Connect:** Webhook → Set → Simple Memory → AI Agent

**Solusi 2: Konfigurasi Simple Memory dengan Input Key**

1. Klik node **Simple Memory**
2. Di bagian **"Input Key"** atau **"Input Data"**, pilih:
   - **Input Key:** `sessionId` (atau key yang berisi session ID)
3. **Session Key:** `={{ $json.sessionId }}`
4. Pastikan format: `={{ $('Set').item.json.sessionId }}` (jika pakai Set node)

**Solusi 3: Extract Session ID dengan Expression**

Di Simple Memory node:
- **Session ID Type:** Custom Key
- **Session Key:** `={{ $json.sessionId || $json.body?.sessionId || 'default-session' }}`

### 📝 Template Flow yang Benar

```
1. Webhook Trigger
   - Input: { message, sessionId, files }

2. Set Node (Optional - untuk format data)
   - sessionId: ={{ $json.sessionId }}
   - message: ={{ $json.message }}
   - files: ={{ $json.files }}

3. Simple Memory
   - Session Key: ={{ $json.sessionId }}
   - Input Key: (kosongkan atau pilih "sessionId")

4. AI Agent
   - Text: ={{ $json.message }}
   - Files: ={{ $json.files }}

5. Respond to Webhook
```

### ⚠️ Catatan Penting

- Simple Memory perlu **satu key** untuk session ID
- Jika webhook mengirim multiple keys, gunakan **Set node** untuk format data
- Atau konfigurasi **Input Key** di Simple Memory untuk spesifik key yang digunakan

Setelah fix ini, Simple Memory akan bekerja dengan benar dan AI bisa mengingat konteks percakapan!

