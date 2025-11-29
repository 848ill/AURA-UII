# 🖼️ Setup Image Analysis untuk File Upload

## ⚠️ Masalah
AI tidak bisa menganalisis gambar yang diupload, padahal file sudah terupload ke Supabase Storage.

## ✅ Solusi: Conditional Flow (Recommended - Lebih Mudah!)

**Jika tidak bisa connect sebagai tool, gunakan conditional flow ini:**

### Step 1: Tambahkan/Update "Analyze Image" Node

1. **Cari node "Analyze image"** di workflow (jika sudah ada, update. Jika belum, tambahkan)
2. **Type:** `@n8n/n8n-nodes-langchain.openAi` atau `n8n-nodes-base.openAi`
3. **Settings:**
   - **Resource:** Image
   - **Operation:** Analyze
   - **Model:** GPT-4O atau GPT-4 Vision
   - **Image URLs:** `={{ $json.files && $json.files[0] ? $json.files[0].url : $json.url }}`

### Step 2: Setup Conditional Flow (Recommended - Lebih Mudah!)

**Karena tidak bisa connect sebagai tool, gunakan conditional flow:**

1. **Tambahkan node "IF"** setelah Set node:
   - **Condition:** `{{ $json.files && $json.files.length > 0 && $json.files[0].fileType.startsWith('image/') }}`
   - Ini cek apakah ada file gambar

2. **IF True:** → Analyze image → Set (merge hasil) → AI Agent
3. **IF False:** → Langsung ke AI Agent

**Lihat dokumentasi lengkap:** `IMAGE_ANALYSIS_ALTERNATIVE.md`

### Step 3: Update "Analyze Image" Node Configuration

**Settings yang benar:**

```
Analyze Image Node:
┌─────────────────────────────────┐
│ Resource: Image                │
│ Operation: Analyze             │
│ Model: GPT-4O (atau GPT-4)    │
│                                 │
│ Image URLs:                     │
│ ={{ $json.files && $json.files[0] ? $json.files[0].url : '' }}│
│                                 │
│ Options: (default)              │
└─────────────────────────────────┘
```

**Expression untuk Image URLs:**
- Jika file ada: `={{ $json.files && $json.files[0] ? $json.files[0].url : $json.url }}`
- Atau lebih aman: `={{ $json.files && $json.files.length > 0 && $json.files[0].fileType.startsWith('image/') ? $json.files[0].url : '' }}`

### Step 4: Update System Prompt di AI Agent

**Tambahkan di System Message:**

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
- Untuk GAMBAR: gunakan "Analyze Image" tool dengan URL dari files[].url
- Jika user bertanya tentang file, LANGSUNG analisis file tersebut - jangan bilang "saya tidak bisa membaca"
- File URL adalah public URL, bisa langsung digunakan di tools

CONTOH PERILAKU YANG BENAR:
User: "coba analisis isi gambar saya berikut" + upload gambar
→ Kamu HARUS langsung menggunakan "Analyze Image" tool dengan files[0].url
→ Jangan bilang "saya belum menerima file" - file sudah ada di payload!

PERILAKU YANG SALAH (JANGAN LAKUKAN INI):
❌ "Saya tidak bisa membaca file"
❌ "Saya belum menerima file"
❌ "Kirim ulang file"

PERILAKU YANG BENAR:
✅ Langsung gunakan "Analyze Image" tool
✅ Gunakan URL dari files[].url
✅ Berikan hasil analisis dengan ramah dan antusias
```

## 🔧 Workflow Structure

### Opsi 1: Tool-based (Recommended)

```
Webhook → Set → Simple Memory → AI Agent
                                    ├─→ Analyze Image Tool (files[].url)
                                    ├─→ Vector Store Tool
                                    └─→ Google Search Tool
                                    ↓
                            Respond to Webhook
```

### Opsi 2: Conditional Flow

```
Webhook → Set → IF (ada file gambar?)
    ├─→ Yes: Analyze Image → Merge → AI Agent
    └─→ No: AI Agent langsung
                ↓
        Respond to Webhook
```

## 📝 Template "Analyze Image" Node

**Jika menggunakan node OpenAI langsung:**

```json
{
  "resource": "image",
  "operation": "analyze",
  "modelId": "gpt-4o",
  "imageUrls": "={{ $json.files && $json.files[0] ? $json.files[0].url : '' }}",
  "options": {}
}
```

**Jika menggunakan sebagai Tool:**

1. Buat custom tool atau gunakan built-in
2. Description: "Menganalisis gambar menggunakan OpenAI Vision. Input: URL gambar public."
3. Function: Ambil URL dari `files[].url` dan kirim ke OpenAI Vision API

## ✅ Checklist

- [ ] Node "Analyze Image" sudah ada dan dikonfigurasi
- [ ] Image URLs menggunakan expression: `={{ $json.files[0].url }}`
- [ ] Tool terhubung ke AI Agent (jika pakai tool-based)
- [ ] System Prompt sudah di-update dengan instruksi file handling
- [ ] Test dengan upload gambar → AI harus bisa analisis

## 🔍 Troubleshooting

### AI masih bilang "tidak bisa membaca file"
- ✅ Cek: System Prompt sudah di-update?
- ✅ Cek: Analyze Image tool terhubung ke AI Agent?
- ✅ Cek: Expression di Image URLs benar?

### Analyze Image node error
- ✅ Cek: URL dari files[].url valid?
- ✅ Cek: File di Supabase Storage public?
- ✅ Cek: Model OpenAI Vision sudah dikonfigurasi?

### Tool tidak terpanggil
- ✅ Cek: Tool description jelas?
- ✅ Cek: AI Agent bisa akses tool?
- ✅ Cek: System Prompt menginstruksikan penggunaan tool?

Setelah setup ini, AI akan bisa menganalisis gambar yang diupload!

