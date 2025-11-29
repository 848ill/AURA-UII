# 🔧 Debug: Branch True Tidak Jalan

## ⚠️ Masalah
Branch True dari IF node tidak jalan meskipun seharusnya ada file gambar.

## 🔍 Step-by-Step Debugging

### Step 1: Cek Input Data di IF Node

1. **Klik node "If"**
2. **Lihat panel "INPUT" di sidebar kiri**
3. **Cek struktur data:**
   - Apakah ada field `files`?
   - Apakah `files` adalah array?
   - Apakah `files.length > 0`?
   - Apakah `files[0].fileType` ada?

### Step 2: Test Expression di IF Node

**Cek expression di Value1:**

1. **Klik field Value1 di condition**
2. **Test dengan expression sederhana:**

**Test 1: Cek apakah files exists**
```
{{ $json.files }}
```
- Klik "Execute step"
- Lihat OUTPUT: apakah ada data?

**Test 2: Cek apakah files array tidak kosong**
```
{{ $json.files && $json.files.length }}
```
- Klik "Execute step"
- Lihat OUTPUT: apakah return number > 0?

**Test 3: Cek apakah files[0] exists**
```
{{ $json.files && $json.files[0] }}
```
- Klik "Execute step"
- Lihat OUTPUT: apakah ada object file?

**Test 4: Cek fileType**
```
{{ $json.files && $json.files[0] && $json.files[0].fileType }}
```
- Klik "Execute step"
- Lihat OUTPUT: apakah return "image/jpeg" atau "image/png"?

### Step 3: Gunakan Condition yang Paling Sederhana

**Coba condition paling sederhana:**

```
Value1: {{ $json.files }}
Operator: is not empty
Value2: (kosongkan)
```

**Atau:**

```
Value1: {{ $json.files && $json.files.length }}
Operator: is greater than
Value2: 0
```

### Step 4: Cek Data Structure

**Mungkin struktur data berbeda. Cek di INPUT panel:**

- Apakah `files` langsung di root? → `{{ $json.files }}`
- Atau apakah di dalam object lain? → `{{ $json.body.files }}`
- Atau apakah di dalam array? → `{{ $json[0].files }}`

### Step 5: Condition Alternatif (Jika Struktur Data Berbeda)

**Jika files ada di body:**

```
Value1: {{ $json.body && $json.body.files && $json.body.files.length > 0 }}
Operator: is true
Value2: (kosongkan)
```

**Jika files ada di item array:**

```
Value1: {{ $json[0] && $json[0].files && $json[0].files.length > 0 }}
Operator: is true
Value2: (kosongkan)
```

## ✅ Condition yang Disarankan (Mulai dari Paling Sederhana)

### Opsi 1: Paling Sederhana (Test Ini Dulu!)

```
Value1: {{ $json.files }}
Operator: is not empty
Value2: (kosongkan)
```

**Test:** Klik "Execute step", lihat OUTPUT. Apakah True Branch ada datanya?

### Opsi 2: Cek Array Length

```
Value1: {{ $json.files && $json.files.length }}
Operator: is greater than
Value2: 0
```

### Opsi 3: Cek dengan typeof

```
Value1: {{ typeof $json.files !== 'undefined' && $json.files && $json.files.length > 0 }}
Operator: is true
Value2: (kosongkan)
```

### Opsi 4: Cek File Type Gambar

```
Value1: {{ $json.files && $json.files.length > 0 && $json.files[0] && $json.files[0].fileType && $json.files[0].fileType.includes('image') }}
Operator: is true
Value2: (kosongkan)
```

## 🔧 Step-by-Step Fix

### Step 1: Cek Struktur Data

1. **Klik node "Edit Fields" (sebelum IF)**
2. **Klik "Execute step"**
3. **Lihat OUTPUT:**
   - Apakah ada field `files`?
   - Struktur datanya seperti apa?

### Step 2: Gunakan Condition Paling Sederhana

1. **Di IF node, update condition:**
   ```
   Value1: {{ $json.files }}
   Operator: is not empty
   Value2: (kosongkan)
   ```
2. **Klik "Execute step"**
3. **Cek OUTPUT:**
   - True Branch: harus ada data jika ada files
   - False Branch: harus ada data jika tidak ada files

### Step 3: Jika Masih Tidak Jalan, Cek Struktur Data

**Mungkin files ada di tempat yang berbeda. Coba:**

1. **Lihat INPUT di IF node**
2. **Cari field `files` di struktur data**
3. **Update condition sesuai struktur:**

**Jika files di root:**
```
{{ $json.files }}
```

**Jika files di body:**
```
{{ $json.body.files }}
```

**Jika files di item:**
```
{{ $json[0].files }}
```

## 📝 Checklist Debugging

- [ ] Cek INPUT data di IF node
- [ ] Test dengan condition paling sederhana: `{{ $json.files }}` + "is not empty"
- [ ] Klik "Execute step" dan lihat OUTPUT
- [ ] True Branch: apakah ada data?
- [ ] False Branch: apakah ada data?
- [ ] Jika True Branch kosong, cek struktur data files
- [ ] Update condition sesuai struktur data yang benar

## 🎯 Quick Test

1. **Update condition menjadi:**
   ```
   Value1: {{ $json.files }}
   Operator: is not empty
   ```
2. **Klik "Execute step"**
3. **Cek OUTPUT:**
   - Apakah True Branch ada datanya?
   - Apakah False Branch ada datanya?

**Jika True Branch masih kosong:**
- Cek struktur data di INPUT
- Files mungkin ada di tempat yang berbeda

Setelah ini, kita akan tahu kenapa branch True tidak jalan!

