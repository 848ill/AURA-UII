#!/bin/bash

# Script untuk reset N8N database (hapus semua workflow dan user)
# ⚠️ WARNING: Ini akan menghapus SEMUA data di database!

echo "⚠️  WARNING: Ini akan menghapus SEMUA data N8N (workflow, credentials, dll)"
read -p "Apakah Anda yakin? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Dibatalkan."
    exit 1
fi

echo "🛑 Menghentikan container..."
docker-compose down

echo "🗑️  Menghapus volume database..."
docker-compose down -v

echo "🚀 Menjalankan N8N dengan database fresh..."
docker-compose up -d

echo "⏳ Menunggu N8N ready (30 detik)..."
sleep 30

echo "✅ Selesai! N8N sekarang menggunakan user dari environment variables:"
echo "   Email: ${N8N_USER_EMAIL:-dkrdmfvuvfvkmtedvd@nesopf.com}"
echo "   Password: ${N8N_USER_PASSWORD:-siberaksi8888}"
echo ""
echo "🌐 Akses N8N di: http://localhost:5678"

