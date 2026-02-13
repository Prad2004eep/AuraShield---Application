# Aura Shield Backend (Node + Express)

Provides real-time alerts from Twitter + YouTube and Gemini analysis for the Aura Shield client.

## Endpoints
- GET /alerts?vip=Elon%20Musk → AlertItem[]
- POST /analyze-image (multipart/form-data: image) → AlertItem

## Environment
Copy .env.example to .env and fill in keys:
- PORT=4000
- TWITTER_BEARER_TOKEN=... (Twitter/X API v2 Bearer Token)
- YOUTUBE_API_KEY=... (YouTube Data API v3)
- GEMINI_API_KEY=... (Google Generative Language)

## Development
```
cd server
npm install
npm run dev
```
Server runs at http://localhost:4000.

## Notes
- The server normalizes external data into the client's AlertItem schema.
- Secrets live only on the server; the client uses EXPO_PUBLIC_API_BASE_URL and EXPO_PUBLIC_USE_LIVE_API to call it.

