import type { Request, Response } from 'express';
import { authenticatedUserId, authenticatedUserProfile } from './auth.js';
import { addCreditCardSource, createPayer, createRealtimePayment, PinchError } from './pinch.service.js';
import { botNewsBaseUrl, defaultReportId } from './config.js';
import { getWallet, saveWallet } from './store.js';

const DAILY_LIMIT_CENTS = 500;
const AUTO_APPROVE_CENTS = 10;
const merchProducts = {
  'da-pinchy-coder': { amountCents: 1100, description: 'Pinch Merch: Da Pinchy Coder T-Shirt (shirt $0.00 + shipping $11.00)' },
  'pinch-pacman': { amountCents: 1100, description: 'Pinch Merch: Pinch Pacman T-Shirt (shirt $0.00 + shipping $11.00)' },
  'sticker-stacker': { amountCents: 1100, description: 'Pinch Merch: Sticker Stacker T-Shirt (shirt $0.00 + shipping $11.00)' }
} as const;

type PaymentOffer = {
  merchant: string;
  resourceId: string;
  title: string;
  priceInCents: number;
  currency: string;
  paymentProvider: string;
};

type UnlockedReport = { title: string; content: string };

function todaySpend(wallet = getWallet('')!) {
  const date = new Date().toDateString();
  return wallet?.purchases.filter((purchase) => new Date(purchase.createdAt).toDateString() === date)
    .reduce((total, purchase) => total + purchase.amountCents, 0) ?? 0;
}

export async function connectWallet(request: Request, response: Response) {
  const creditCardToken = request.body?.creditCardToken;
  if (typeof creditCardToken !== 'string' || !creditCardToken.trim()) return response.status(400).json({ error: 'A Pinch credit card token is required.' });
  const userId = authenticatedUserId(request);
  try {
    let wallet = getWallet(userId);
    if (!wallet) {
      const payer = await createPayer(authenticatedUserProfile());
      wallet = { payerId: payer.id, sourceId: '', dailyLimitCents: DAILY_LIMIT_CENTS, autoApproveCents: AUTO_APPROVE_CENTS, purchases: [] };
    }
    const source = await addCreditCardSource(wallet.payerId, creditCardToken);
    if (!source.id) throw new Error('Pinch did not return a payment source ID.');
    wallet.sourceId = source.id;
    await saveWallet(userId, wallet);
    return response.json({ success: true, payerId: wallet.payerId, walletConnected: true });
  } catch (error) { return sendPinchError(response, error); }
}

export function walletStatus(request: Request, response: Response) {
  const wallet = getWallet(authenticatedUserId(request));
  if (!wallet?.sourceId) return response.json({ walletConnected: false, dailyLimitCents: DAILY_LIMIT_CENTS, autoApproveCents: AUTO_APPROVE_CENTS, todaySpendCents: 0, purchases: [] });
  return response.json({ walletConnected: true, dailyLimitCents: wallet.dailyLimitCents, autoApproveCents: wallet.autoApproveCents, todaySpendCents: todaySpend(wallet), purchases: wallet.purchases.slice(-5).reverse() });
}

/** A browser session never retains an active payment source after reload. */
export async function disconnectWallet(request: Request, response: Response) {
  const userId = authenticatedUserId(request);
  const wallet = getWallet(userId);
  if (wallet?.sourceId) {
    wallet.sourceId = '';
    await saveWallet(userId, wallet);
  }
  return response.json({ success: true });
}

export async function updateWalletRules(request: Request, response: Response) {
  const dailyLimitCents = request.body?.dailyLimitCents;
  const autoApproveCents = request.body?.autoApproveCents;
  if (!Number.isSafeInteger(dailyLimitCents) || dailyLimitCents < 1 || !Number.isSafeInteger(autoApproveCents) || autoApproveCents < 0) {
    return response.status(400).json({ error: 'Enter valid whole-cent amounts for both wallet rules.' });
  }
  if (autoApproveCents > dailyLimitCents) return response.status(400).json({ error: 'The auto-approve limit cannot exceed the daily budget.' });

  const userId = authenticatedUserId(request);
  const wallet = getWallet(userId);
  if (!wallet?.sourceId) return response.status(409).json({ error: 'Connect Bot Limit before updating its rules.' });
  if (dailyLimitCents < todaySpend(wallet)) return response.status(400).json({ error: 'The daily budget cannot be less than today’s spend.' });

  wallet.dailyLimitCents = dailyLimitCents;
  wallet.autoApproveCents = autoApproveCents;
  await saveWallet(userId, wallet);
  return response.json({ walletConnected: true, dailyLimitCents: wallet.dailyLimitCents, autoApproveCents: wallet.autoApproveCents, todaySpendCents: todaySpend(wallet), purchases: wallet.purchases.slice(-5).reverse() });
}

