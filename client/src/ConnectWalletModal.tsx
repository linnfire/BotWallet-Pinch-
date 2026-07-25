import { FormEvent, useEffect, useState } from 'react';
import { api } from './api';
import type { CardDetails } from './types';

interface Props { onClose: () => void; onConnected: () => void; }
const captureScript = 'https://cdn.getpinch.com.au/capturejs/pinch.capture.v2.js';

export function ConnectWalletModal({ onClose, onConnected }: Props) {
  const [card, setCard] = useState<CardDetails>({ sourceType: 'credit-card', cardNumber: '', expiryMonth: '', expiryYear: '', cvc: '', cardHolderName: '' });
  const [ready, setReady] = useState(Boolean(window.Pinch));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const publishableKey = import.meta.env.VITE_PINCH_PUBLISHABLE_KEY as string | undefined;

  useEffect(() => {
    if (window.Pinch) return;
    const script = document.createElement('script');
    script.src = captureScript;
    script.integrity = 'sha384-hglYFSKC4AMA/rAQOGB3OiA8u5ri5F4qNMGgw4I+fggDSlTmPyREcj1J+VGnkAX8';
    script.crossOrigin = 'anonymous';
    script.onload = () => setReady(true);
    script.onerror = () => setError('Pinch secure card capture could not be loaded. Check your connection and try again.');
    document.head.appendChild(script);
  }, []);

  const update = (field: keyof CardDetails, value: string) => setCard((current) => ({ ...current, [field]: value }));
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!publishableKey) { setError('Wallet setup is unavailable because the Pinch publishable key is missing.'); return; }
    if (!window.Pinch || !ready) { setError('Secure card capture is still loading.'); return; }
    setSubmitting(true);
    try {
      const capture = window.Pinch.Capture({ publishableKey });
      const result = await capture.createToken(card);
      await api.connectWallet(result.token);
      onConnected();
      onClose();
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Unable to connect your wallet.'); }
    finally { setSubmitting(false); }
  }

  return <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="connect-title">
    <button className="close" onClick={onClose} aria-label="Close">×</button>
    <p className="eyebrow">PINCH SECURE CAPTURE</p><h2 id="connect-title">Connect Bot Limit</h2>
    <p className="muted">Your card details go directly to Pinch. BotWallet only receives a short-lived payment token.</p>
    <form onSubmit={submit}>
      <label>Card Number<input autoComplete="cc-number" inputMode="numeric" required value={card.cardNumber} onChange={(e) => update('cardNumber', e.target.value)} placeholder="1234 5678 9012 3456" /></label>
      <div className="form-row"><label>Expiry Month<input autoComplete="cc-exp-month" inputMode="numeric" required maxLength={2} value={card.expiryMonth} onChange={(e) => update('expiryMonth', e.target.value)} placeholder="01" /></label><label>Expiry Year<input autoComplete="cc-exp-year" inputMode="numeric" required maxLength={4} value={card.expiryYear} onChange={(e) => update('expiryYear', e.target.value)} placeholder="2028" /></label><label>CVC<input autoComplete="cc-csc" inputMode="numeric" required maxLength={4} value={card.cvc} onChange={(e) => update('cvc', e.target.value)} placeholder="123" /></label></div>
      <label>Cardholder Name<input autoComplete="cc-name" required value={card.cardHolderName} onChange={(e) => update('cardHolderName', e.target.value)} placeholder="Name on card" /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancel</button><button type="submit" disabled={submitting || !ready}>{submitting ? 'Connecting securely…' : 'Connect Wallet'}</button></div>
    </form>
  </section></div>;
}
