# 🔧 Template Workflow N8N untuk Webhook

## Struktur Workflow yang Diperlukan

Workflow Anda harus memiliki node-node berikut:

1. **Webhook Trigger** (bukan Telegram Trigger)
2. **AI Agent** dengan System Prompt
3. **Simple Memory** dengan session key dinamis
4. **Vector Store Tool** (Pinecone)
5. **Google Search Tool** (optional)
6. **Respond to Webhook** node

---

## Konfigurasi Node-by-Node

### 1. Webhook Trigger Node

**Type:** `n8n-nodes-base.webhook`

**Settings:**
- **HTTP Method:** POST
- **Path:** `auraragsuii` (akan menjadi `/webhook/auraragsuii`)
- **Response Mode:** Respond to Webhook
- **Response Data:** Last Entry JSON

**Expected Input Format:**
```json
{
  "message": "Pertanyaan user",
  "sessionId": "uuid-session-id"
}
```

---

### 2. AI Agent Node

**Type:** `@n8n/n8n-nodes-langchain.agent`

**Settings:**
- **Prompt Type:** Define
- **Text:** `={{ $json.message || $json.prompt_lengkap }}`
- **System Message (di Options):**
```
Kamu adalah AURA (AI RAG UII), asisten virtual resmi Universitas Islam Indonesia (UII).

IDENTITAS:
- Nama: AURA (AI RAG UII)
- Peran: Asisten Virtual Resmi UII
- Fungsi: Membantu mahasiswa, dosen, dan staff UII

PANDUAN:
- Selalu identifikasi diri sebagai asisten resmi UII
- Gunakan bahasa Indonesia yang ramah
- Jika ditanya "apakah kamu asisten UII?", jawab: "Ya, saya adalah AURA (AI RAG UII), asisten virtual resmi Universitas Islam Indonesia."
- Gunakan Vector Store untuk informasi spesifik UII
- Gunakan Google Search untuk informasi terkini
- Ingat konteks percakapan (Memory)

Ingat: Kamu adalah asisten resmi UII, bukan asisten umum.
```

**Connected To:**
- OpenAI Chat Model
- Simple Memory
- Vector Store Tool
- Google Search Tool (optional)

---

### 3. Simple Memory Node

**Type:** `@n8n/n8n-nodes-langchain.memoryBufferWindow`

**Settings:**
- **Session ID Type:** Custom Key
- **Session Key:** `={{ $json.sessionId || 'default-session' }}`

**⚠️ PENTING:** Session key harus dinamis berdasarkan `sessionId` dari webhook, bukan hardcoded!

---

### 4. Vector Store Tool (Pinecone)

**Type:** `@n8n/n8n-nodes-langchain.toolVectorStore`

**Settings:**
- **Description:** "Asisten Mahasiswa/i Universitas Islam Indonesia, Chatbot, IM UII, Informasi Tentang UII, Personal Assistant, Teman"
- **Top K:** 5
- **Connected To:** Pinecone Vector Store + Embeddings OpenAI

---

### 5. Google Search Tool (Optional)

**Type:** `@n8n/n8n-nodes-langchain.toolGoogleSearch` atau custom tool

**Settings:**
- **Description:** "Mencari informasi terkini dari internet menggunakan Google Search"

---

### 6. Respond to Webhook Node

**Type:** `n8n-nodes-base.respondToWebhook`

**Settings:**
- **Respond With:** JSON
- **Response Body:**
```json
{
  "output": "={{ $json.output }}"
}
```

Atau jika AI Agent mengembalikan array:
```json
{
  "output": "={{ $json[0].json.output || $json[0].json.text || $json.output }}"
}
```

---

## Flow Diagram

```
Webhook Trigger
    ↓
AI Agent (dengan System Prompt)
    ├─→ OpenAI Chat Model
    ├─→ Simple Memory (sessionId dinamis)
    ├─→ Vector Store Tool
    │   ├─→ Pinecone Vector Store
    │   └─→ Embeddings OpenAI
    └─→ Google Search Tool (optional)
    ↓
Respond to Webhook
```

---

## Testing

Setelah setup, test dengan:

**Request:**
```bash
curl -X POST https://your-ngrok-url/webhook/auraragsuii \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Apakah kamu asisten UII?",
    "sessionId": "test-session-123"
  }'
```

**Expected Response:**
```json
{
  "output": "Ya, saya adalah AURA (AI RAG UII), asisten virtual resmi Universitas Islam Indonesia. Saya siap membantu Anda dengan informasi tentang UII."
}
```

---

## Troubleshooting

### AI masih jawab "bukan asisten resmi"
- **Cek:** System Message sudah ditambahkan di AI Agent node?
- **Cek:** System Message muncul di Options, bukan di Text field

### Memory tidak bekerja
- **Cek:** Session Key menggunakan `$json.sessionId` (dinamis)
- **Cek:** Setiap request mengirim `sessionId` yang sama untuk session yang sama

### Webhook tidak merespons
- **Cek:** Response Mode = "Respond to Webhook"
- **Cek:** Ada node "Respond to Webhook" di akhir flow

