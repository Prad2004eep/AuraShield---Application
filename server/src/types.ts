export type Severity = 'high' | 'medium' | 'low';
export type ThreatType = 'impersonation' | 'coordination' | 'media_reuse' | 'threat' | 'misinformation' | 'deepfake' | 'brand_impersonation';

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  vipName: string;
  source: string;
  timestamp: string;
  confidence: number; // 0..1
  type: ThreatType;
}

