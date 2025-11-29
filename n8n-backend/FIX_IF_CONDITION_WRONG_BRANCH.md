# 🔧 Fix: IF Condition Salah - Teks Masuk ke Branch True

## ⚠️ Masalah
- Ketika POST request dengan teks saja, masuk ke branch True (yang ada Analyze image)
- Seharusnya masuk ke False Branch
- Error di Analyze image karena tidak ada file

## 🔍 Penyebab
Kondisi IF tidak bisa membedakan antara:
- `files` tidak ada (undefined)
- `files = []` (array kosong)
- `files = [null]` (array dengan null)

Ketika `files = [null]`, maka `files.length = 1`, jadi kondisi `files.length > 0` = true.

## ✅ Solusi: Fix IF Condition

### Step 1: Update IF Condition

**Condition yang benar untuk cek apakah ada file yang valid:**

```
Value1: {{ $json.files && Array.isArray($json.files) && $json.files.length > 0 && $json.files[0] && $json.files[0].url }}
```

**Atau lebih sederhana:**

```
Value1: {{ $json.files?.[0]?.url }}
```

**Operator:** `exists` atau `is not empty`

**Value2:** (kosongkan)

### Step 2: Condition Alternatif (Lebih Reliable)

**Cek apakah ada file dengan URL valid:**

```
Value1: {{ $json.files && $json.files.length > 0 && $json.files[0] && $json.files[0].url && $json.files[0].url.length > 0 }}
```

**Operator:** `is true`

**Value2:** (kosongkan)

### Step 3: Condition Paling Sederhana (Recommended)

**Cek apakah files[0].url exists:**

```
Value1: {{ $json.files?.[0]?.url }}
Operator: exists
Value2: (kosongkan)
```

**Penjelasan:**
- Return True hanya jika files[0].url exists (ada file dengan URL)
- Return False jika files tidak ada, atau files[0] tidak ada, atau files[0].url tidak ada

## 🔧 Step-by-Step Fix

### Update IF Condition

1. **Klik node "If"**
2. **Klik field Value1**
3. **Klik icon expression**
4. **Ganti dengan:**

```
{{ $json.files?.[0]?.url }}
```

5. **Operator:** `exists`
6. **Value2:** (kosongkan)

### Test Condition

1. **Klik "Execute step" di IF node**
2. **Test dengan data TANPA file:**
   - False Branch harus ada data
   - True Branch harus kosong
3. **Test dengan data DENGAN file:**
   - True Branch harus ada data
   - False Branch harus kosong

## 📝 Condition yang Disarankan

### Opsi 1: Cek URL (Paling Reliable)

```
Value1: {{ $json.files?.[0]?.url }}
Operator: exists
Value2: (kosongkan)
```

### Opsi 2: Cek URL dengan Length

```
Value1: {{ $json.files?.[0]?.url && $json.files[0].url.length > 0 }}
Operator: is true
Value2: (kosongkan)
```

### Opsi 3: Cek File Type

```
Value1: {{ $json.files?.[0]?.fileType && $json.files[0].fileType.startsWith('image/') }}
Operator: is true
Value2: (kosongkan)
```

## ✅ Checklist

- [ ] IF condition: `{{ $json.files?.[0]?.url }}` + "exists"
- [ ] Test condition: return False ketika tidak ada file
- [ ] Test condition: return True hanya jika ada file dengan URL
- [ ] Test dengan POST request teks saja → harus masuk False Branch
- [ ] Test dengan POST request dengan file → harus masuk True Branch

## 🔍 Troubleshooting

### Masih Masuk Branch True Padahal Tidak Ada File

**Penyebab:**
- Condition masih cek `files.length > 0` yang bisa true jika `files = [null]`
- Condition tidak cek apakah file valid (ada URL)

**Solusi:**
- Gunakan condition yang cek URL: `{{ $json.files?.[0]?.url }}`
- Operator: `exists` atau `is not empty`

### Error Analyze Image

**Penyebab:**
- Data masuk branch True padahal tidak ada file
- HTTP Request URL undefined

**Solusi:**
- Fix IF condition agar hanya masuk True jika ada file dengan URL
- HTTP Request akan otomatis tidak error jika tidak masuk branch True

Setelah fix ini, teks saja akan masuk False Branch dan tidak akan error di Analyze image!

