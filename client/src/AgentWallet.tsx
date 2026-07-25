import { FormEvent, useEffect, useState } from 'react';
import type { Wallet } from './types';

interface Props { wallet: Wallet; onConnect: () => void; onUpdateRules: (dailyLimitCents: number, autoApproveCents: number) => Promise<void>; }
const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export function AgentWallet({ wallet, onConnect, onUpdateRules }: Props) {
  const remaining = wallet.dailyLimitCents - wallet.todaySpendCents;
  const [dailyBudget, setDailyBudget] = useState((wallet.dailyLimitCents / 100).toFixed(2));
  const [autoApproveLimit, setAutoApproveLimit] = useState((wallet.autoApproveCents / 100).toFixed(2));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  useEffect(() => {
    setDailyBudget((wallet.dailyLimitCents / 100).toFixed(2));
    setAutoApproveLimit((wallet.autoApproveCents / 100).toFixed(2));
    setSuccess('');
  }, [wallet.dailyLimitCents, wallet.autoApproveCents]);

  const currentDailyBudget = (wallet.dailyLimitCents / 100).toFixed(2);
  const currentAutoApproveLimit = (wallet.autoApproveCents / 100).toFixed(2);
  const hasChanges = dailyBudget !== currentDailyBudget || autoApproveLimit !== currentAutoApproveLimit;

  async function saveRules(event: FormEvent) {
    event.preventDefault();
    const dailyLimitCents = Math.round(Number(dailyBudget) * 100);
    const autoApproveCents = Math.round(Number(autoApproveLimit) * 100);
    if (!hasChanges) {
      setSuccess('Your wallet rules are already up to date.');
      setError('');
      return;
    }
    if (!Number.isFinite(dailyLimitCents) || dailyLimitCents < 1 || !Number.isFinite(autoApproveCents) || autoApproveCents < 0) { setError('Enter a daily budget and a non-negative auto-approve limit.'); setSuccess(''); return; }
    if (autoApproveCents > dailyLimitCents) { setError('The auto-approve limit cannot exceed the daily budget.'); setSuccess(''); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      await onUpdateRules(dailyLimitCents, autoApproveCents);
      setSuccess('Bot Limit rules saved.');
    }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not save wallet rules.'); setSuccess(''); }
    finally { setSaving(false); }
  }

  return <aside className="wallet glass"><div className="wallet-title"><div><p className="eyebrow">AUTONOMOUS COMMERCE</p><h2>Bot Limit</h2><p className="wallet-subtitle">Adjust the daily budget and auto-approval threshold for your connected agent.</p></div><span className={wallet.walletConnected ? 'status connected' : 'status'}>{wallet.walletConnected ? '● Connected via Pinch' : '○ Disconnected'}</span></div>
    {!wallet.walletConnected ? <div className="empty-wallet"><div className="wallet-icon">◒</div><h3>No payment method connected.</h3><p>Connect your card to allow your AI agent to purchase premium content using Pinch.</p><button onClick={onConnect}>Connect Wallet</button></div> : <>
      <button className="change-wallet" type="button" onClick={onConnect}>Change wallet</button>
      <form className="wallet-rules" id="wallet-rules" onSubmit={saveRules}>
        <label className="budget"><span>Daily Budget</span><input aria-label="Daily Budget" type="number" inputMode="decimal" min="0.01" step="0.01" required value={dailyBudget} onChange={(event) => { setDailyBudget(event.target.value); setError(''); setSuccess(''); }} /></label>
        <label className="threshold"><span>Auto approve purchases under</span><input aria-label="Auto approve limit" type="number" inputMode="decimal" min="0" step="0.01" required value={autoApproveLimit} onChange={(event) => { setAutoApproveLimit(event.target.value); setError(''); setSuccess(''); }} /></label>
      </form>
      <div className="stats"><div><span>Today’s Spend</span><strong>{money(wallet.todaySpendCents)}</strong></div><div><span>Remaining</span><strong className="accent">{money(remaining)}</strong></div></div>
      <div className="wallet-actions">
        <div className="wallet-feedback" aria-live="polite">
          {error && <p className="form-error" role="alert">{error}</p>}
          {!error && success && <p className="form-success">{success}</p>}
        </div>
        <button className="save-rules" type="submit" form="wallet-rules" disabled={saving || !hasChanges}>{saving ? 'Saving…' : hasChanges ? 'Save rules' : 'No changes'}</button>
      </div>
      <div className="purchases"><h3>Recent purchases</h3>{wallet.purchases.length ? wallet.purchases.map((purchase) => <div className="purchase" key={purchase.id}><span><b>{purchase.description}</b><small>{new Date(purchase.createdAt).toLocaleDateString()}</small></span><b>−{money(purchase.amountCents)}</b></div>) : <p className="muted">No purchases yet. Your agent is ready.</p>}</div>
    </>}
  </aside>;
}
