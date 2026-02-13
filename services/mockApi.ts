import { Alert } from "@/types/alert";

interface DashboardStats {
  activeThreats: number;
  monitoredVips: number;
  resolvedCases: number;
  detectionRate: number;
}

interface AlertsResponse {
  alerts: Alert[];
  total: number;
}

type Subscriber = () => void;

interface NetworkGraph {
  nodes: {
    id: string;
    label: string;
    type: "account" | "post" | "media";
    suspicious: boolean;
    index: number;
  }[];
  edges: {
    source: string;
    target: string;
    weight: number;
  }[];
  clusters: {
    id: string;
    name: string;
    description: string;
    riskLevel: "high" | "medium" | "low";
    nodeCount: number;
    edgeCount: number;
  }[];
}

interface CaseDetails {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  vipName: string;
  source: string;
  timestamp: string;
  status: string;
  confidence: number;
  analysis: string;
  evidence: {
    type: string;
    description: string;
    screenshot?: string;
    timestamp: string;
    confidence: number;
    metadata?: {
      location?: string;
      platform?: string;
      author?: string;
    };
  }[];
}

let mockAlerts: Alert[] = [
  {
    id: "1",
    title: "Impersonation Account Detected",
    description: "Suspicious account @john_doe_official mimicking verified VIP with 95% profile similarity. Account created 2 days ago with stolen profile image from official social media.",
    severity: "high",
    vipName: "John Doe",
    source: "Twitter",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    confidence: 0.95,
    type: "impersonation",
  },
  {
    id: "2",
    title: "Coordinated Campaign Detected",
    description: "15 bot accounts posting identical malicious content targeting Jane Smith with phishing links. Detected coordinated inauthentic behavior patterns across multiple platforms.",
    severity: "high",
    vipName: "Jane Smith",
    source: "Instagram",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    confidence: 0.87,
    type: "coordination",
  },
  {
    id: "3",
    title: "Media Reuse Alert",
    description: "Official corporate headshot from Tech CEO's verified LinkedIn account reused in fake breaking news post claiming company bankruptcy and stock manipulation.",
    severity: "medium",
    vipName: "Tech CEO",
    source: "LinkedIn",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    confidence: 0.78,
    type: "media_reuse",
  },
  {
    id: "4",
    title: "Threat Keywords Detected",
    description: "Multiple posts containing threatening language and harassment directed at VIP detected across Twitter, Instagram, and TikTok platforms.",
    severity: "high",
    vipName: "John Doe",
    source: "Multiple",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    confidence: 0.82,
    type: "threat",
  },
  {
    id: "5",
    title: "Misinformation Campaign",
    description: "False claims about Jane Smith's company financial status spreading across social media with coordinated hashtag usage #JaneSmithScam #CompanyFraud.",
    severity: "medium",
    vipName: "Jane Smith",
    source: "Twitter",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    confidence: 0.73,
    type: "misinformation",
  },
  {
    id: "6",
    title: "Deepfake Video Detection",
    description: "AI-generated deepfake video of Celebrity VIP making controversial political statements detected on TikTok and YouTube. High-quality facial manipulation detected.",
    severity: "high",
    vipName: "Celebrity VIP",
    source: "TikTok",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    confidence: 0.91,
    type: "deepfake",
  },
  {
    id: "7",
    title: "Brand Impersonation Scam",
    description: "Fake customer service accounts impersonating Tech CEO's company brand to steal customer credentials through phishing messages.",
    severity: "medium",
    vipName: "Tech CEO",
    source: "Facebook",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    confidence: 0.84,
    type: "brand_impersonation",
  },
];

