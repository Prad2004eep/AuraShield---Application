# Analyze URL Feature

This feature lets analysts paste any post/video/article URL and create a new alert after Gemini classification.

## Client workflow
- Dashboard → tap + (Add Evidence)
- Choose "Paste URL"
- Enter a URL (Twitter/X, YouTube, or generic web article)
- The client calls POST /analyze-url on the backend via apiService.analyzeUrl(url)
- On success, the normalized AlertItem is inserted and the app navigates to Case Details
- If live backend is disabled, the app falls back to a placeholder mock alert

## Backend workflow
- POST /analyze-url { url, vip? }
- The server fetches the URL (axios), parses OG tags (cheerio) to extract title/description/image
- Calls Gemini 2.0 Flash with the extracted text to classify type/severity/title/description/confidence
- Returns an AlertItem JSON compatible with the client

## Env
- EXPO_PUBLIC_USE_LIVE_API=true and EXPO_PUBLIC_API_BASE_URL=http://localhost:4000 (client)
- TWITTER_BEARER_TOKEN, YOUTUBE_API_KEY, GEMINI_API_KEY (server)

