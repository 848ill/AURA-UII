@echo off
REM Script untuk reset N8N database (Windows)
REM WARNING: Ini akan menghapus SEMUA data di database!

echo WARNING: Ini akan menghapus SEMUA data N8N (workflow, credentials, dll)
set /p confirm="Apakah Anda yakin? (yes/no): "

if not "%confirm%"=="yes" (
    echo Dibatalkan.
    exit /b 1
)

echo Menghentikan container...
docker-compose down

echo Menghapus volume database...
docker-compose down -v

echo Menjalankan N8N dengan database fresh...
docker-compose up -d

echo Menunggu N8N ready (30 detik)...
timeout /t 30 /nobreak

echo Selesai! N8N sekarang menggunakan user dari environment variables
echo Akses N8N di: http://localhost:5678