export async function purchasePremiumContent(request: Request, response: Response) {
  const userId = authenticatedUserId(request);
  const wallet = getWallet(userId);
  const merchSku = request.body?.merchSku;
  const merchProduct = typeof merchSku === 'string' ? merchProducts[merchSku as keyof typeof merchProducts] : undefined;
  if (merchSku && !merchProduct) return response.status(400).json({ error: 'Unknown Pinch Merch item.' });
  if (merchProduct && (typeof request.body?.shippingAddress !== 'string' || request.body.shippingAddress.trim().length < 8)) {
    return response.status(400).json({ error: 'Add a delivery address before ordering physical merch.' });
  }
  const amountCents = merchProduct?.amountCents ?? 100;
  const description = merchProduct?.description ?? 'BotWallet: BotNews premium article';
  if (!wallet?.sourceId) return response.status(409).json({ error: 'Connect Bot Limit before making purchases.' });
  if (amountCents > wallet.autoApproveCents) return response.status(403).json({ error: 'This purchase exceeds the auto-approval threshold.' });
  if (todaySpend(wallet) + amountCents > wallet.dailyLimitCents) return response.status(403).json({ error: 'This purchase exceeds the daily Bot Limit budget.' });
  try {
    const payment = await createRealtimePayment(wallet.payerId, wallet.sourceId, amountCents, description);
    const purchase = { id: payment.id, description: merchProduct?.description.replace('Pinch Merch: ', '') ?? 'BotNews premium article', amountCents, createdAt: new Date().toISOString() };
    wallet.purchases.push(purchase);
    await saveWallet(userId, wallet);
    return response.json({ success: true, purchase, wallet: { todaySpendCents: todaySpend(wallet), remainingCents: wallet.dailyLimitCents - todaySpend(wallet) } });
  } catch (error) { return sendPinchError(response, error); }
}

export async function unlockPremiumReport(request: Request, response: Response) {
  const userId = authenticatedUserId(request);
  const wallet = getWallet(userId);
  if (!wallet?.sourceId) return response.status(409).json({ error: 'Connect Bot Limit before making purchases.' });

  const reportId = typeof request.body?.reportId === 'string' && request.body.reportId.trim() ? request.body.reportId.trim() : defaultReportId();
  const botNewsUrl = botNewsBaseUrl();
  const agentId = request.header('x-agent-id') || `${userId}-agent`;
  const reportUrl = `${botNewsUrl}/api/reports/${encodeURIComponent(reportId)}`;

  try {
    const initialResponse = await fetch(reportUrl, { headers: { 'x-agent-id': agentId } });
    if (initialResponse.ok) {
      const report = await initialResponse.json() as UnlockedReport;
      return response.json({ success: true, alreadyUnlocked: true, report });
    }
    if (initialResponse.status !== 402) {
      return response.status(502).json({ error: `BotNews returned ${initialResponse.status} while requesting premium content.` });
    }

    const offer = await initialResponse.json() as PaymentOffer;
    if (!Number.isSafeInteger(offer.priceInCents) || offer.priceInCents < 1) {
      return response.status(502).json({ error: 'BotNews returned an invalid payment offer.' });
    }

    const spendToday = todaySpend(wallet);
    if (offer.priceInCents > wallet.autoApproveCents) return response.status(403).json({ error: 'This purchase exceeds the auto-approval threshold.' });
    if (spendToday + offer.priceInCents > wallet.dailyLimitCents) return response.status(403).json({ error: 'This purchase exceeds the daily Bot Limit budget.' });

    const payment = await createRealtimePayment(wallet.payerId, wallet.sourceId, offer.priceInCents, `BotWallet: ${offer.title}`);
    const purchase = { id: payment.id, description: offer.title, amountCents: offer.priceInCents, createdAt: new Date().toISOString() };
    wallet.purchases.push(purchase);
    await saveWallet(userId, wallet);

    const settlementResponse = await fetch(`${reportUrl}/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-agent-id': agentId },
      body: JSON.stringify({ agentId })
    });
    if (!settlementResponse.ok) {
      return response.status(502).json({ error: `BotNews settlement failed with ${settlementResponse.status}.` });
    }

    const unlockedResponse = await fetch(reportUrl, { headers: { 'x-agent-id': agentId } });
    if (!unlockedResponse.ok) {
      return response.status(502).json({ error: `BotNews did not unlock the report after payment (${unlockedResponse.status}).` });
    }

    const report = await unlockedResponse.json() as UnlockedReport;
    return response.json({
      success: true,
      report,
      offer,
      purchase,
      wallet: { todaySpendCents: todaySpend(wallet), remainingCents: wallet.dailyLimitCents - todaySpend(wallet) }
    });
  } catch (error) {
    return sendPinchError(response, error);
  }
}

function sendPinchError(response: Response, error: unknown) {
  const status = error instanceof PinchError && error.status < 500 ? 502 : 500;
  console.error('Pinch request failed:', error);
  return response.status(status).json({ error: 'Unable to complete the Pinch request. Please check your connection and try again.' });
}
