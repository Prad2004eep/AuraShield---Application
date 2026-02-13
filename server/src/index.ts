import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fetchTwitterMentions, fetchYouTubeMentions, fetchUrlContent, extractPlatformAndIds, fetchTweetById, fetchYouTubeVideoById } from './sources.js';
import { analyzeWithGemini } from './gemini.js';
import type { AlertItem } from './types.js';

const app = express();
app.use(cors({ origin: (process.env.CORS_ORIGIN || '*').split(',') }));
app.use(express.json({ limit: '2mb' }));
const upload = multer();

function normalizeTweetToAlert(t: any, vipName: string, analysis: any): AlertItem {
  return {
    id: String(t.id),
    title: analysis.title || `Tweet mentioning ${vipName}`,
    description: analysis.description || (t.text || ''),
    severity: analysis.severity || 'medium',
    vipName,
    source: 'Twitter',
    timestamp: t.created_at || new Date().toISOString(),
    confidence: analysis.confidence ?? 0.6,
    type: analysis.type || 'threat',
  };
}

function normalizeVideoToAlert(v: any, vipName: string, analysis: any): AlertItem {
  const sn = v.snippet || {};
  return {
    id: String(v.id?.videoId || v.id),
    title: analysis.title || (sn.title || `Video mentioning ${vipName}`),
    description: analysis.description || (sn.description || ''),
    severity: analysis.severity || 'medium',
    vipName,
    source: 'YouTube',
    timestamp: sn.publishedAt || new Date().toISOString(),
    confidence: analysis.confidence ?? 0.6,
    type: analysis.type || 'threat',
  };
}

app.get('/alerts', async (req, res) => {
  try {
    const vip = String(req.query.vip || '').trim();
    if (!vip) return res.status(400).json({ error: 'vip is required' });

    const twKey = process.env.TWITTER_BEARER_TOKEN || '';
    const ytKey = process.env.YOUTUBE_API_KEY || '';
    if (!twKey || !ytKey) {
      return res.status(500).json({ error: 'Server not configured for Twitter/YouTube' });
    }

    const [tw, yt] = await Promise.all([
      fetchTwitterMentions(vip, twKey).catch(() => ({ data: [] })),
      fetchYouTubeMentions(vip, ytKey).catch(() => ({ items: [] })),
    ]);

    const twitterAlerts: AlertItem[] = [];
    for (const t of (tw.data || [])) {
      const text = t.text || '';
      const analysis = await analyzeWithGemini({ text, vipName: vip, platform: 'Twitter' }).catch(() => ({ platform: 'Twitter', type: 'threat', title: 'Potential threat', description: text, severity: 'medium', vipName: vip, source: 'Twitter', confidence: 0.6 }));
      twitterAlerts.push(normalizeTweetToAlert(t, vip, analysis));
    }

    const youtubeAlerts: AlertItem[] = [];
    for (const v of (yt.items || [])) {
      const text = `${v.snippet?.title || ''}\n${v.snippet?.description || ''}`.trim();
      const analysis = await analyzeWithGemini({ text, vipName: vip, platform: 'YouTube' }).catch(() => ({ platform: 'YouTube', type: 'threat', title: 'Potential threat', description: text, severity: 'medium', vipName: vip, source: 'YouTube', confidence: 0.6 }));
      youtubeAlerts.push(normalizeVideoToAlert(v, vip, analysis));
    }

    const alerts: AlertItem[] = [...twitterAlerts, ...youtubeAlerts]
      .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));

    res.json(alerts);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Internal error' });
  }
});

app.post('/analyze-image', upload.single('image'), async (req, res) => {
  try {
    const vip = String(req.body.vip || 'Unknown');
    const analysis = await analyzeWithGemini({ text: 'User-uploaded evidence', vipName: vip, platform: 'User Upload' });
    const alert: AlertItem = {
      id: String(Date.now()),
      title: analysis.title,
      description: analysis.description,
      severity: analysis.severity,
      vipName: analysis.vipName,
      source: analysis.source,
      timestamp: new Date().toISOString(),
      confidence: analysis.confidence,
      type: analysis.type as any,
    };
    res.json(alert);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Internal error' });
  }
});

