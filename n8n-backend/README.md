# N8N Backend Setup

Docker Compose setup untuk menjalankan N8N dengan PostgreSQL.

## ⚠️ Masalah Autentikasi

**Problem:** `N8N_USER_EMAIL` dan `N8N_USER_PASSWORD` di `docker-compose.yaml` **hanya bekerja saat FIRST RUN** (saat database masih kosong). Setelah database sudah ada user, environment variable ini **diabaikan**.

**Solusi:**

### Opsi 1: Reset Database (Hapus semua workflow)
```bash
cd n8n-backend
docker-compose down -v  # Hapus volume termasuk database
docker-compose up -d    # Start fresh dengan user dari env vars
```

### Opsi 2: Login dengan User yang Sudah Ada di Database
1. Akses n8n UI: `http://localhost:5678`
2. Login dengan credential yang sudah ada di database
3. Atau buat user baru via UI

### Opsi 3: Gunakan Basic Auth (Jika perlu)
Edit `docker-compose.yaml`:
```yaml
- N8N_BASIC_AUTH_ACTIVE=true
- N8N_BASIC_AUTH_USER=admin
- N8N_BASIC_AUTH_PASSWORD=yourpassword
```

## 🔓 Webhook Configuration

**PENTING:** Webhook **TIDAK PERLU AUTHENTICATION**. 
- `N8N_BASIC_AUTH_ACTIVE=false` memastikan webhook bisa diakses tanpa login
- Ini diperlukan agar Next.js bisa mengirim request ke webhook tanpa credential

## 🚀 Quick Start

```bash
# Start services
docker-compose up -d

# Check logs
docker-compose logs -f n8n

# Stop services
docker-compose down

# Reset everything (hapus database)
docker-compose down -v
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `N8N_USER_EMAIL` | Email untuk user pertama (first run only) | - |
| `N8N_USER_PASSWORD` | Password untuk user pertama (first run only) | - |
| `N8N_BASIC_AUTH_ACTIVE` | Enable basic auth untuk webhook | `false` |
| `WEBHOOK_URL` | Base URL untuk webhook (Ngrok) | - |
| `DB_POSTGRESDB_HOST` | PostgreSQL host | `postgres` |
| `DB_POSTGRESDB_DATABASE` | Database name | `n8n_db` |

## 🔧 Troubleshooting

### Login tidak bisa dengan credential di env vars
- **Penyebab:** Database sudah ada user sebelumnya
- **Solusi:** Reset database dengan `docker-compose down -v`

### Webhook error 401/403
- **Penyebab:** Basic auth aktif
- **Solusi:** Set `N8N_BASIC_AUTH_ACTIVE=false`

### Webhook tidak bisa diakses dari Next.js
- **Penyebab:** N8N hanya listen di localhost
- **Solusi:** Pastikan `N8N_HOST=0.0.0.0` (sudah ada di config)

