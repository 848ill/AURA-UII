# 🔧 Fix: Error "An expression references this node, but the node is unexecuted"

## ⚠️ Error
```
An expression references this node, but the node is unexecuted.
There is no connection back to the node 'Analyze image', but it's used in an expression here.
```

## 🔍 Penyebab
AI Agent masih menggunakan expression yang mereferensikan node "Analyze image" secara langsung, padahal:
- Analyze image adalah node terpisah di branch True
- Ketika branch False jalan, Analyze image tidak dijalankan
- Expression yang reference Analyze image akan error

## ✅ Solusi: Gunakan Data dari Input, Bukan dari Node

### Step 1: Hapus Reference ke Analyze Image Node

**Jangan gunakan expression seperti:**
```
❌ {{ $('Analyze image').item.json.output }}
❌ {{ $('Analyze image').json.text }}
❌ {{ $('Analyze image') }}
```

**Gunakan data dari input (field imageAnalysis):**
```
✅ {{ $json.imageAnalysis }}
```

### Step 2: Pastikan Edit Fields1 Mengembalikan imageAnalysis

**Di Edit Fields1 (setelah Analyze image):**

Fields to Set:
- `sessionId`: `={{ $('Edit Fields').item.json.sessionId }}`
- `message`: `={{ $('Edit Fields').item.json.message }}`
- `imageAnalysis`: `={{ $json.output || $json.text || $json.content }}` ← INI!
- `files`: `={{ $('Edit Fields').item.json.files }}`

**Catatan:** `imageAnalysis` diambil dari output Analyze image node, bukan dari reference node.

### Step 3: Update AI Agent Text Input

**Di AI Agent, Text input:**

```
={{ $json.message }}

{{ $json.imageAnalysis ? '\n\n[User mengirim gambar. Hasil analisis: ' + $json.imageAnalysis + ']' : '' }}
```

**Jangan gunakan:**
```
❌ {{ $('Analyze image').item.json.output }}
```

**Gunakan:**
```
✅ {{ $json.imageAnalysis }}
```

### Step 4: Update System Prompt

**Di AI Agent System Message:**

Jangan reference Analyze image node. Gunakan field `imageAnalysis`:

```
FITUR FILE (PENTING!):
- Jika ada field "imageAnalysis" di input, berarti user mengirim gambar dan sudah dianalisis
- Gunakan hasil analisis dari field "imageAnalysis" untuk menjawab pertanyaan user
- Jika user bertanya tentang gambar, jawab berdasarkan hasil analisis yang sudah ada
- Jangan bilang "saya tidak bisa membaca gambar" - analisis sudah dilakukan sebelumnya
```

## 🔧 Cek Semua Expression

### Di Edit Fields1 (Setelah Analyze Image)

**Fields to Set:**
```
sessionId: ={{ $('Edit Fields').item.json.sessionId }}
message: ={{ $('Edit Fields').item.json.message }}
imageAnalysis: ={{ $json.output || $json.text || $json.content }}
files: ={{ $('Edit Fields').item.json.files }}
```

**Catatan:** `$json` di sini adalah output dari Analyze image node (node sebelumnya).

### Di AI Agent

**Text Input:**
```
={{ $json.message }}

{{ $json.imageAnalysis ? '\n\n[User mengirim gambar. Hasil analisis: ' + $json.imageAnalysis + ']' : '' }}
```

**Catatan:** `$json` di sini adalah input ke AI Agent (dari Edit Fields1 atau Edit Fields2).

## ✅ Checklist Fix

- [ ] Tidak ada expression yang reference Analyze image node secara langsung
- [ ] Edit Fields1 mengembalikan field `imageAnalysis` (dari output Analyze image)
- [ ] AI Agent menggunakan `{{ $json.imageAnalysis }}` bukan `{{ $('Analyze image') }}`
- [ ] System Prompt tidak reference Analyze image node
- [ ] Test dengan teks saja → tidak error
- [ ] Test dengan foto → imageAnalysis terpass dengan benar

## 🔍 Troubleshooting

### Error "An expression references this node, but the node is unexecuted"

**Penyebab:**
- Ada expression yang reference node Analyze image secara langsung
- Node Analyze image tidak dijalankan (di branch False)

**Solusi:**
- Cari semua expression yang menggunakan `$('Analyze image')`
- Ganti dengan `{{ $json.imageAnalysis }}`
- Pastikan imageAnalysis sudah di-set di Edit Fields1

### imageAnalysis Tidak Ada

**Penyebab:**
- Edit Fields1 tidak mengembalikan imageAnalysis
- Expression di Edit Fields1 salah

**Solusi:**
- Pastikan Edit Fields1 mengembalikan field `imageAnalysis`
- Expression: `={{ $json.output || $json.text || $json.content }}`
- Test output Edit Fields1 dengan Execute step

Setelah fix ini, tidak akan ada error "node is unexecuted" lagi!

