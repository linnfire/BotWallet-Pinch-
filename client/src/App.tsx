import { FormEvent, useEffect, useState } from 'react';
import { AgentWallet } from './AgentWallet';
import { ActivityFeed } from './ActivityFeed';
import { api } from './api';
import { ConnectWalletModal } from './ConnectWalletModal';
import { MerchPicker } from './MerchPicker';
import { NewsPreview } from './NewsPreview';
import { ReceiptCard } from './ReceiptCard';
import { ApprovalCard } from './ApprovalCard';
import { ResearchIntel } from './ResearchIntel';
import { TravelResults } from './TravelResults';
import { ServiceResults } from './ServiceResults';
import { DeveloperPage } from './DeveloperPage';
import type { Activity, AgentMode, Approval, ChatMessage, MerchItem, Wallet } from './types';

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
  const [mode, setMode] = useState<AgentMode>('research');
  const [ownerPanelOpen, setOwnerPanelOpen] = useState(false);
  const [preference, setPreference] = useState<'best' | 'cheapest'>('best');
  const [customInstruction, setCustomInstruction] = useState('Prefer trusted merchants and clearly explain every purchase.');
  const [developerPageOpen, setDeveloperPageOpen] = useState(false);

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

  const startNewGoal = (goal = '') => { setMessages(initialMessages); setInput(goal); setQueryCount(0); setError(''); };

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!input.trim() || busy) return;

    setBusy(true);
    setError('');
    add('user', input);
    const goal = input;
    setInput('');
    const plan = await api.plan(goal).catch(() => null);
    if (plan?.sources?.length) add('sources', '', undefined, { sources: plan.sources });
    if (plan?.merchant === 'pinchmerch') { setQueryCount((count) => count + 1); await showMerchChoices(goal, plan.summary); setBusy(false); return; }
    if (plan?.merchant === 'bottravel' || plan?.merchant === 'botservices') { await showFutureMerchant(plan.merchant, goal, plan.summary, plan.reason); setBusy(false); return; }
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

    add('preview', '', undefined, { mode });
    add('intel', '', undefined, { mode });

    await pause(1500);
    const permissionSteps: Activity['steps'] = [
      { label: 'Searching sources...', detail: 'Reuters, NYT, BBC', status: 'complete' },
      { label: `Decision rule: ${preference === 'best' ? 'best trusted match' : 'lowest verified price'}`, detail: customInstruction || 'No custom instruction', status: 'complete' },
      { label: 'BotNews requires payment', detail: '$1.00 unlock available', status: 'locked' },
      { label: 'Checking Bot Limit rules...', status: 'active' }
    ];

    updateActivity(activityId, {
      title: 'BotWallet is validating payment rules...',
      steps: permissionSteps
    });

    await pause(750);
    if (mode === 'research') {
      updateActivity(activityId, { title: 'BotWallet completed its research', steps: [...permissionSteps.slice(0, 2), { label: 'Best match: BotNews premium analysis', detail: 'Purchases disabled in Research Mode', status: 'complete' }] });
      add('assistant', `Research Mode — Purchases disabled\n\n${plan?.summary || 'I found a market-research request.'}\n\nBest match: BotNews premium analysis. Its $1.00 AUD pay-per-access report is the available premium source most suited to this request. Switch to Approval or Auto Mode to unlock it.`);
      setBusy(false);
      return;
    }
    if (mode === 'approval') {
      updateActivity(activityId, { title: 'BotWallet found the best match', steps: [...permissionSteps.slice(0, 2), { label: 'Recommendation ready for your approval', status: 'complete' }] });
      const approval: Approval = { kind: 'news', title: 'BotNews premium analysis', priceLabel: '$1.00 AUD', reason: plan?.reason || 'Relevant premium source for the requested market research.' };
      add('approval', '', undefined, { approval });
      setBusy(false);
      return;
    }
    if (!wallet.walletConnected) {
      updateActivity(activityId, {
        title: 'BotWallet needs your approval',
        steps: [
          ...permissionSteps.slice(0, 3),
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
      ...permissionSteps.slice(0, 3),
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
        `Premium report unlocked from BotNews\n\n${unlocked.report.title}\n\n${unlocked.report.content}\n\nHow it fits your request: ${plan?.summary || 'BotWallet selected the report after comparing the available research sources.'}`
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

  async function showMerchChoices(request: string, summary: string) {
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
    const items: MerchItem[] = [
      { sku: 'da-pinchy-coder', title: 'Da Pinchy Coder', image: '/da-pinchy-coder-shirt.png' },
      { sku: 'pinch-pacman', title: 'Pinch Pacman', image: '/pinch-pacman-shirt.png' },
      { sku: 'sticker-stacker', title: 'Sticker Stacker', image: '/sticker-stacker-shirt.png' }
    ];
    add('merch', '', undefined, { merch: items });
    add('assistant', `Merch shortlist ready\n\n${summary}\n\nI found three Pinch Merch shirt designs. Each shirt is $0.00 AUD; selecting one creates an $11.00 AUD shipping checkout to your saved delivery address.`);
    if (mode === 'auto') { await pause(550); await purchaseMerch(items[0]); }
  }

  async function showFutureMerchant(merchant: 'bottravel' | 'botservices', request: string, summary: string, reason: string) {
    const isTravel = merchant === 'bottravel';
    const firstStep = isTravel ? 'Reading your destination, timing and gear needs' : 'Reading the job, location and urgency';
    const activityId = add('activity', '', { title: `BotWallet is researching ${isTravel ? 'a winter trip' : 'local services'}...`, steps: [{ label: firstStep, status: 'active' }] });
    await pause(1100);
    updateActivity(activityId, { title: 'BotWallet is searching multiple options...', steps: [{ label: firstStep, status: 'complete' }, { label: isTravel ? 'Comparing flights and departure times' : 'Checking provider availability and service areas', status: 'active' }] });
    await pause(1100);
    updateActivity(activityId, { title: 'BotWallet is comparing price and quality...', steps: [{ label: firstStep, status: 'complete' }, { label: isTravel ? 'Comparing flights and departure times' : 'Checking provider availability and service areas', status: 'complete' }, { label: isTravel ? 'Checking hotel ratings and mountain access' : 'Reviewing past jobs, ratings and licences', status: 'active' }] });
    await pause(1100);
    updateActivity(activityId, { title: 'BotWallet is verifying the shortlist...', steps: [{ label: firstStep, status: 'complete' }, { label: isTravel ? 'Comparing flights and departure times' : 'Checking provider availability and service areas', status: 'complete' }, { label: isTravel ? 'Checking hotel ratings and mountain access' : 'Reviewing past jobs, ratings and licences', status: 'complete' }, { label: isTravel ? 'Reviewing ski gear, reviews and total cost' : 'Comparing quotes and review evidence', status: 'active' }] });
    await pause(1400);
    updateActivity(activityId, { title: 'BotWallet completed its comparison', steps: [{ label: firstStep, status: 'complete' }, { label: isTravel ? 'Compared three flight options' : 'Compared verified local professionals', status: 'complete' }, { label: isTravel ? 'Compared three hotel options' : 'Checked reviews and project history', status: 'complete' }, { label: isTravel ? 'Compared ski gear and the trip total' : 'Prepared a recommendation', status: 'complete' }] });
    if (isTravel) {
      add('travel', '', undefined, { mode, text: request });
      add('assistant', `Recommended winter trip\n\n${summary}\n\nI selected the $1,671 AUD bundle because it combines the lowest-priced morning flight, the highest-rated mid-range hotel, and well-reviewed ski gear within the shown price bands. ${mode === 'research' ? 'Research Mode has not made a booking.' : mode === 'approval' ? 'Approval Mode has prepared the exact Bot Market checkout for your approval.' : 'Auto Mode is sending the selected bundle to Bot Market checkout.'}`);
      if (mode === 'auto') await purchaseBotMarket('winter-niseko-bundle', 'winter trip');
      return;
    }
    add('services', '', undefined, { text: request });
    add('assistant', `Recommended local service\n\n${summary}\n\n${reason}\n\n${mode === 'research' ? 'Research Mode has not contacted or booked anyone.' : mode === 'approval' ? 'Approval Mode has prepared the exact Bot Market service booking for your approval.' : 'Auto Mode is sending the selected provider to Bot Market checkout.'}`);
    if (mode === 'auto') await purchaseBotMarket('electrician-home-visit', 'licensed electrician booking');
  }

  async function purchaseBotMarket(resourceId: string, label: string) {
    if (!wallet.walletConnected) { setError(`Connect Bot Limit before BotWallet can complete this ${label} purchase.`); return; }
    const activityId = add('activity', '', { title: `BotWallet is checking out your ${label}...`, steps: [{ label: 'Bot Market returned a payment-required checkout', status: 'complete' }, { label: 'Checking Bot Limit spending rules', status: 'active' }] });
    try {
      await pause(800);
      const paid = await api.checkoutBotMarket(resourceId);
      await refreshWallet();
      updateActivity(activityId, { title: `BotWallet completed your ${label}`, steps: [{ label: 'Merchant checkout confirmed', status: 'complete' }, { label: 'Pinch payment approved by Bot Limit', status: 'complete' }, { label: 'Bot Market booking confirmation received', status: 'complete' }] });
      add('assistant', `✓ ${paid.confirmation.title} confirmed through Bot Market. Payment: $${(paid.purchase.amountCents / 100).toFixed(2)} AUD via Pinch.`);
      const isTravel = resourceId === 'winter-niseko-bundle';
      add('receipt', '', undefined, { receipt: { ...paid.purchase, kind: isTravel ? 'travel' : 'service', merchant: isTravel ? 'BotTravel · Bot Market' : 'Bot Market Services', bookedAt: new Date().toLocaleString(), items: isTravel ? [{ label: 'Flights', value: 'Melbourne → Sapporo · $820 AUD' }, { label: 'Accommodation', value: 'Niseko Alpine Hotel · 5 nights · $540 AUD' }, { label: 'Ski jacket', value: '$145 AUD' }, { label: 'Ski goggles', value: '$66 AUD' }, { label: 'Ski equipment hire', value: '$100 AUD' }] : [{ label: 'Provider', value: 'Ava Electrical' }, { label: 'Service', value: 'Licensed two-hour home visit' }, { label: 'Availability', value: 'Today' }, { label: 'Reviews', value: '4.9 ★ · 286 verified jobs' }] } });
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Bot Market could not complete the checkout.'); updateActivity(activityId, { title: 'BotWallet could not complete the checkout', steps: [{ label: 'Merchant checkout prepared', status: 'complete' }, { label: 'Bot Limit declined this amount', detail: 'Increase the relevant rules, then try again.', status: 'attention' }] }); }
  }

  async function approveNews() {
    if (!wallet.walletConnected) { setModalOpen(true); setError('Connect Bot Limit before approving this purchase.'); return; }
    setBusy(true);
    const activityId = add('activity', '', { title: 'BotWallet is completing your approved purchase...', steps: [{ label: 'Approval received', status: 'complete' }, { label: 'Checking Bot Limit', status: 'active' }] });
    try {
      await pause(650);
      const unlocked = await api.unlockPremiumReport();
      await refreshWallet();
      updateActivity(activityId, { title: 'BotWallet completed your approved purchase', steps: [{ label: 'Approval received', status: 'complete' }, { label: 'Bot Limit approved the $1.00 payment', status: 'complete' }, { label: 'BotNews premium report unlocked', status: 'complete' }] });
      add('assistant', `Premium report unlocked from BotNews\n\n${unlocked.report.title}\n\n${unlocked.report.content}`);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'The approved purchase could not be completed.'); }
    finally { setBusy(false); }
  }

  function handleMerchSelection(item: MerchItem) {
    if (mode === 'research') return;
    if (mode === 'auto') { void purchaseMerch(item); return; }
    const approval: Approval = { kind: 'merch', title: item.title, priceLabel: 'Shirt $0.00 · Shipping $11.00 AUD', reason: 'Best available technical shirt in the Pinch Merch free drop.', merch: item };
    add('approval', '', undefined, { approval });
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
        <button className="new-chat" onClick={() => startNewGoal()}>＋ New goal</button>
        <div className="history">
          <p>RECENT GOALS</p>
          <button className="history-item active" onClick={() => startNewGoal('What are the latest market signals I should know about?')}>Market intelligence</button>
          <button className="history-item" onClick={() => startNewGoal('Find me the best technical shirt for a developer.')}>Find the best shirt</button>
          <button className="history-item" onClick={() => startNewGoal('Plan a winter trip with flights, hotel and ski gear.')}>Winter travel plan</button>
        </div>
        <div className="history receipts-history">
          <p>PAST RECEIPTS</p>
          {wallet.purchases.length ? wallet.purchases.slice(-3).reverse().map((purchase) => <button className="history-item" key={purchase.id}>{purchase.description}<small>${(purchase.amountCents / 100).toFixed(2)} AUD</small></button>) : <span className="receipt-empty">No purchases yet</span>}
        </div>
        <button className="history-item developer-link" onClick={() => setDeveloperPageOpen(true)}>⌘ Developer SDK<small>Make your merchant compatible</small></button>
        <button className="sidebar-footer" onClick={() => setOwnerPanelOpen(true)}>
          <span className="avatar">AO</span>
          <span>
            <b>Agent Owner</b>
            <small>Personal workspace</small>
          </span>
        </button>
      </nav>

      <section className="conversation">
        {developerPageOpen ? <DeveloperPage onBack={() => setDeveloperPageOpen(false)} /> : <>
        <header>
          <div className="hero-heading">
            <div>
            <p className="eyebrow">AUTONOMOUS COMMERCE AGENT</p>
            <h1>What can BotWallet do?</h1>
            </div>
          </div>
          <div className="status-stack"><span className="model">Ready to act <i /></span><img className="title-mascot" src="/mascot1.gif" alt="BotWallet mascot" /></div>
        </header>

        <div className="goal-pills">
          <span>Research a decision, </span>
          <span>Compare products, </span>
          <span>Buy hands free</span>
        </div>

        <div className="mode-selector" role="group" aria-label="Agent autonomy mode">
          <button className={mode === 'research' ? 'selected' : ''} onClick={() => setMode('research')}><b>Research</b><small>Compare only · no purchases</small></button>
          <button className={mode === 'approval' ? 'selected' : ''} onClick={() => setMode('approval')}><b>Approval</b><small>Recommend · you approve</small></button>
          <button className={mode === 'auto' ? 'selected' : ''} onClick={() => setMode('auto')}><b>Auto</b><small>Purchase within Bot Limit</small></button>
        </div>

        <div className="messages">
          {messages.map((message) => {
            if (message.role === 'activity' && message.activity) return <ActivityFeed activity={message.activity} key={message.id} />;
            if (message.role === 'preview') return <NewsPreview key={message.id} mode={message.mode || mode} />;
            if (message.role === 'intel') return <ResearchIntel key={message.id} mode={message.mode || mode} />;
            if (message.role === 'travel') return <TravelResults key={message.id} request={message.text} mode={message.mode || mode} />;
            if (message.role === 'services') return <ServiceResults key={message.id} request={message.text} />;
            if (message.role === 'sources' && message.sources?.length) return <section className="grounded-sources" key={message.id}><span>Grounded web sources</span><div>{message.sources.map((source) => <a href={source.uri} target="_blank" rel="noreferrer" key={source.uri}>{source.title}<small>Open ↗</small></a>)}</div></section>;
            if (message.role === 'merch' && message.merch) return <MerchPicker key={message.id} items={message.merch} disabled={busy || mode === 'research'} onSelect={handleMerchSelection} />;
            if (message.role === 'receipt' && message.receipt) return <ReceiptCard key={message.id} receipt={message.receipt} />;
            if (message.role === 'approval' && message.approval) return <ApprovalCard key={message.id} approval={message.approval} disabled={busy} onApprove={() => message.approval?.kind === 'news' ? void approveNews() : message.approval?.merch && void purchaseMerch(message.approval.merch)} />;
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
        </>}
      </section>

      <aside className="wallet-column">
        <div className="wallet-pinch-brand"><img src="/pinch-logo.png" alt="Pinch" /></div>
        <AgentWallet wallet={wallet} onConnect={() => setModalOpen(true)} onUpdateRules={updateWalletRules} shippingAddress={shippingAddress} onShippingAddressChange={setShippingAddress} />
      </aside>

      {modalOpen && <ConnectWalletModal onClose={() => setModalOpen(false)} onConnected={() => void refreshWallet()} />}
      {ownerPanelOpen && <div className="owner-backdrop"><section className="owner-panel"><button className="close" onClick={() => setOwnerPanelOpen(false)} aria-label="Close">×</button><p className="eyebrow">AGENT OWNER SETTINGS</p><h2>Decision guardrails</h2><p>Tell BotWallet how it should rank supported merchant results.</p><label><input type="radio" checked={preference === 'best'} onChange={() => setPreference('best')} /> Always choose the best trusted match</label><label><input type="radio" checked={preference === 'cheapest'} onChange={() => setPreference('cheapest')} /> Always prefer the lowest verified price</label><label>Custom instruction<textarea value={customInstruction} onChange={(event) => setCustomInstruction(event.target.value)} rows={3} placeholder="e.g. Prefer sustainable options" /></label><button className="save-owner" onClick={() => setOwnerPanelOpen(false)}>Save guardrails</button></section></div>}
    </main>
  );
}
