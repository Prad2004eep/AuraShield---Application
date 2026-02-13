export interface Alert {
    id: string;
    title: string;
    description: string;
    severity: "high" | "medium" | "low";
    vipName: string;
    source: string;
    timestamp: string;
    confidence: number;
    type: "impersonation" | "coordination" | "media_reuse" | "threat" | "misinformation" | "deepfake" | "brand_impersonation";
  }