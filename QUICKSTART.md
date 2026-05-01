# 🚀 PI_AI Quick Start Guide

## Setup (2 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Keys

Copy the example and add your keys:
```bash
cp .env.example .env
```

Edit `.env` with your API credentials:
```env
# Mistral AI (for chat)
LLM_PROVIDER=mistral
MISTRAL_API_KEY=your-mistral-api-key-here
MISTRAL_API_ID=your-api-id-here
MISTRAL_MODEL=mistral-large-latest

# Apify Sherlock (for username search)
APIFY_API_TOKEN=your-apify-token-here
```

### 3. Start the Server
```bash
npm start
```

Output should show:
```
🚀 PI_AI Local Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Server running at http://localhost:3000
✅ API Key: Configured
✅ Apify Token: Configured
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 4. Open the UI
- **Chat Interface**: http://localhost:3000/ui.html
- **API Docs**:
  - `POST /chat` - Send messages
  - `POST /sherlock` - Username search
  - `GET /health` - Health check

---

## API Endpoints

### Chat with Mistral AI
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How are you doing today?"}'
```

### Search Usernames with Sherlock
```bash
curl -X POST http://localhost:3000/sherlock \
  -H "Content-Type: application/json" \
  -d '{"usernames": ["johndoe"]}'
```

---

## Configuration Reference

| Provider | Env Variable | Required |
|----------|---|---|
| **Mistral AI** | `MISTRAL_API_KEY` | Yes (if using Mistral) |
| **Mistral API ID** | `MISTRAL_API_ID` | Optional |
| **Apify Token** | `APIFY_API_TOKEN` | Yes (for Sherlock) |

---

## Security Notes

⚠️ **Never commit `.env`** - it's in `.gitignore`

🔐 **Rotate keys regularly** if exposed

📌 **Keep `.env.example` clean** - no real secrets there

---

## Troubleshooting

### "API Key not configured"
Make sure `.env` file exists and has `MISTRAL_API_KEY` set.

### Error 502 from Mistral
Check your internet connection and API key validity.

### Sherlock returns empty results
Ensure `APIFY_API_TOKEN` is valid and the username exists on public platforms.

---

## What's This Tool?

**PI_AI** = Trauma-informed AI support with optional technical utilities

**Features:**
- 🤖 Chat with Mistral AI (trauma-informed responses)
- 🔍 Sherlock tool (username reconnaissance for safety)
- 💜 Dignity-first design (user-led, consent-based)

See [README.md](README.md) for full philosophy and protocols.
