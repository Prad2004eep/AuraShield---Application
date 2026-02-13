# Live Data Toggle (Backend vs Mock)

Aura Shield supports switching between local mock data and live backend data at runtime.

## Client env (Expo)
Set in app config or shell before starting Expo:

- EXPO_PUBLIC_USE_LIVE_API=true
- EXPO_PUBLIC_API_BASE_URL=http://localhost:4000

When false or unset, the app falls back to mockApi service.

## Backend
See server/README.md to run the Express backend. Populate .env with:
- TWITTER_BEARER_TOKEN (Twitter/X v2 Bearer token)
- YOUTUBE_API_KEY (YouTube Data API v3)
- GEMINI_API_KEY (Google Generative Language)

## Screens using live data
- Alerts tab: fetches /alerts (empty vip by default; adapt to selected VIP)
- Dashboard: uses live alerts for "Recent Alerts" when enabled
- Image upload: client can continue using the existing flow; to route via backend, call apiService.uploadImage

