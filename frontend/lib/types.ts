export type ScanResult = {
  label: 'Fake' | 'Real';
  confidence: number;
  risk_score: number;
  summary: string;
  explanation: string[];
  similar_links?: string[];
  frame_scores?: number[];
  regions?: Array<{ region: string; score: number }>;
  audio_insights?: Record<string, unknown>;
};

export type HistoryItem = {
  id: string;
  user_email: string;
  scan_type: string;
  input_type: string;
  title: string;
  summary: string;
  risk_score: number;
  confidence: number;
  label: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type User = {
  id: string;
  full_name: string;
  email: string;
  locale: string;
  is_admin: boolean;
  created_at: string;
};

export type AuthSession = {
  access_token: string;
  token_type: string;
  user: User;
};
