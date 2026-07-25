/**
 * A terminal-only demonstration of the Agent Wallet payment protocol.
 *
 * Start BotNews and BotWallet first, then run: npm run demo:agent
 * Override endpoints or the report with BOTNEWS_URL, BOTWALLET_URL, REPORT_ID,
 * AGENT_ID, and WALLET_USER_ID environment variables.
 */

type PaymentOffer = {
  merchant: string;
  resourceId: string;
  title: string;
  priceInCents: number;
  currency: string;
  paymentProvider: string;
};

type UnlockedReport = { title: string; content: string };
type WalletStatus = { walletConnected: boolean; dailyLimitCents: number; autoApproveCents: number; todaySpendCents: number };

const botNewsUrl = (process.env.BOTNEWS_URL || 'http://localhost:3001').replace(/\/$/, '');
const botWalletUrl = (process.env.BOTWALLET_URL || 'http://localhost:8000').replace(/\/$/, '');
const reportId = process.env.REPORT_ID || 'market-report-001';
const agentId = process.env.AGENT_ID || `hackathon-agent-${crypto.randomUUID().slice(0, 8)}`;
const walletUserId = process.env.WALLET_USER_ID || 'demo-user';
const reportUrl = `${botNewsUrl}/api/reports/${encodeURIComponent(reportId)}`;
const shouldPay = process.argv.includes('--pay');

const divider = '─'.repeat(72);
const money = (cents: number, currency = 'AUD') => new Intl.NumberFormat('en-AU', { style: 'currency', currency }).format(cents / 100);
const step = (number: number, title: string) => console.log(`\n${divider}\n${number}. ${title}`);
const pause = (milliseconds = 350) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function json<T>(response: Response): Promise<T> {
  const body = await response.text();
  try { return JSON.parse(body) as T; }
  catch { throw new Error(`Expected JSON from ${response.url}, received: ${body.slice(0, 100) || 'an empty response'}`); }
}

async function requestPremiumReport(): Promise<Response> {
  return fetch(reportUrl, { headers: { 'x-agent-id': agentId } });
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║                 BOTWALLET × BOTNEWS AGENT DEMO                     ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');
  console.log(`Agent: ${agentId}\nResource: ${reportId}\nMode: ${shouldPay ? 'Pay and unlock' : 'Discover payment requirement only'}`);

  step(1, 'REQUEST PREMIUM ARTICLE');
  console.log(`GET ${reportUrl}`);
  const initialResponse = await requestPremiumReport();
  console.log(`← ${initialResponse.status} ${initialResponse.statusText}`);

  if (initialResponse.ok) {
    const report = await json<UnlockedReport>(initialResponse);
    console.log('\nAlready unlocked for this agent.\n');
    printReport(report);
    return;
  }
  if (initialResponse.status !== 402) throw new Error(`Expected 402 Payment Required, received ${initialResponse.status}.`);

  const offer = await json<PaymentOffer>(initialResponse);
  step(2, 'PAYMENT REQUIRED — OFFER RECEIVED');
  console.log('Merchant: BotNews');
  console.log(`Article:  ${offer.title}`);
  console.log(`Price:    ${money(offer.priceInCents, offer.currency)}`);
  console.log(`Payment method: ${offer.paymentProvider}`);

  if (!shouldPay) {
    console.log('\nAgent has detected a payment requirement.');
    console.log('No payment has been made.\n');
    console.log('To authorize the payment and continue, run:');
    console.log('\n  npm run demo:agent -- --pay\n');
    return;
  }

  await pause();
  step(3, 'BOT LIMIT APPROVAL');
  console.log(`GET ${botWalletUrl}/api/pinch/wallet`);
  const walletStatusResponse = await fetch(`${botWalletUrl}/api/pinch/wallet`, { headers: { 'x-user-id': walletUserId } });
  const walletStatus = await json<WalletStatus & { error?: string }>(walletStatusResponse);
  if (!walletStatusResponse.ok) throw new Error(walletStatus.error || `Could not read Bot Limit status (${walletStatusResponse.status}).`);
  if (!walletStatus.walletConnected) throw new Error('Bot Limit is not connected. Connect a payment method before running with --pay.');
  const remainingCents = walletStatus.dailyLimitCents - walletStatus.todaySpendCents;
  console.log(`Daily budget remaining: ${money(remainingCents)}`);
  console.log(`Auto-approve limit:     ${money(walletStatus.autoApproveCents)}`);
  if (offer.priceInCents > walletStatus.autoApproveCents || offer.priceInCents > remainingCents) {
    throw new Error(`Bot Limit cannot approve ${money(offer.priceInCents, offer.currency)} under its current rules.`);
  }
  console.log(`✓ Approved — ${money(offer.priceInCents, offer.currency)} is within Bot Limit rules.`);

  await pause();
  step(4, 'COMPLETE PINCH PAYMENT');
  console.log(`POST ${botWalletUrl}/api/agent/purchase-premium`);
  const walletResponse = await fetch(`${botWalletUrl}/api/agent/purchase-premium`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-id': walletUserId }
  });
  const walletPayment = await json<{ success?: boolean; error?: string }>(walletResponse);
  if (!walletResponse.ok || !walletPayment.success) throw new Error(walletPayment.error || `Wallet payment failed with ${walletResponse.status}.`);
  console.log('← 200 OK — Pinch payment completed.');

  // BotNews is the merchant of record in this demo. This call records the approved
  // payment against the same agent identity, allowing the retry below to unlock it.
  await pause();
  step(5, 'SETTLE WITH BOTNEWS');
  console.log(`POST ${reportUrl}/purchase`);
  const settlementResponse = await fetch(`${reportUrl}/purchase`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-agent-id': agentId }, body: JSON.stringify({ agentId })
  });
  const settlement = await json<{ status?: string; error?: string }>(settlementResponse);
  if (!settlementResponse.ok || settlement.status !== 'paid') throw new Error(settlement.error || `Publisher settlement failed with ${settlementResponse.status}.`);
  console.log('← 201 Created — Publisher recorded the payment receipt.');

  await pause();
  step(6, 'RETRY ORIGINAL REQUEST');
  console.log(`GET ${reportUrl}`);
  const unlockedResponse = await requestPremiumReport();
  console.log(`← ${unlockedResponse.status} ${unlockedResponse.statusText}`);
  if (!unlockedResponse.ok) throw new Error(`Expected 200 OK after payment, received ${unlockedResponse.status}.`);

  await pause();
  step(7, 'PREMIUM ARTICLE UNLOCKED FROM BOTNEWS');
  printReport(await json<UnlockedReport>(unlockedResponse));
  console.log('\n✓ Demo complete — BotNews content was unlocked after a successful Bot Limit-approved payment.\n');
}

function printReport(report: UnlockedReport) {
  console.log(`\n${report.title}\n${divider}`);
  console.log(report.content);
}

main().catch((error: unknown) => {
  console.error(`\n✗ Demo stopped: ${error instanceof Error ? error.message : 'Unexpected error.'}\n`);
  process.exitCode = 1;
});
