# 🖼️ Setup "Analyze Image" sebagai Tool di AI Agent

## 🎯 Tujuan
Menggunakan "Analyze image" dari OpenAI Actions sebagai tool yang terhubung ke AI Agent.

## 🔧 Step-by-Step Setup

### Step 1: Tambahkan "Analyze Image" Tool

1. **Di workflow, cari node "AI Agent"**
2. **Klik node AI Agent**
3. **Di panel settings, cari bagian "Tools" atau "Available Tools"**
4. **Klik "Add Tool" atau "+" untuk menambah tool**
5. **Pilih "OpenAI" → "Analyze image"** (dari IMAGE ACTIONS)

### Step 2: Konfigurasi "Analyze Image" Tool

**Settings yang perlu diisi:**

1. **Tool Name/ID:**
   - Biarkan default atau isi: `analyze_image`

2. **Description:**
   ```
   Menganalisis gambar menggunakan OpenAI Vision. Input: URL gambar public dari Supabase Storage. Gunakan tool ini ketika user mengirim gambar dan meminta analisis.
   ```

3. **Image URL Parameter:**
   - **Name:** `imageUrl` atau `url`
   - **Type:** String
   - **Required:** ✅ Yes
   - **Description:** "URL gambar public yang akan dianalisis"

4. **How to get Image URL:**
   - Tool akan menerima URL dari AI Agent
   - AI Agent akan mengambil URL dari `files[].url` di payload

### Step 3: Update System Prompt di AI Agent

**Tambahkan instruksi ini di System Message:**

```
FITUR FILE (SANGAT PENTING!):
- Jika user mengirim file, data file akan ada di payload dengan format:
  {
    "message": "pertanyaan user",
    "files": [
      {
        "id": "file-id",
        "fileName": "nama-file.jpg",
        "fileType": "image/jpeg",
        "url": "https://supabase.co/storage/v1/object/public/chat-files/.../file.jpg"
      }
    ]
  }

- Jika ada field "files" di payload dan files.length > 0, berarti user mengirim file
- File URL ada di files[].url (URL public dari Supabase Storage, BISA LANGSUNG DIAKSES)
- Untuk GAMBAR: gunakan tool "Analyze image" dengan parameter imageUrl = files[].url
- Jika user bertanya tentang file, LANGSUNG gunakan tool "Analyze image" - jangan bilang "saya tidak bisa membaca"
- File URL adalah public URL, bisa langsung digunakan di tool

CONTOH PERILAKU YANG BENAR:
User: "coba analisis isi gambar saya berikut" + upload gambar
→ Kamu HARUS langsung menggunakan tool "Analyze image" dengan imageUrl = files[0].url
→ Jangan bilang "saya belum menerima file" - file sudah ada di payload!

PERILAKU YANG SALAH (JANGAN LAKUKAN INI):
❌ "Saya tidak bisa membaca file"
❌ "Saya belum menerima file"
❌ "Kirim ulang file"

PERILAKU YANG BENAR:
✅ Langsung gunakan tool "Analyze image"
✅ Gunakan parameter imageUrl = files[].url
✅ Berikan hasil analisis dengan ramah dan antusias
```

### Step 4: Pass File Data ke AI Agent

**Pastikan file data terpass ke AI Agent:**

Di AI Agent node, pastikan input data mengandung:
- `message`: `={{ $json.message }}`
- `files`: `={{ $json.files }}` (jika ada)

**Jika pakai conditional flow (IF node):**

1. **Branch IF True (ada file gambar):**
   - Set node pass: `message`, `sessionId`, `files`
   - Connect ke Simple Memory → AI Agent

2. **Branch IF False (tidak ada file):**
   - Set node pass: `message`, `sessionId`
   - Connect ke Simple Memory → AI Agent

### Step 5: Test Tool

1. **Save workflow**
2. **Test dengan upload gambar**
3. **Cek execution log:**
   - AI Agent harus memanggil tool "Analyze image"
   - Tool harus menerima URL dari files[0].url
   - Tool harus mengembalikan hasil analisis

## 📝 Flow Lengkap

```
Webhook Trigger
    ↓
Set Node
    ↓
Simple Memory
    ↓
IF Node (ada file gambar?)
    ├─→ True: Set (pass files) → Simple Memory → AI Agent
    └─→ False: Set (pass message) → Simple Memory → AI Agent
                ↓
        AI Agent (dengan tool "Analyze image")
            ├─→ Tool: Analyze image (jika ada file gambar)
            └─→ Output: Response dengan hasil analisis
                ↓
        Respond to Webhook
```

## 🔧 Konfigurasi Detail Tool

### Tool Settings

```
Tool Name: analyze_image
Type: OpenAI - Analyze image
Description: Menganalisis gambar menggunakan OpenAI Vision. Input: URL gambar public.

Parameters:
  - imageUrl (String, Required)
    Description: URL gambar public yang akan dianalisis
    Example: https://supabase.co/storage/v1/object/public/chat-files/.../file.jpg
```

### AI Agent Configuration

**Input:**
- `message`: `={{ $json.message }}`
- `files`: `={{ $json.files }}` (jika ada)

**Tools:**
- ✅ Analyze image (enabled)

**System Prompt:**
- Sudah di-update dengan instruksi file handling

## ✅ Checklist

- [ ] Tool "Analyze image" ditambahkan ke AI Agent
- [ ] Tool description jelas tentang penggunaan URL
- [ ] System Prompt di-update dengan instruksi file handling
- [ ] File data (files[]) terpass ke AI Agent
- [ ] Test dengan upload gambar → AI harus memanggil tool
- [ ] Tool harus menerima URL dan mengembalikan hasil analisis

## 🔍 Troubleshooting

### AI tidak memanggil tool
- ✅ Cek: System Prompt sudah menginstruksikan penggunaan tool?
- ✅ Cek: Tool description jelas?
- ✅ Cek: File data terpass ke AI Agent?

### Tool error
- ✅ Cek: URL gambar valid? (test di browser)
- ✅ Cek: File di Supabase Storage public?
- ✅ Cek: Parameter imageUrl sudah diisi dengan benar?

### Tool tidak menerima URL
- ✅ Cek: Tool parameter configuration
- ✅ Cek: AI Agent pass URL dengan benar ke tool?

Setelah ini, AI akan bisa menganalisis gambar menggunakan tool "Analyze image"!

