import { FormEvent, useEffect, useState } from 'react';
import { AgentWallet } from './AgentWallet';
import { ActivityFeed } from './ActivityFeed';
import { api } from './api';
import { ConnectWalletModal } from './ConnectWalletModal';
import { MerchPicker } from './MerchPicker';
import { NewsPreview } from './NewsPreview';
import { ReceiptCard } from './ReceiptCard';
import type { Activity, ChatMessage, MerchItem, Wallet } from './types';

const initialWallet: Wallet = {
  walletConnected: false,
  dailyLimitCents: 500,
  autoApproveCents: 10,
  todaySpendCents: 0,
  purchases: []
};

const initialMessages: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    text: 'Hi, I am BotWallet. Give me a goal and connect Bot Limit; I can research, compare options, and complete approved purchases within your rules.'
  }
];

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function App() {
  const [wallet, setWallet] = useState<Wallet>(initialWallet);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('What are the latest market signals I should know about?');
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [queryCount, setQueryCount] = useState(0);
  const [shippingAddress, setShippingAddress] = useState('');

  const refreshWallet = async () => {
    try {
      setWallet(await api.wallet());
    } catch {
      setError('Could not load your wallet status.');
    }
  };

  const updateWalletRules = async (dailyLimitCents: number, autoApproveCents: number) => {
    setWallet(await api.updateWalletRules(dailyLimitCents, autoApproveCents));
  };

  useEffect(() => { void (async () => { await api.disconnectWallet(); await refreshWallet(); })(); }, []);

  const add = (role: ChatMessage['role'], text: string, activity?: Activity, extras: Partial<ChatMessage> = {}) => {
    const id = crypto.randomUUID();
    setMessages((current) => [...current, { id, role, text, activity, ...extras }]);
    return id;
  };

  const updateActivity = (id: string, activity: Activity) => {
    setMessages((current) => current.map((message) => (message.id === id ? { ...message, activity } : message)));
  };

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!input.trim() || busy) return;

    setBusy(true);
    setError('');
    add('user', input);
    setInput('');
    if (queryCount > 0) { setQueryCount((count) => count + 1); await showMerchChoices(); setBusy(false); return; }
    setQueryCount(1);

    const activityId = add('activity', '', {
      title: 'BotWallet is researching...',
      steps: [{ label: 'Searching sources...', status: 'active' }]
    });

    await pause(900);
    updateActivity(activityId, {
      title: 'BotWallet is researching...',
      steps: [
        { label: 'Searching sources...', status: 'active' },
        { label: 'Reuters, NYT', status: 'complete' }
      ]
    });

    await pause(900);
    updateActivity(activityId, {
      title: 'BotWallet is researching...',
      steps: [
        { label: 'Searching sources...', status: 'active' },
        { label: 'Reuters, NYT', status: 'complete' },
        { label: 'BBC', status: 'complete' }
      ]
    });

    await pause(1000);
    updateActivity(activityId, {
      title: 'BotWallet is researching...',
      steps: [
        { label: 'Searching sources...', status: 'active' },
        { label: 'Reuters, NYT', status: 'complete' },
        { label: 'BBC', status: 'complete' },
        { label: 'Premium report discovered', detail: 'BotNews', status: 'active' }
      ]
    });

    add('preview', '');

    await pause(1500);
    const permissionSteps: Activity['steps'] = [
      { label: 'Searching sources...', detail: 'Reuters, NYT, BBC', status: 'complete' },
      { label: 'BotNews requires payment', detail: '$1.00 unlock available', status: 'locked' },
      { label: 'Checking Bot Limit rules...', status: 'active' }
    ];

    updateActivity(activityId, {
      title: 'BotWallet is validating payment rules...',
      steps: permissionSteps
    });

    await pause(750);
    if (!wallet.walletConnected) {
      updateActivity(activityId, {
        title: 'BotWallet needs your approval',
        steps: [
          ...permissionSteps.slice(0, 2),
          { label: 'No payment method connected', detail: 'Connect Bot Limit to continue', status: 'attention' }
        ]
      });
      add(
        'assistant',
        'I found a premium BotNews report that would sharpen this answer. Connect Bot Limit and I can unlock it for $1.00 when it fits your budget and approval rules.'
      );
      setBusy(false);
      return;
    }

    const approvedSteps: Activity['steps'] = [
      ...permissionSteps.slice(0, 2),
      { label: `Budget limit: $${(wallet.dailyLimitCents / 100).toFixed(2)}`, status: 'complete' },
      { label: `Auto-purchase allowed under $${(wallet.autoApproveCents / 100).toFixed(2)}`, status: 'complete' },
      { label: 'Requesting premium unlock from BotNews...', status: 'active' },
      { label: 'Processing payment with Pinch...', status: 'pending' }
    ];

    updateActivity(activityId, {
      title: 'BotWallet is completing your request...',
      steps: approvedSteps
    });

    try {
      const unlocked = await api.unlockPremiumReport();
      await refreshWallet();

      updateActivity(activityId, {
        title: 'BotWallet completed your request',
        steps: [
          ...approvedSteps.slice(0, -2),
          { label: 'BotNews returned HTTP 402 offer', status: 'complete' },
          { label: 'Pinch payment approved and settled', status: 'complete' },
          { label: 'Premium report delivered by BotNews', status: 'complete' }
        ]
      });

      await pause(700);
      add(
        'assistant',
        `Premium report unlocked from BotNews\n\n${unlocked.report.title}\n\n${unlocked.report.content}`
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The premium purchase could not be completed.');
      updateActivity(activityId, {
        title: 'BotWallet needs attention',
        steps: [
          ...approvedSteps.slice(0, -1),
          { label: 'Payment or settlement could not be completed', detail: 'No charge was recorded. Review Bot Limit and try again.', status: 'attention' }
        ]
      });
      add('assistant', 'I was not able to unlock the premium BotNews source, so I kept this answer to freely available reporting.');
    } finally {
      setBusy(false);
    }
  }

  async function showMerchChoices() {
    const activityId = add('activity', '', { title: 'BotWallet is finding physical items...', steps: [{ label: 'Searching Pinch Merch', status: 'active' }] });
    await pause(950);
    updateActivity(activityId, { title: 'BotWallet is comparing merch sources...', steps: [{ label: 'Searching Pinch Merch', status: 'complete' }, { label: 'Scanning Shopify drops', detail: 'Techwear and developer collections', status: 'active' }] });
    await pause(950);
    updateActivity(activityId, { title: 'BotWallet is comparing merch sources...', steps: [{ label: 'Searching Pinch Merch', status: 'complete' }, { label: 'Scanning Shopify drops', detail: 'Techwear and developer collections', status: 'complete' }, { label: 'Checking hacker and hoodie stores', status: 'active' }] });
    await pause(950);
    updateActivity(activityId, { title: 'BotWallet is narrowing the shortlist...', steps: [{ label: 'Searching Pinch Merch', status: 'complete' }, { label: 'Scanning Shopify drops', detail: 'Techwear and developer collections', status: 'complete' }, { label: 'Checking hacker and hoodie stores', status: 'complete' }, { label: 'Comparing cool technical shirts', status: 'active' }] });
    await pause(950);
    updateActivity(activityId, { title: 'BotWallet found the best merch match', steps: [{ label: 'Searching Pinch Merch', status: 'complete' }, { label: 'Scanning Shopify drops', detail: 'Techwear and developer collections', status: 'complete' }, { label: 'Checking hacker and hoodie stores', status: 'complete' }, { label: 'Comparing cool technical shirts', status: 'complete' }, { label: 'Pinch Merch free shirt drop found', detail: 'Shirt $0.00 · shipping $11.00 AUD', status: 'active' }] });
    await pause(1100);
    updateActivity(activityId, { title: 'BotWallet found a free merch drop', steps: [{ label: 'Searching Pinch Merch', status: 'complete' }, { label: 'Scanning Shopify drops', detail: 'Techwear and developer collections', status: 'complete' }, { label: 'Checking hacker and hoodie stores', status: 'complete' }, { label: 'Comparing cool technical shirts', status: 'complete' }, { label: 'Pinch Merch free shirt drop found', detail: 'Choose a shirt to ship for $11.00 AUD', status: 'complete' }] });
    add('merch', '', undefined, { merch: [
      { sku: 'da-pinchy-coder', title: 'Da Pinchy Coder', image: '/da-pinchy-coder-shirt.png' },
      { sku: 'pinch-pacman', title: 'Pinch Pacman', image: '/pinch-pacman-shirt.png' },
      { sku: 'sticker-stacker', title: 'Sticker Stacker', image: '/sticker-stacker-shirt.png' }
    ] });
  }

  async function purchaseMerch(item: MerchItem) {
    if (!shippingAddress.trim()) { setError('Add your shipping address in Bot Limit before choosing a physical item.'); return; }
    if (!wallet.walletConnected) { setModalOpen(true); setError('Connect Bot Limit to pay the $11.00 shipping charge.'); return; }
    setBusy(true); setError('');
    const activityId = add('activity', '', { title: 'BotWallet is preparing your shipment...', steps: [{ label: `${item.title} selected`, detail: 'Item price $0.00 AUD', status: 'complete' }, { label: 'Checking Bot Limit for $11.00 shipping', status: 'active' }] });
    await pause(700);
    try {
      const paid = await api.purchaseMerch(item.sku, shippingAddress);
      await refreshWallet();
      updateActivity(activityId, { title: 'BotWallet completed your merch order', steps: [{ label: `${item.title} reserved`, detail: 'Free Pinch Merch item', status: 'complete' }, { label: 'Shipping paid with Pinch', detail: '$11.00 AUD', status: 'complete' }, { label: 'Delivery address confirmed', status: 'complete' }] });
      add('assistant', `✓ ${item.title} is on its way. The shirt is free; Bot Limit paid the $11.00 AUD shipping charge.`);
      add('receipt', '', undefined, { receipt: { ...paid.purchase, shippingAddress } });
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'The merch order could not be completed.'); }
    finally { setBusy(false); }
  }

  return (
    <main className="app-shell">
      <nav className="sidebar">
        <div className="brand">
          <span>◈</span> BotWallet
        </div>
        <button className="new-chat">＋ New goal</button>
        <div className="history">
          <p>RECENT GOALS</p>
          <button className="history-item active">Market intelligence</button>
          <button className="history-item">Find the best laptop</button>
          <button className="history-item">Weekend travel plan</button>
        </div>
        <div className="history receipts-history">
          <p>PAST RECEIPTS</p>
          {wallet.purchases.length ? wallet.purchases.slice(-3).reverse().map((purchase) => <button className="history-item" key={purchase.id}>{purchase.description}<small>${(purchase.amountCents / 100).toFixed(2)} AUD</small></button>) : <span className="receipt-empty">No purchases yet</span>}
        </div>
        <div className="sidebar-footer">
          <span className="avatar">AO</span>
          <span>
            <b>Agent Owner</b>
            <small>Personal workspace</small>
          </span>
        </div>
      </nav>

      <section className="conversation">
        <header>
          <div className="hero-heading">
            <div>
            <p className="eyebrow">AUTONOMOUS COMMERCE AGENT</p>
            <h1>What can BotWallet do?</h1>
            </div>
            <div className="title-branding"><img className="title-mascot" src="/mascot1.gif" alt="BotWallet mascot" /></div>
          </div>
          <span className="model">
            Ready to act <i />
          </span>
        </header>

        <div className="goal-pills">
          <span>Research a decision, </span>
          <span>Compare products, </span>
          <span>Buy hands free</span>
        </div>

        <div className="messages">
          {messages.map((message) => {
            if (message.role === 'activity' && message.activity) return <ActivityFeed activity={message.activity} key={message.id} />;
            if (message.role === 'preview') return <NewsPreview key={message.id} />;
            if (message.role === 'merch' && message.merch) return <MerchPicker key={message.id} items={message.merch} disabled={busy} onSelect={purchaseMerch} />;
            if (message.role === 'receipt' && message.receipt) return <ReceiptCard key={message.id} receipt={message.receipt} />;
            return <article className={`message ${message.role}`} key={message.id}>{message.role === 'assistant' && <span className="bot">◈</span>}<p>{message.text}</p></article>;
          })}
          {busy && (
            <span className="typing">
              BotWallet is working
              <span>•••</span>
            </span>
          )}
        </div>

        {error && <p className="chat-error">{error}</p>}

        <form className="composer glass" onSubmit={submit}>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Give BotWallet a goal…"
            rows={2}
          />
          <button type="submit" disabled={busy || !input.trim()} aria-label="Send message">
            ↑
          </button>
          <small>BotWallet only makes purchases that follow your Bot Limit rules.</small>
        </form>
      </section>

      <aside className="wallet-column">
        <div className="wallet-pinch-brand"><img src="/pinch-logo.png" alt="Pinch" /></div>
        <AgentWallet wallet={wallet} onConnect={() => setModalOpen(true)} onUpdateRules={updateWalletRules} shippingAddress={shippingAddress} onShippingAddressChange={setShippingAddress} />
      </aside>

      {modalOpen && <ConnectWalletModal onClose={() => setModalOpen(false)} onConnected={() => void refreshWallet()} />}
    </main>
  );
}
