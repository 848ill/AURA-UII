# 🔧 Fix: Simple Memory Bermasalah Setelah IF Node

## ⚠️ Masalah
Simple Memory error setelah menambahkan IF node dan HTTP Request, padahal sudah pakai sessionId.

## 🔍 Penyebab
Setelah menambahkan IF node dan HTTP Request, struktur data berubah. Simple Memory tidak bisa akses `sessionId` karena data sudah diubah oleh node-node sebelumnya.

## ✅ Solusi: Update Session Key Expression

### Step 1: Cek Struktur Data di Input Simple Memory

1. **Klik node Simple Memory**
2. **Lihat panel "INPUT"** di sidebar kiri
3. **Cek struktur data:**
   - Apakah ada field `sessionId`?
   - Atau `sessionID`?
   - Atau data ada di node sebelumnya?

### Step 2: Update Session Key Expression

**Opsi 1: Akses dari Set Node Pertama (Recommended)**

Di Simple Memory, update Session Key:
```
={{ $('Set').item.json.sessionId }}
```

Ini akan mengambil sessionId dari Set node pertama (sebelum IF node).

**Opsi 2: Akses dari IF Node**

Jika data masih ada di IF node:
```
={{ $json.sessionId || $json.sessionID }}
```

**Opsi 3: Akses dari Webhook (Fallback)**

Jika tidak ada di node sebelumnya:
```
={{ $('Webhook').item.json.sessionId || $('Set').item.json.sessionId || $json.sessionId }}
```

### Step 3: Pastikan Data Terpass dengan Benar

**Jika pakai conditional flow (IF True/False):**

1. **Di branch IF True:**
   - Setelah HTTP Request → Analyze Image → Set (merge)
   - Pastikan Set node mengembalikan `sessionId`:
     ```
     sessionId: ={{ $('Set').item.json.sessionId }}
     ```

2. **Di branch IF False:**
   - Langsung ke Simple Memory
   - Session Key: `={{ $json.sessionId }}`

3. **Merge kedua branch sebelum Simple Memory:**
   - Gunakan node "Merge" untuk gabungkan kedua branch
   - Atau pastikan kedua branch mengembalikan struktur data yang sama

## 🔧 Flow yang Benar dengan Simple Memory

### Opsi 1: Simple Memory Sebelum IF (Recommended)

```
Webhook → Set → Simple Memory → IF Node
                                    ├─→ True: HTTP Request → Analyze Image → Set (merge) → AI Agent
                                    └─→ False: Langsung ke AI Agent
```

**Keuntungan:**
- Simple Memory selalu dapat akses sessionId dari Set node
- Tidak perlu merge data
- Lebih sederhana

**Simple Memory Session Key:**
```
={{ $json.sessionId }}
```

### Opsi 2: Simple Memory Setelah Merge (Jika Harus Setelah IF)

```
Webhook → Set → IF Node
            ├─→ True: HTTP Request → Analyze Image → Set (merge)
            └─→ False: Set (pass through)
                    ↓
            Merge Node (gabungkan kedua branch)
                    ↓
            Simple Memory
                    ↓
            AI Agent
```

**Simple Memory Session Key:**
```
={{ $json.sessionId }}
```

**Pastikan Set node di kedua branch mengembalikan sessionId!**

## 📝 Konfigurasi Set Node di Branch IF True

Setelah Analyze Image, tambahkan Set node untuk merge hasil:

**Fields to Set:**
- `sessionId`: `={{ $('Set').item.json.sessionId }}` (dari Set node pertama)
- `message`: `={{ $('Set').item.json.message }}` (dari Set node pertama)
- `imageAnalysis`: `={{ $json.output || $json.text || $json.content }}` (dari Analyze Image)
- `files`: `={{ $('Set').item.json.files }}` (dari Set node pertama)

## 📝 Konfigurasi Set Node di Branch IF False

Jika tidak ada file gambar, pass through data:

**Fields to Set:**
- `sessionId`: `={{ $json.sessionId }}`
- `message`: `={{ $json.message }}`
- `files`: `={{ $json.files }}`

## ✅ Checklist

- [ ] Cek struktur data di INPUT Simple Memory
- [ ] Update Session Key expression sesuai struktur data
- [ ] Pastikan Set node di kedua branch mengembalikan sessionId
- [ ] Jika pakai merge, pastikan merge node menggabungkan data dengan benar
- [ ] Test execution → Simple Memory tidak error

## 🎯 Rekomendasi: Pindahkan Simple Memory Sebelum IF

**Flow yang paling mudah:**

```
Webhook → Set → Simple Memory → IF Node
                                    ├─→ True: HTTP Request → Analyze Image → Set → AI Agent
                                    └─→ False: Langsung ke AI Agent
```

**Keuntungan:**
- Simple Memory selalu dapat akses sessionId
- Tidak perlu merge data
- Lebih sederhana dan mudah di-debug

**Simple Memory Session Key:**
```
={{ $json.sessionId }}
```

Setelah ini, Simple Memory akan bekerja dengan benar!

