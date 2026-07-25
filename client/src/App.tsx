import { FormEvent, useEffect, useState } from 'react';
import { AgentWallet } from './AgentWallet';
import { ActivityFeed } from './ActivityFeed';
import { api } from './api';
import { ConnectWalletModal } from './ConnectWalletModal';
import type { Activity, ChatMessage, Wallet } from './types';

const initialWallet: Wallet = { walletConnected: false, dailyLimitCents: 500, autoApproveCents: 10, todaySpendCents: 0, purchases: [] };
const initialMessages: ChatMessage[] = [{ id: 'welcome', role: 'assistant', text: 'Hi, I’m BotWallet. Give me a goal and connect Bot Limit; I can research, compare options, and complete approved purchases within your rules.' }];
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function App() {
  const [wallet, setWallet] = useState<Wallet>(initialWallet);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('What are the latest market signals I should know about?');
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const refreshWallet = async () => { try { setWallet(await api.wallet()); } catch { setError('Could not load your wallet status.'); } };
  const updateWalletRules = async (dailyLimitCents: number, autoApproveCents: number) => { setWallet(await api.updateWalletRules(dailyLimitCents, autoApproveCents)); };
  useEffect(() => { void refreshWallet(); }, []);
  const add = (role: ChatMessage['role'], text: string, activity?: Activity) => {
    const id = crypto.randomUUID();
    setMessages((current) => [...current, { id, role, text, activity }]);
    return id;
  };
  const updateActivity = (id: string, activity: Activity) => setMessages((current) => current.map((message) => message.id === id ? { ...message, activity } : message));
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!input.trim() || busy) return;
    setBusy(true); setError(''); add('user', input); setInput('');
    const activityId = add('activity', '', { title: 'BotWallet is researching...', steps: [
      { label: 'Searching sources...', status: 'active' }
    ] });

    await pause(360); updateActivity(activityId, { title: 'BotWallet is researching...', steps: [
      { label: 'Searching sources...', status: 'active' },
      { label: 'Reuters, NYT', status: 'complete' }
    ] });

    await pause(360); updateActivity(activityId, { title: 'BotWallet is researching...', steps: [
      { label: 'Searching sources...', status: 'active' },
      { label: 'Reuters, NYT', status: 'complete' },
      { label: 'BBC', status: 'complete' }
    ] });

    await pause(360); updateActivity(activityId, { title: 'BotWallet is researching...', steps: [
      { label: 'Searching sources...', status: 'active' },
      { label: 'Reuters, NYT', status: 'complete' },
      { label: 'BBC', status: 'complete' },
      { label: 'Premium report discovered', detail: 'BotNews', status: 'active' }
    ] });

    await pause(650);
    const permissionSteps: Activity['steps'] = [
      { label: 'Searching sources...', detail: 'Reuters, NYT, BBC', status: 'complete' },
      { label: 'BotNews requires payment', detail: '$1.00 unlock available', status: 'locked' },
      { label: 'Checking Bot Limit rules...', status: 'active' }
    ];
    updateActivity(activityId, { title: 'BotWallet is validating payment rules...', steps: permissionSteps });
    await pause(500);
    if (!wallet.walletConnected) {
      updateActivity(activityId, { title: 'BotWallet needs your approval', steps: [...permissionSteps.slice(0, 2), { label: 'No payment method connected', detail: 'Connect Bot Limit to continue', status: 'attention' }] });
      add('assistant', 'I found a premium BotNews report that would sharpen this answer. Connect Bot Limit and I can unlock it for $1.00 when it fits your budget and approval rules.'); setBusy(false); return;
    }
    const approvedSteps: Activity['steps'] = [
      ...permissionSteps.slice(0, 2),
      { label: `Budget limit: $${(wallet.dailyLimitCents / 100).toFixed(2)}`, status: 'complete' },
      { label: `Auto-purchase allowed under $${(wallet.autoApproveCents / 100).toFixed(2)}`, status: 'complete' },
      { label: 'Processing $1.00 AUD payment with Pinch...', status: 'active' }
    ];
    updateActivity(activityId, { title: 'BotWallet is completing your request...', steps: approvedSteps });
    try {
      await api.purchase(); await refreshWallet();
      updateActivity(activityId, { title: 'BotWallet completed your request', steps: [...approvedSteps.slice(0, -1), { label: 'Payment completed', detail: 'BotNews premium report unlocked', status: 'complete' }] });
      await pause(450);
      add('assistant', '✓ Premium report unlocked from BotNews\n\nSource: BotNews — The 2026 Autonomous Economy: Where Capital Is Moving Next\nPayment: $1.00 AUD\n\nSummary\nBotWallet successfully accessed BotNews’ premium report after Bot Limit approved the payment. The report finds that the most durable value in the autonomous economy is accumulating in the operational rails: programmable payments, permissions, data lineage, observability, and energy resilience. Its practical takeaway is to look beyond AI applications toward the trusted systems that let agents safely complete commercial work.');
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'The premium purchase could not be completed.'); updateActivity(activityId, { title: 'BotWallet needs attention', steps: [...approvedSteps.slice(0, -1), { label: 'Payment could not be completed', detail: 'No charge was recorded. Review Bot Limit and try again.', status: 'attention' }] }); add('assistant', 'I was not able to unlock the premium BotNews source, so I kept this answer to the freely available reporting.'); }
    finally { setBusy(false); }
  }
  return <main className="app-shell"><nav className="sidebar"><div className="brand"><span>◈</span> BotWallet</div><button className="new-chat">＋ New goal</button><div className="history"><p>RECENT GOALS</p><button className="history-item active">Market intelligence</button><button className="history-item">Find the best laptop</button><button className="history-item">Weekend travel plan</button></div><div className="sidebar-footer"><span className="avatar">AO</span><span><b>Agent Owner</b><small>Personal workspace</small></span></div></nav>
    <section className="conversation"><header><div><p className="eyebrow">AUTONOMOUS COMMERCE AGENT</p><h1>What can BotWallet do?</h1></div><span className="model">Ready to act <i /></span></header><div className="goal-pills"><span>Research a decision, </span><span>Compare products, </span><span>Buy hands free</span></div><div className="messages">{messages.map((message) => message.role === 'activity' && message.activity ? <ActivityFeed activity={message.activity} key={message.id} /> : <article className={`message ${message.role}`} key={message.id}>{message.role === 'assistant' && <span className="bot">◈</span>}<p>{message.text}</p></article>)}{busy && <span className="typing">BotWallet is working<span>•••</span></span>}</div>{error && <p className="chat-error">{error}</p>}<form className="composer glass" onSubmit={submit}><textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Give BotWallet a goal…" rows={2} /><button type="submit" disabled={busy || !input.trim()} aria-label="Send message">↑</button><small>BotWallet only makes purchases that follow your Bot Limit rules.</small></form></section>
    <aside className="wallet-column"><div className="wallet-mascot-space"><img className="wallet-mascot-image" src="/mascot1.gif" alt="Agent mascot" /></div><AgentWallet wallet={wallet} onConnect={() => setModalOpen(true)} onUpdateRules={updateWalletRules} /></aside>
    {modalOpen && <ConnectWalletModal onClose={() => setModalOpen(false)} onConnected={() => void refreshWallet()} />}
  </main>;
}
