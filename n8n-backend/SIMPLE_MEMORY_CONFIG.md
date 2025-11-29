# 🧠 Konfigurasi Simple Memory Node di N8N

## 📝 Settings yang Perlu Diisi

### Step 1: Basic Settings

1. **Session ID Type:**
   - Pilih: **"Custom Key"** (bukan "Auto" atau "Fixed")

2. **Session Key:**
   - Isi dengan: `={{ $json.sessionId }}`
   - Ini mengambil sessionId dari output Set node sebelumnya

### Step 2: Advanced Settings (Opsional)

1. **Memory Type:**
   - Default: **"Buffer Window Memory"** (sudah benar)
   - Ini akan mengingat beberapa percakapan terakhir

2. **Window Size:**
   - Default: 5 (mengingat 5 percakapan terakhir)
   - Bisa diubah sesuai kebutuhan (3-10 recommended)

## 🎯 Konfigurasi Lengkap

```
Simple Memory Node Settings:
┌─────────────────────────────────┐
│ Session ID Type:                │
│ ☑ Custom Key                    │
│                                 │
│ Session Key:                    │
│ ={{ $json.sessionId }}         │
│                                 │
│ Memory Type:                    │
│ Buffer Window Memory (default) │
│                                 │
│ Window Size:                    │
│ 5 (default, bisa diubah)       │
└─────────────────────────────────┘
```

## ⚠️ Catatan Penting

1. **Session Key HARUS:** `={{ $json.sessionId }}`
   - Ini mengambil sessionId dari Set node sebelumnya
   - Jika tidak ada Set node, gunakan: `={{ $json.sessionId }}`

2. **Session ID Type HARUS:** "Custom Key"
   - Bukan "Auto" atau "Fixed"
   - Custom Key memungkinkan dynamic session per user

3. **Tidak perlu isi field lain** jika menggunakan default

## 🔍 Troubleshooting

### Jika masih error "input values have 3 keys"

**Solusi 1:** Pastikan Set node sudah dikonfigurasi dengan benar
- Set node harus output: `{ sessionId, message, files }`

**Solusi 2:** Cek expression di Session Key
- Pastikan: `={{ $json.sessionId }}`
- Test expression di N8N expression editor

**Solusi 3:** Cek Input Key (jika ada)
- Beberapa versi N8N punya field "Input Key"
- Kosongkan atau pilih "All" / "Auto"

### Test Expression

Di Simple Memory, test expression:
- `={{ $json.sessionId }}` → harus return UUID session
- Jika error, coba: `={{ $('Set').item.json.sessionId }}`

## ✅ Checklist

- [ ] Session ID Type = **"Custom Key"**
- [ ] Session Key = `={{ $json.sessionId }}`
- [ ] Memory Type = Buffer Window Memory (default)
- [ ] Window Size = 5 (default, bisa diubah)
- [ ] Test execution tidak ada error

## 📝 Flow Lengkap

```
Webhook Trigger
    Output: { message, sessionId, files }
    ↓
Set Node
    Output: { sessionId, message, files }
    ↓
Simple Memory
    Session ID Type: Custom Key
    Session Key: ={{ $json.sessionId }}
    Output: { sessionId, message, files } + memory context
    ↓
AI Agent
    Text: ={{ $json.message }}
    Memory: dari Simple Memory
    Files: ={{ $json.files }}
```

Setelah ini, Simple Memory akan mengingat konteks percakapan per session!

