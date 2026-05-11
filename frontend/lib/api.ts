import { AuthSession, HistoryItem, ScanResult } from './types';
import { getAuthToken } from './auth';

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'https://truth-shield-ai.onrender.com';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? getAuthToken() : null;
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function analyzeFakeNews(payload: { title: string; text: string; source_url?: string; language?: string }) {
  return request<ScanResult>('/api/fakenews/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function registerUser(payload: { full_name: string; email: string; password: string; locale?: string; is_admin?: boolean; admin_secret?: string }) {
  return request<AuthSession>('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload: { email: string; password: string }) {
  return request<AuthSession>('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function analyzeDeepfake(kind: 'image' | 'video' | 'audio', file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return request<ScanResult>(`/api/deepfake/${kind}`, {
    method: 'POST',
    body: formData,
  });
}

export function getHistory(search?: string, scanType?: string) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (scanType) params.set('scan_type', scanType);
  const query = params.toString();
  return request<{ items: HistoryItem[] }>(`/api/history${query ? `?${query}` : ''}`);
}

export function updateProfile(payload: { full_name: string; locale: string }) {
  return request<{ id: string; full_name: string; email: string; locale: string; is_admin: boolean; created_at: string }>('/api/auth/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function changePassword(payload: { current_password: string; new_password: string }) {
  return request<{ message: string }>('/api/auth/password', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function getAdminUsers() {
  return request<{ items: Array<{ id: string; full_name: string; email: string; is_admin: boolean; locale: string; created_at: string }> }>('/api/admin/users');
}

export function getAdminStats() {
  return request<{
    total_users: number;
    total_scans: number;
    fake_news_scans: number;
    deepfake_scans: number;
    average_accuracy: number;
    recent_activity: HistoryItem[];
    model_metrics: Array<{ name: string; accuracy: number; precision: number; recall: number; f1: number }>;
  }>('/api/admin/stats');
}
