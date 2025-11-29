#!/bin/bash

# Test webhook dengan image file
# Usage: ./test-webhook-image.sh

WEBHOOK_URL="https://carl-unnoisy-matha.ngrok-free.dev/webhook/auraragsuii"

echo "🧪 Testing webhook dengan image file..."
echo ""

# Test 1: Dengan file image
echo "Test 1: POST request dengan file image"
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "ngrok-skip-browser-warning: true" \
  -d '{
    "message": "Apa yang ada di gambar ini? Tolong analisis gambar yang saya kirim.",
    "sessionId": "test-session-image-'$(date +%s)'",
    "files": [{
      "id": "test-image-'$(date +%s)'",
      "fileName": "sample-image.jpg",
      "fileType": "image/jpeg",
      "fileSize": 45678,
      "url": "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=400",
      "metadata": {
        "originalName": "sample-image.jpg",
        "uploadedAt": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
      }
    }]
  }' \
  -w "\n\nStatus: %{http_code}\nTime: %{time_total}s\n" \
  -s | jq . 2>/dev/null || echo "Response tidak valid JSON atau kosong"

echo ""
echo "✅ Test selesai!"
echo ""
echo "Catatan:"
echo "- Jika response kosong, cek execution logs di n8n"
echo "- Pastikan workflow aktif"
echo "- Pastikan node 'Respond to Webhook' terhubung dengan benar"

