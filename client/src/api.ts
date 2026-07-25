import type { Wallet } from './types';
const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(path, { headers: { 'Content-Type': 'application/json', ...options?.headers }, ...options });
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('The wallet service returned an unexpected response. Restart the app so the API server loads the latest routes.');
  }
  const body = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(body.error || 'Something went wrong.');
  return body;
};
export const api = {
  wallet: () => request<Wallet>('/api/pinch/wallet'),
  connectWallet: (creditCardToken: string) => request<{ success: boolean; payerId: string; walletConnected: boolean }>('/api/pinch/connect-wallet', { method: 'POST', body: JSON.stringify({ creditCardToken }) }),
  updateWalletRules: (dailyLimitCents: number, autoApproveCents: number) => request<Wallet>('/api/pinch/wallet', { method: 'PATCH', body: JSON.stringify({ dailyLimitCents, autoApproveCents }) }),
  purchase: () => request<{ success: boolean; wallet: { todaySpendCents: number; remainingCents: number } }>('/api/agent/purchase-premium', { method: 'POST' })
};
