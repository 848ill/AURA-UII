# 🔧 Setup IF Node Condition untuk Cek File Gambar

## 📝 Step-by-Step: Isi Condition di IF Node

### Step 1: Isi Value1 (Field yang Dicek)

1. **Klik field Value1** (field pertama, kosong)
2. **Klik icon expression** (icon `{{ }}` atau clock) di sebelah Value1
3. **Isi dengan expression:**
   ```
   {{ $json.files && $json.files.length > 0 && $json.files[0].fileType.startsWith('image/') }}
   ```
4. Atau lebih sederhana, cek apakah ada files:
   ```
   {{ $json.files && $json.files.length > 0 }}
   ```

### Step 2: Pilih Operator

1. **Dropdown "is equal to"** → ubah menjadi: **"is true"** atau **"is not empty"**
   - Jika pakai expression boolean (true/false): pilih **"is true"**
   - Jika pakai cek array: pilih **"is not empty"**

### Step 3: Value2 (Opsional)

Jika pakai operator "is true" atau "is not empty", **Value2 bisa dikosongkan** atau diisi:
- **"is true"** → Value2 bisa kosong atau `true`
- **"is not empty"** → Value2 bisa kosong

## 🎯 Opsi Condition yang Bisa Dipakai

### Opsi 1: Cek Apakah Ada File Gambar (Recommended)

**Value1:**
```
{{ $json.files?.length > 0 && $json.files[0]?.fileType?.indexOf('image') === 0 }}
```

**Atau lebih sederhana:**
```
{{ $json.files && $json.files.length > 0 && $json.files[0]?.fileType?.includes('image') }}
```

**Operator:** `is true`

**Value2:** (kosongkan)

**Catatan:** Gunakan `indexOf` atau `includes` daripada `startsWith` untuk lebih reliable.

### Opsi 2: Cek Apakah Ada File (Sederhana)

**Value1:**
```
{{ $json.files && $json.files.length > 0 }}
```

**Operator:** `is true` atau `is not empty`

**Value2:** (kosongkan)

### Opsi 3: Cek File Type Spesifik

**Value1:**
```
{{ $json.files && $json.files.length > 0 ? $json.files[0].fileType : '' }}
```

**Operator:** `contains`

**Value2:** `image/`

## 📸 Visual Guide

```
IF Node Condition:
┌─────────────────────────────────┐
│ Value1:                         │
│ {{ $json.files && $json.files.length > 0 && $json.files[0].fileType.startsWith('image/') }}│
│                                 │
│ Operator:                       │
│ is true  ← PILIH INI!          │
│                                 │
│ Value2:                         │
│ (kosongkan)                     │
└─────────────────────────────────┘
```

## 🔍 Cara Isi Expression di Value1

1. **Klik field Value1**
2. **Klik icon expression** (icon `{{ }}` atau clock di sebelah field)
3. **Paste expression:**
   ```
   {{ $json.files && $json.files.length > 0 && $json.files[0].fileType.startsWith('image/') }}
   ```
4. **Klik OK atau Enter**

## ✅ Checklist

- [ ] Value1 diisi dengan expression (klik icon expression dulu)
- [ ] Expression: cek files dan fileType
- [ ] Operator: "is true" atau "is not empty"
- [ ] Value2: kosongkan (atau isi `true` jika pakai "is true")
- [ ] Test execution → IF node harus return True jika ada file gambar

## 🎯 Expression yang Disarankan

**Untuk cek file gambar (Paling Reliable):**
```javascript
{{ $json.files?.length > 0 && $json.files[0]?.fileType?.indexOf('image') === 0 }}
```

**Atau lebih sederhana:**
```javascript
{{ $json.files && $json.files.length > 0 && $json.files[0]?.fileType?.includes('image') }}
```

**Atau paling sederhana (cek apakah ada files apapun):**
```javascript
{{ $json.files?.length > 0 }}
```

**Penjelasan:**
- `$json.files?.length` → cek apakah ada field files dan panjangnya > 0 (optional chaining)
- `&& $json.files[0]?.fileType?.indexOf('image') === 0` → cek apakah file pertama type-nya mulai dengan "image"

**Jika branch False masih tidak jalan, coba condition paling sederhana:**
```
Value1: {{ $json.files?.length || 0 }}
Operator: is greater than
Value2: 0
```

Setelah ini, IF node akan return True jika ada file, dan False jika tidak ada!

