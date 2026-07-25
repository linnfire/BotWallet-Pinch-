import type { Request, Response } from 'express';
import { authenticatedUserId, authenticatedUserProfile } from './auth.js';
import { addCreditCardSource, createPayer, createRealtimePayment, PinchError } from './pinch.service.js';
import { getWallet, saveWallet } from './store.js';

const DAILY_LIMIT_CENTS = 500;
const AUTO_APPROVE_CENTS = 10;

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
  const amountCents = 100;
  if (!wallet?.sourceId) return response.status(409).json({ error: 'Connect Bot Limit before making purchases.' });
  if (amountCents > wallet.autoApproveCents) return response.status(403).json({ error: 'This purchase exceeds the auto-approval threshold.' });
  if (todaySpend(wallet) + amountCents > wallet.dailyLimitCents) return response.status(403).json({ error: 'This purchase exceeds the daily Bot Limit budget.' });
  try {
    const payment = await createRealtimePayment(wallet.payerId, wallet.sourceId, amountCents, 'BotWallet: BotNews premium article');
    const purchase = { id: payment.id, description: 'BotNews premium article', amountCents, createdAt: new Date().toISOString() };
    wallet.purchases.push(purchase);
    await saveWallet(userId, wallet);
    return response.json({ success: true, purchase, wallet: { todaySpendCents: todaySpend(wallet), remainingCents: wallet.dailyLimitCents - todaySpend(wallet) } });
  } catch (error) { return sendPinchError(response, error); }
}

function sendPinchError(response: Response, error: unknown) {
  const status = error instanceof PinchError && error.status < 500 ? 502 : 500;
  console.error('Pinch request failed:', error);
  return response.status(status).json({ error: 'Unable to complete the Pinch request. Please check your connection and try again.' });
}
