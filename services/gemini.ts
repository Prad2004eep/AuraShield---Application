import * as FileSystem from 'expo-file-system';

export type GeminiThreatType =
  | 'impersonation'
  | 'coordination'
  | 'media_reuse'
  | 'threat'
  | 'misinformation'
  | 'deepfake'
  | 'brand_impersonation';

export interface GeminiResult {
  platform: string; // e.g., Twitter, Instagram
  type: GeminiThreatType; // one of allowed Alert types
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  vipName: string;
  source: string; // canonical platform/source name
  confidence: number; // 0..1
}

const FALLBACK: GeminiResult = {
  platform: 'Unknown',
  type: 'threat',
  title: 'AI assessment not available',
  description: 'We could not analyze this image right now. A generic threat case was created so you can track it.',
  severity: 'medium',
  vipName: 'Unknown',
  source: 'User Upload',
  confidence: 0.6,
};

function guessMime(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.heic') || lower.endsWith('.heif')) return 'image/heic';
  return 'image/jpeg';
}

function normalizeType(input?: string): GeminiThreatType {
  const t = (input || '').toLowerCase();
  if (t.includes('deepfake')) return 'deepfake';
  if (t.includes('imperson')) return 'impersonation';
  if (t.includes('media') && t.includes('reuse')) return 'media_reuse';
  if (t.includes('brand')) return 'brand_impersonation';
  if (t.includes('misinfo') || t.includes('misinformation') || t.includes('fake news')) return 'misinformation';
  if (t.includes('coord')) return 'coordination';
  return 'threat';
}

function normalizeSeverity(input?: string): 'high' | 'medium' | 'low' {
  const s = (input || '').toLowerCase();
  if (s.startsWith('h')) return 'high';
  if (s.startsWith('l')) return 'low';
  return 'medium';
}

export async function analyzeImageWithGemini(imageUri: string, providedBase64?: string): Promise<{ result: GeminiResult; error?: string }>
{
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return { result: FALLBACK, error: 'Missing Gemini API key' };
  }

  try {
    const base64 = providedBase64 ?? await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const mime = guessMime(imageUri);

    const prompt = `You are Aura Shield's security analyst. Inspect this image and infer the social platform and threat type.
Return ONLY JSON with keys: platform, type, title, description, severity, vipName, source, confidence.
- platform/source: name like Twitter, Instagram, Facebook, LinkedIn, TikTok, YouTube, or Unknown
- type: one of [deepfake, impersonation, threat, media_reuse, misinformation, brand_impersonation, coordination]
- severity: high|medium|low
- confidence: 0..1 float
Keep text concise.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const body = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mime,
                data: base64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 512,
      },
    } as any;

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (resp.status === 429) {
      return { result: FALLBACK, error: 'Quota exceeded' };
    }

    if (!resp.ok) {
      const msg = await resp.text().catch(() => 'request failed');
      return { result: FALLBACK, error: msg };
    }

    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;
    if (!text) {
      return { result: FALLBACK, error: 'No content' };
    }

    // Extract JSON from possible fenced blocks
    const match = text.match(/\{[\s\S]*\}/);
    const parsed = match ? JSON.parse(match[0]) : JSON.parse(text);

    const result: GeminiResult = {
      platform: parsed.platform || parsed.source || 'Unknown',
      type: normalizeType(parsed.type),
      title: String(parsed.title || 'New threat detected'),
      description: String(parsed.description || 'Potential VIP-related threat identified from uploaded evidence.'),
      severity: normalizeSeverity(parsed.severity),
      vipName: String(parsed.vipName || 'Unknown'),
      source: String(parsed.source || parsed.platform || 'User Upload'),
      confidence: Math.max(0, Math.min(1, Number(parsed.confidence ?? 0.6))),
    };

    return { result };
  } catch (err: any) {
    return { result: FALLBACK, error: err?.message || 'Unknown error' };
  }
}