const mockNetworkGraph: NetworkGraph = {
  nodes: [
    { id: "1", label: "@fake_john_doe", type: "account", suspicious: true, index: 0 },
    { id: "2", label: "Impersonation Post", type: "post", suspicious: true, index: 1 },
    { id: "3", label: "Stolen Profile Pic", type: "media", suspicious: true, index: 2 },
    { id: "4", label: "@bot_network_1", type: "account", suspicious: true, index: 3 },
    { id: "5", label: "@bot_network_2", type: "account", suspicious: true, index: 4 },
    { id: "6", label: "Coordinated Spam", type: "post", suspicious: true, index: 5 },
    { id: "7", label: "@jane_smith_fake", type: "account", suspicious: true, index: 6 },
    { id: "8", label: "Deepfake Video", type: "media", suspicious: true, index: 7 },
    { id: "9", label: "Phishing Link", type: "post", suspicious: true, index: 8 },
    { id: "10", label: "@legitimate_user", type: "account", suspicious: false, index: 9 },
  ],
  edges: [
    { source: "1", target: "2", weight: 0.9 },
    { source: "2", target: "3", weight: 0.8 },
    { source: "4", target: "6", weight: 0.7 },
    { source: "5", target: "6", weight: 0.7 },
    { source: "1", target: "4", weight: 0.6 },
    { source: "7", target: "8", weight: 0.85 },
    { source: "4", target: "9", weight: 0.75 },
    { source: "5", target: "9", weight: 0.75 },
    { source: "1", target: "7", weight: 0.5 },
  ],
  clusters: [
    {
      id: "cluster1",
      name: "John Doe Impersonation Network",
      description: "Sophisticated impersonation campaign targeting John Doe with stolen media and coordinated posting",
      riskLevel: "high",
      nodeCount: 6,
      edgeCount: 8,
    },
    {
      id: "cluster2",
      name: "Jane Smith Bot Campaign",
      description: "Automated bot network spreading misinformation about Jane Smith's company using deepfake content",
      riskLevel: "high",
      nodeCount: 4,
      edgeCount: 5,
    },
    {
      id: "cluster3",
      name: "Phishing Operation",
      description: "Coordinated phishing campaign using fake customer service accounts to steal credentials",
      riskLevel: "medium",
      nodeCount: 3,
      edgeCount: 4,
    },
  ],
};

// AI Analysis Service using Gemini API
const analyzeWithAI = async (content: string, type: string): Promise<string> => {
  try {
    const response = await fetch('https://toolkit.rork.com/text/llm/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `You are an AI security analyst for Aura Shield, a VIP protection platform. Analyze the following ${type} threat and provide a concise security assessment with 3 bullet points: risk level, potential impact, and recommended actions.`
          },
          {
            role: 'user',
            content: content
          }
        ]
      })
    });

    const data = await response.json();
    const text = data.completion || '';
    if (!text) return '• AI analysis unavailable.\n• Using fallback.\n• Review evidence manually.';
    // Clean stray markdown asterisks and return
    return String(text).replace(/\*+/g, '').trim();
  } catch (error) {
    console.error('AI Analysis error:', error);
    return '• AI analysis unavailable.\n• Using fallback.\n• Review evidence manually.';
  }
};

// Simple subscription so UI can refresh when alerts change
const subscribers: Subscriber[] = [];
export function subscribeMockAlerts(cb: Subscriber) {
  subscribers.push(cb);
  return () => {
    const idx = subscribers.indexOf(cb);
    if (idx >= 0) subscribers.splice(idx, 1);
  };
}
function notify() {
  subscribers.forEach((cb) => {
    try { cb(); } catch {}
  });
}

// Keep user-uploaded evidence screenshots here keyed by alert id
const evidenceImages: Record<string, string | undefined> = {};

