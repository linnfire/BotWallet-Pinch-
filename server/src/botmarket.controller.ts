import type { Request, Response } from 'express';
import { authenticatedUserId } from './auth.js';
import { getBotMarketOffer, settleBotMarketResource } from './botmarket.service.js';
import { purchaseBotMarketOrderForUser, WalletRuleError } from './pinch.controller.js';

export function getBotMarketResource(request: Request, response: Response) {
  const resourceId = typeof request.params.id === 'string' ? request.params.id : '';
  const offer = getBotMarketOffer(resourceId);
  if (!offer) return response.status(404).json({ error: 'Bot Market resource not found.' });
  return response.status(offer.status === 'unlocked' ? 200 : 402).json(offer);
}

export async function checkoutBotMarketResource(request: Request, response: Response) {
  const resourceId = typeof request.body?.resourceId === 'string' ? request.body.resourceId : '';
  const offer = getBotMarketOffer(resourceId);
  if (!offer) return response.status(404).json({ error: 'Bot Market resource not found.' });
  try {
    const purchase = await purchaseBotMarketOrderForUser(authenticatedUserId(request), offer);
    const confirmation = settleBotMarketResource(resourceId);
    return response.json({ success: true, paymentStatus: 'paid', merchant: offer.merchant, purchase, confirmation });
  } catch (error) {
    return response.status(error instanceof WalletRuleError ? error.status : 500).json({ error: error instanceof Error ? error.message : 'Bot Market checkout failed.' });
  }
}
