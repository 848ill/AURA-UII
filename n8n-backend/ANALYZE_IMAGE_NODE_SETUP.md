# 🖼️ Setup "Analyze Image" Node (Bukan Tool)

## ⚠️ Catatan
"Analyze image" adalah **node terpisah**, bukan tool untuk AI Agent. Kita perlu setup sebagai node di conditional flow.

## ✅ Solusi: Setup Analyze Image Node dengan HTTP Request

Karena Analyze Image node memerlukan **binary data**, kita perlu download file dulu dengan HTTP Request.

## 🔧 Step-by-Step Setup

### Step 1: Setup HTTP Request untuk Download File

1. **Setelah IF node (True branch)**, tambahkan node **"HTTP Request"**
2. **Connect:** IF True → **HTTP Request** → Analyze Image

3. **Settings HTTP Request:**
   - **Method:** GET
   - **URL:** `={{ $json.files[0].url }}`
   - **Response Format:** **"File"** (PENTING!)
   - **Options:**
     - **Response:** File
     - **Binary Property:** `data` (default)

### Step 2: Setup Analyze Image Node

1. **Tambahkan node "Analyze Image"** (dari OpenAI Actions → IMAGE ACTIONS)
2. **Connect dari HTTP Request:**
   - HTTP Request → Analyze Image

3. **Settings Analyze Image:**
   - **Resource:** Image
   - **Operation:** Analyze
   - **Model:** GPT-4O (atau GPT-4 Vision)
   - **Image URLs:** (KOSONGKAN - karena pakai binary data)
   - **Binary Data:** `data` (dari HTTP Request)
   - Atau jika ada field "Binary Property": pilih `data`

### Step 3: Merge Hasil dengan Message

1. **Tambahkan node "Set"** setelah Analyze Image
2. **Settings:**
   - **Mode:** Manual
   - **Fields to Set:**
     - `sessionId`: `={{ $('Set').item.json.sessionId }}` (dari Set node pertama)
     - `message`: `={{ $('Set').item.json.message }}` (message original)
     - `imageAnalysis`: `={{ $json.output || $json.text || $json.content || $json.choices[0].message.content }}` (hasil analisis)
     - `files`: `={{ $('Set').item.json.files }}`

### Step 4: Connect ke AI Agent

1. **Connect dari kedua branch:**
   - **IF True:** HTTP Request → Analyze Image → Set (merge) → Simple Memory → AI Agent
   - **IF False:** Langsung ke Simple Memory → AI Agent

2. **Di AI Agent:**
   - **Text:** 
     ```
     ={{ $json.message }}

     {{ $json.imageAnalysis ? '\n\n[User mengirim gambar. Hasil analisis: ' + $json.imageAnalysis + ']' : '' }}
     ```

### Step 5: Update System Prompt di AI Agent

Tambahkan di System Message:
```
FITUR FILE (PENTING!):
- Jika ada field "imageAnalysis" di input, berarti user mengirim gambar dan sudah dianalisis
- Gunakan hasil analisis dari field "imageAnalysis" untuk menjawab pertanyaan user
- Jika user bertanya tentang gambar, jawab berdasarkan hasil analisis yang sudah ada
- Jangan bilang "saya tidak bisa membaca gambar" - analisis sudah dilakukan sebelumnya
```

## 📝 Flow Lengkap

```
Webhook Trigger
    ↓
Set Node
    ↓
Simple Memory
    ↓
IF Node (ada file gambar?)
    ├─→ True: HTTP Request (download) → Analyze Image → Set (merge) → AI Agent
    └─→ False: Langsung ke AI Agent
                ↓
        Respond to Webhook
```

## 🔧 Konfigurasi Detail

### HTTP Request Node

```
Method: GET
URL: ={{ $json.files[0].url }}
Response Format: File
Options:
  - Response: File
  - Binary Property: data
```

### Analyze Image Node

```
Resource: Image
Operation: Analyze
Model: GPT-4O
Image URLs: (KOSONGKAN)
Binary Data: data (dari HTTP Request)
```

**Catatan:** Pastikan binary data dari HTTP Request terpass dengan benar ke Analyze Image.

### Set Node (Setelah Analyze Image)

```
Mode: Manual
Fields:
  - sessionId: ={{ $('Set').item.json.sessionId }}
  - message: ={{ $('Set').item.json.message }}
  - imageAnalysis: ={{ $json.output || $json.text || $json.content }}
  - files: ={{ $('Set').item.json.files }}
```

## ✅ Checklist

- [ ] HTTP Request node ditambahkan setelah IF True
- [ ] HTTP Request: Method GET, URL dari files[0].url
- [ ] HTTP Request: Response Format = File
- [ ] Analyze Image: Binary Data = data (dari HTTP Request)
- [ ] Set node merge hasil analisis dengan message
- [ ] AI Agent menerima message + imageAnalysis
- [ ] System Prompt di-update
- [ ] Test dengan upload gambar → gambar harus dianalisis

## 🔍 Troubleshooting

### HTTP Request tidak output binary
- ✅ Cek: Response Format = File?
- ✅ Cek: URL valid? (test di browser)
- ✅ Cek: File di Supabase Storage public?

### Analyze Image masih error "expects binary file"
- ✅ Cek: Binary data ada di output HTTP Request?
- ✅ Cek: Analyze Image menggunakan binary data, bukan URL?
- ✅ Cek: Binary Property = `data`?

### Hasil analisis tidak terpass ke AI Agent
- ✅ Cek: Set node sudah merge imageAnalysis?
- ✅ Cek: Expression di AI Agent Text sudah benar?
- ✅ Cek: imageAnalysis field ada di output Set node?

Setelah ini, gambar akan terdownload dan dianalisis dengan benar!