export const mockApiService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      activeThreats: 18,
      monitoredVips: 12,
      resolvedCases: 63,
      detectionRate: 96,
    };
  },

  getAlerts: async (params?: {
    search?: string;
    severity?: string;
    limit?: number;
  }): Promise<AlertsResponse> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    let filteredAlerts = [...mockAlerts];

    if (params?.search) {
      filteredAlerts = filteredAlerts.filter(alert =>
        alert.title.toLowerCase().includes(params.search!.toLowerCase()) ||
        alert.description.toLowerCase().includes(params.search!.toLowerCase()) ||
        alert.vipName.toLowerCase().includes(params.search!.toLowerCase())
      );
    }

    if (params?.severity && params.severity !== "all") {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === params.severity);
    }

    if (params?.limit) {
      filteredAlerts = filteredAlerts.slice(0, params.limit);
    }

    return {
      alerts: filteredAlerts,
      total: filteredAlerts.length,
    };
  },

  addAlertFromGemini: async (gemini: {
    platform: string;
    type: Alert['type'];
    title: string;
    description: string;
    severity: Alert['severity'];
    vipName: string;
    source: string;
    confidence: number;
    imageUri?: string;
  }): Promise<Alert> => {
    const id = (mockAlerts.length + 1).toString();
    const newAlert: Alert = {
      id,
      title: gemini.title,
      description: gemini.description,
      severity: gemini.severity,
      vipName: gemini.vipName,
      source: gemini.source || gemini.platform || 'Unknown',
      timestamp: new Date().toISOString(),
      confidence: Math.max(0, Math.min(1, gemini.confidence ?? 0.7)),
      type: gemini.type,
    };
    // Map uploaded image to this alert id so Case Details can show it
    if (gemini.imageUri) evidenceImages[id] = gemini.imageUri;
    mockAlerts.unshift(newAlert);
    notify();
    return newAlert;
  },

  resolveAlert: async (id: string): Promise<void> => {
    const idx = mockAlerts.findIndex(a => a.id === id);
    if (idx !== -1) {
      mockAlerts.splice(idx, 1);
      notify();
    }
  },

  getCaseDetails: async (id: string): Promise<CaseDetails> => {
    await new Promise(resolve => setTimeout(resolve, 400));

    const alert = mockAlerts.find(a => a.id === id);
    if (!alert) {
      throw new Error("Case not found");
    }

    return {
      id: alert.id,
      title: alert.title,
      description: alert.description,
      severity: alert.severity,
      vipName: alert.vipName,
      source: alert.source,
      timestamp: alert.timestamp,
      status: "Under Investigation",
      confidence: alert.confidence,
      analysis: await analyzeWithAI(
        `Alert: ${alert.title}\nDescription: ${alert.description}\nTarget: ${alert.vipName}\nSource: ${alert.source}\nConfidence: ${alert.confidence}`,
        alert.type
      ),
      evidence: [
        {
          type: "Screenshot",
          description: "Fake profile page showing stolen imagery and bio information",
          screenshot: evidenceImages[alert.id] || (
                     alert.type === "impersonation" ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop" :
                     alert.type === "coordination" ? "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop" :
                     alert.type === "media_reuse" ? "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop" :
                     alert.type === "deepfake" ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=300&fit=crop" :
                     "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop"
          ),
          timestamp: alert.timestamp,
          confidence: 0.95,
          metadata: {
            platform: alert.source,
            location: "Global",
            author: "Unknown",
          },
        },
        {
          type: "Content Analysis",
          description: "Text similarity analysis showing 87% match with legitimate VIP content",
          timestamp: alert.timestamp,
          confidence: 0.87,
          metadata: {
            platform: alert.source,
          },
        },
        {
          type: "Network Analysis",
          description: "Connection patterns indicating coordinated inauthentic behavior",
          timestamp: alert.timestamp,
          confidence: 0.82,
        },
      ],
    };
  },

  getNetworkGraph: async (): Promise<NetworkGraph> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return mockNetworkGraph;
  },

  importAlerts: async (incoming: Alert[]): Promise<void> => {
    const existing = new Set(mockAlerts.map(a => a.id));
    const toAdd = incoming.filter(a => !existing.has(a.id));
    if (toAdd.length) {
      mockAlerts = [...toAdd, ...mockAlerts];
      notify();
    }
  },
};