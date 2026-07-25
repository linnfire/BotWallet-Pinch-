import crypto from 'node:crypto';
import type { PinchPayer, PinchSource } from './types.js';

const authUrl = 'https://auth.getpinch.com.au/connect/token';
const apiBase = () => `https://api.getpinch.com.au/${process.env.PINCH_ENV === 'live' ? 'live' : 'test'}`;

function credentials() {
  const clientId = process.env.PINCH_CLIENT_ID;
  const clientSecret = process.env.PINCH_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('Pinch credentials are not configured. Set PINCH_CLIENT_ID and PINCH_CLIENT_SECRET.');
  return { clientId, clientSecret };
}

async function accessToken(): Promise<string> {
  const { clientId, clientSecret } = credentials();
  const body = new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret });
  const response = await fetch(authUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  if (!response.ok) throw new PinchError(response.status, 'Pinch authentication failed.');
  const payload = await response.json() as { access_token?: string };
  if (!payload.access_token) throw new Error('Pinch did not return an access token.');
  return payload.access_token;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const token = await accessToken();
  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'pinch-version': '2020.1', 'Content-Type': 'application/json', ...init.headers }
  });
  if (!response.ok) {
    const message = await response.text();
    throw new PinchError(response.status, message || 'Pinch rejected the request.');
  }
  return response.json() as Promise<T>;
}

export class PinchError extends Error { constructor(public status: number, message: string) { super(message); } }

export async function createPayer(profile: { firstName: string; lastName: string; emailAddress: string }): Promise<PinchPayer> {
  return request<PinchPayer>('/payers', { method: 'POST', body: JSON.stringify(profile) });
}

export async function addCreditCardSource(payerId: string, creditCardToken: string): Promise<PinchSource> {
  // CaptureJS token is short-lived; only this token, never card data, reaches this service.
  return request<PinchSource>(`/payers/${encodeURIComponent(payerId)}/sources`, {
    method: 'POST', body: JSON.stringify({ sourceType: 'credit-card', token: creditCardToken })
  });
}

export async function createRealtimePayment(payerId: string, sourceId: string, amount: number, description: string) {
  return request<{ id: string; status?: string }>('/payments/realtime', {
    method: 'POST',
    body: JSON.stringify({ payerId, sourceId, amount, description, nonce: crypto.randomUUID() })
  });
}