app.post('/analyze-url', async (req, res) => {
  try {
    const url = String(req.body.url || '').trim();
    const vip = String(req.body.vip || 'Unknown');
    if (!url) return res.status(400).json({ error: 'url is required' });

    const twKey = process.env.TWITTER_BEARER_TOKEN || '';
    const ytKey = process.env.YOUTUBE_API_KEY || '';

    const parsed = extractPlatformAndIds(url);

    if (parsed.platform === 'Twitter' && parsed.tweetId && twKey) {
      const t: any = await fetchTweetById(parsed.tweetId, twKey).catch(() => null);
      const text = t?.data?.text || url;
      const analysis = await analyzeWithGemini({ text, vipName: vip, platform: 'Twitter' })
        .catch(() => ({ platform: 'Twitter', type: 'threat', title: 'Potential threat', description: text, severity: 'medium', vipName: vip, source: 'Twitter', confidence: 0.6 }));
      const alert: AlertItem = {
        id: String(parsed.tweetId),
        title: analysis.title || `Tweet mentioning ${vip}`,
        description: analysis.description || text,
        severity: (analysis.severity as any) || 'medium',
        vipName: analysis.vipName || vip,
        source: 'Twitter',
        timestamp: new Date().toISOString(),
        confidence: analysis.confidence ?? 0.6,
        type: (analysis.type as any) || 'threat',
      };
      return res.json(alert);
    }

    if (parsed.platform === 'YouTube' && parsed.videoId && ytKey) {
      const v: any = await fetchYouTubeVideoById(parsed.videoId, ytKey).catch(() => null);
      const sn = v?.items?.[0]?.snippet || {};
      const text = `${sn.title || ''}\n${sn.description || ''}`.trim() || url;
      const analysis = await analyzeWithGemini({ text, vipName: vip, platform: 'YouTube' })
        .catch(() => ({ platform: 'YouTube', type: 'threat', title: 'Potential threat', description: text, severity: 'medium', vipName: vip, source: 'YouTube', confidence: 0.6 }));
      const alert: AlertItem = {
        id: String(parsed.videoId),
        title: analysis.title || sn.title || 'Video mentioning VIP',
        description: analysis.description || text,
        severity: (analysis.severity as any) || 'medium',
        vipName: analysis.vipName || vip,
        source: 'YouTube',
        timestamp: sn.publishedAt || new Date().toISOString(),
        confidence: analysis.confidence ?? 0.6,
        type: (analysis.type as any) || 'threat',
      };
      return res.json(alert);
    }

    // Generic web URL fallback: try basic OG parsing then Gemini
    const generic = await fetchUrlContent(url);
    const analysis = await analyzeWithGemini({ text: `${generic.title ? generic.title + '\n' : ''}${generic.text}`, vipName: vip, platform: generic.platform })
      .catch(() => ({ platform: generic.platform, type: 'threat', title: generic.title || 'Potential threat', description: generic.text || url, severity: 'medium', vipName: vip, source: generic.platform, confidence: 0.6 }));

    const alert: AlertItem = {
      id: String(Date.now()),
      title: analysis.title || generic.title || 'Analyzed URL',
      description: analysis.description || generic.text || url,
      severity: (analysis.severity as any) || 'medium',
      vipName: analysis.vipName || vip,
      source: analysis.source || generic.platform,
      timestamp: new Date().toISOString(),
      confidence: analysis.confidence ?? 0.6,
      type: (analysis.type as any) || 'threat',
    };

    res.json(alert);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Internal error' });
  }
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`Aura Shield backend listening on http://localhost:${port}`);
});

