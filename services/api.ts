import { Alert as AlertItem } from '@/types/alert';
import { mockApiService } from './mockApi';

const USE_LIVE_API = process.env.EXPO_PUBLIC_USE_LIVE_API === 'true';
const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export interface AlertsResponse { alerts: AlertItem[]; total: number }

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const resp = await fetch(url, init);
  if (!resp.ok) throw new Error(`Request failed: ${resp.status}`);
  return resp.json();
}

function normalizeAlert(a: Partial<AlertItem> & any, vipFallback?: string): AlertItem {
  return {
    id: String(a.id || Date.now()),
    title: a.title || 'New threat detected',
    description: a.description || '',
    severity: (a.severity as any) || 'medium',
    vipName: a.vipName || vipFallback || 'Unknown',
    source: a.source || 'Unknown',
    timestamp: a.timestamp || new Date().toISOString(),
    confidence: Math.max(0, Math.min(1, Number(a.confidence ?? 0.6))),
    type: (a.type as any) || 'threat',
  };
}

export const apiService = {
  useLive: () => USE_LIVE_API,

  async getAlerts(vipName: string, opts?: { limit?: number; search?: string; severity?: string }): Promise<AlertsResponse> {
    if (!USE_LIVE_API) {
      // Fallback to mock
      const res = await mockApiService.getAlerts({ limit: opts?.limit, severity: opts?.severity, search: opts?.search });
      return res;
    }

    const params = new URLSearchParams();
    if (vipName) params.set('vip', vipName);
    if (opts?.search) params.set('q', opts.search);
    if (opts?.severity) params.set('severity', opts.severity);
    if (opts?.limit) params.set('limit', String(opts.limit));

    const data = await fetchJSON<AlertItem[]>(`${API_BASE}/alerts?${params.toString()}`);

    const alerts = data.map((a) => normalizeAlert(a, vipName));
    try { await mockApiService.importAlerts(alerts); } catch {}
    return { alerts: opts?.limit ? alerts.slice(0, opts.limit) : alerts, total: alerts.length };
  },

  async uploadImage(imageUri: string): Promise<AlertItem> {
    if (!USE_LIVE_API) {
      throw new Error('Live API disabled');
    }

    const form = new FormData();
    // @ts-ignore - RN FormData file
    form.append('image', { uri: imageUri, name: 'evidence.jpg', type: 'image/jpeg' });

    const resp = await fetch(`${API_BASE}/analyze-image`, { method: 'POST', body: form as any });
    if (!resp.ok) throw new Error(`Analyze failed: ${resp.status}`);
    const alert = await resp.json();

    const normalized = normalizeAlert(alert);
    try { await mockApiService.importAlerts([normalized]); } catch {}
    return normalized;
  },

  async analyzeUrl(url: string, vip?: string): Promise<AlertItem> {
    if (!USE_LIVE_API) throw new Error('Live API disabled');
    const resp = await fetch(`${API_BASE}/analyze-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, vip }),
    });
    if (!resp.ok) throw new Error(`Analyze URL failed: ${resp.status}`);
    const data = await resp.json();
    const normalized = normalizeAlert(data, vip);
    try { await mockApiService.importAlerts([normalized]); } catch {}
    return normalized;
  },
};

