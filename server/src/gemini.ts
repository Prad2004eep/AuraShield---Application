import fetch from 'node-fetch';

export interface GeminiResult {
  platform: string;
  type: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  vipName: string;
  source: string;
  confidence: number;
}

function normalizeType(t?: string) {
  const s = (t || '').toLowerCase();
  if (s.includes('deepfake')) return 'deepfake';
  if (s.includes('imperson')) return 'impersonation';
  if (s.includes('media') && s.includes('reuse')) return 'media_reuse';
  if (s.includes('brand')) return 'brand_impersonation';
  if (s.includes('misinfo') || s.includes('misinformation') || s.includes('fake news')) return 'misinformation';
  if (s.includes('coord')) return 'coordination';
  return 'threat';
}

function normalizeSeverity(t?: string): 'high' | 'medium' | 'low' {
  const s = (t || '').toLowerCase();
  if (s.startsWith('h')) return 'high';
  if (s.startsWith('l')) return 'low';
  return 'medium';
}

export async function analyzeWithGemini(input: { text: string; imageUrl?: string; vipName: string; platform: string }) {
  const key = process.env.GEMINI_API_KEY || '';
  if (!key) throw new Error('GEMINI_API_KEY missing');

  const prompt = `You are Aura Shield's security analyst. Classify the following content and return ONLY compact JSON with keys: platform, type, title, description, severity, vipName, source, confidence (0..1). Keep title/description concise.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
  const parts: any[] = [ { text: prompt + "\n\nContent:" }, { text: input.text } ];
  if (input.imageUrl) {
    parts.push({ text: '\nImage:' });
    parts.push({ inline_data: { mime_type: 'image/jpeg', data: '' } }); // URL fetch not supported; prompt uses thumbnail URL in text
  }

  const body = {
    contents: [ { parts } ],
    generationConfig: { temperature: 0.2, maxOutputTokens: 512 },
  } as any;

  const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!resp.ok) throw new Error(`Gemini request failed: ${resp.status}`);
  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;
  if (!text) throw new Error('No content from Gemini');

  const match = text.match(/\{[\s\S]*\}/);
  const parsed = match ? JSON.parse(match[0]) : JSON.parse(text);
  const result: GeminiResult = {
    platform: parsed.platform || input.platform,
    type: normalizeType(parsed.type),
    title: String(parsed.title || 'New threat detected'),
    description: String(parsed.description || 'Potential VIP-related threat identified.'),
    severity: normalizeSeverity(parsed.severity),
    vipName: String(parsed.vipName || input.vipName),
    source: String(parsed.source || parsed.platform || input.platform),
    confidence: Math.max(0, Math.min(1, Number(parsed.confidence ?? 0.6))),
  };
  return result;
}

