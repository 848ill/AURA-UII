# 🔧 Fix: IF Condition yang Benar - Branch False Tidak Jalan

## ⚠️ Masalah
Branch False tidak jalan meskipun kondisi seharusnya False. Kemungkinan kondisi IF salah atau selalu return True.

## 🔍 Debugging IF Condition

### Step 1: Test Condition Expression

**Condition yang benar untuk cek file gambar:**

```
Value1: {{ $json.files && $json.files.length > 0 && $json.files[0]?.fileType?.startsWith('image/') }}
```

**Tapi ini bisa jadi terlalu kompleks. Mari gunakan yang lebih sederhana:**

### Step 2: Condition yang Lebih Sederhana dan Reliable

**Opsi 1: Cek Apakah Ada Files (Paling Sederhana)**

```
Value1: {{ $json.files && $json.files.length > 0 }}
Operator: is true
Value2: (kosongkan)
```

**Penjelasan:**
- Return True jika ada files (apapun tipenya)
- Return False jika tidak ada files

**Opsi 2: Cek File Type Gambar (Lebih Spesifik)**

```
Value1: {{ $json.files && $json.files.length > 0 && $json.files[0]?.fileType && $json.files[0].fileType.includes('image') }}
Operator: is true
Value2: (kosongkan)
```

**Penjelasan:**
- Return True hanya jika ada file dengan type yang mengandung "image"
- Return False jika tidak ada file atau file bukan gambar

### Step 3: Test Condition dengan Expression Editor

1. **Klik IF node**
2. **Di field Value1, klik icon expression**
3. **Test expression:**

**Test 1: Cek apakah files exists**
```
{{ $json.files }}
```
- Jika ada files: return array
- Jika tidak ada: return undefined

**Test 2: Cek apakah files array tidak kosong**
```
{{ $json.files && $json.files.length > 0 }}
```
- Jika ada files: return true
- Jika tidak ada: return false

**Test 3: Cek file type gambar**
```
{{ $json.files && $json.files.length > 0 && $json.files[0]?.fileType?.includes('image') }}
```
- Jika ada file gambar: return true
- Jika tidak ada: return false

## ✅ Condition yang Disarankan (Paling Reliable)

### Condition untuk Cek File Gambar

```
Value1: {{ $json.files && Array.isArray($json.files) && $json.files.length > 0 && $json.files[0] && $json.files[0].fileType && $json.files[0].fileType.indexOf('image') === 0 }}
```

**Atau lebih sederhana:**
```
Value1: {{ $json.files?.length > 0 && $json.files[0]?.fileType?.indexOf('image') === 0 }}
```

**Operator:** `is true`

**Value2:** (kosongkan)

### Condition Alternatif (Lebih Sederhana)

Jika kondisi di atas masih error, coba ini:

```
Value1: {{ $json.files && $json.files.length }}
Operator: is greater than
Value2: 0
```

**Penjelasan:**
- Return True jika `files.length > 0`
- Return False jika `files.length = 0` atau files tidak ada

## 🔧 Step-by-Step Fix

### Step 1: Update IF Condition

1. **Klik node "If"**
2. **Klik field Value1**
3. **Klik icon expression** (icon `{{ }}`)
4. **Ganti dengan expression sederhana:**

```
{{ $json.files && $json.files.length > 0 }}
```

5. **Operator:** `is true`
6. **Value2:** (kosongkan)

### Step 2: Test Condition

1. **Klik "Execute step" di IF node**
2. **Cek OUTPUT:**
   - **True Branch:** Harus ada data jika ada files
   - **False Branch:** Harus ada data jika tidak ada files

### Step 3: Pastikan Branch False Terhubung

1. **Cek:** Branch False terhubung ke Edit Fields2?
2. **Cek:** Edit Fields2 terhubung ke Merge?
3. **Cek:** Merge terhubung ke AI Agent?

## 🔍 Troubleshooting

### Condition Selalu True

**Kemungkinan:**
- Expression return value yang truthy meskipun tidak ada files
- Condition tidak cek dengan benar

**Solusi:**
- Gunakan condition sederhana: `{{ $json.files && $json.files.length > 0 }}`
- Atau: `{{ $json.files?.length > 0 }}`
- Test dengan Execute step untuk lihat output

### Condition Selalu False

**Kemungkinan:**
- Expression return undefined atau null
- Property name salah

**Solusi:**
- Cek INPUT data di IF node
- Pastikan field `files` ada di input
- Test expression di expression editor

### Branch False Tidak Jalan

**Kemungkinan:**
- Condition selalu True
- Branch False tidak terhubung dengan benar

**Solusi:**
- Pastikan condition bisa return False
- Cek koneksi branch False
- Test dengan data yang tidak ada files

## 📝 Condition Final yang Disarankan

**Untuk cek apakah ada file gambar:**

```
Value1: {{ $json.files?.length > 0 && $json.files[0]?.fileType?.indexOf('image') === 0 }}
Operator: is true
Value2: (kosongkan)
```

**Atau lebih sederhana (cek apakah ada files apapun):**

```
Value1: {{ $json.files?.length > 0 }}
Operator: is true
Value2: (kosongkan)
```

**Atau pakai operator "is greater than":**

```
Value1: {{ $json.files?.length || 0 }}
Operator: is greater than
Value2: 0
```

## ✅ Checklist

- [ ] Condition expression sederhana dan reliable
- [ ] Test condition dengan Execute step
- [ ] True Branch: ada data jika ada files
- [ ] False Branch: ada data jika tidak ada files
- [ ] Branch False terhubung ke Edit Fields2
- [ ] Edit Fields2 terhubung ke Merge
- [ ] Test dengan kirim teks saja → harus jalan di branch False
- [ ] Test dengan kirim gambar → harus jalan di branch True

Setelah fix condition ini, branch False akan jalan dengan benar!

