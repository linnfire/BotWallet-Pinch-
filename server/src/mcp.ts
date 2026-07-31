import type { Request, Response } from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { authenticatedUserId } from './auth.js';
import { botNewsBaseUrl, defaultReportId } from './config.js';
import { unlockPremiumReportForUser, WalletRuleError } from './pinch.controller.js';
import { getWallet } from './store.js';
import { botMarketResources } from './botmarket.service.js';
import { purchaseBotMarketOrderForUser } from './pinch.controller.js';

const money = (cents: number) => `$${(cents / 100).toFixed(2)} AUD`;
const todaySpend = (purchases: Array<{ amountCents: number; createdAt: string }>) => purchases.filter((p) => new Date(p.createdAt).toDateString() === new Date().toDateString()).reduce((sum, p) => sum + p.amountCents, 0);
const toolResult = (structuredContent: Record<string, unknown>, text: string) => ({ structuredContent, content: [{ type: 'text' as const, text }] });
const toolError = (text: string) => ({ isError: true, content: [{ type: 'text' as const, text }] });

function getSources(query: string) {
  const id = defaultReportId();
  return [
    { id: 'reuters-free-demo', name: 'Reuters public reporting', access: 'free', price: null, url: 'https://www.reuters.com/' },
    { id: 'bbc-free-demo', name: 'BBC News analysis', access: 'free', price: null, url: 'https://www.bbc.com/news' },
    { id, name: 'BotNews premium analysis', access: 'premium', price: '$1.00 AUD', priceInCents: 100, url: `${botNewsBaseUrl()}/api/reports/resources/${encodeURIComponent(id)}`, relevance: `Premium analysis available for “${query}”` }
  ];
}

const marketResult = (resourceId: keyof typeof botMarketResources) => {
  const item = botMarketResources[resourceId];
  return { resourceId: item.id, merchant: item.merchant, title: item.title, price: money(item.priceInCents), details: item.details, checkoutUrl: `/api/botmarket/resources/${item.id}` };
};

function authorizedUser(request: Request) {
  const token = process.env.MCP_AUTH_TOKEN;
  if (!token) return process.env.NODE_ENV === 'production' ? null : authenticatedUserId(request);
  return request.header('authorization') === `Bearer ${token}` ? authenticatedUserId(request) : null;
}

export function createBotWalletMcpServer(userId: string) {
  const server = new McpServer({ name: 'botwallet', version: '1.0.0' }, { instructions: 'BotWallet can access its connected wallet and unlock BotNews only when the existing server-side Bot Limit allows it. Inspect wallet status before purchases. Never claim success unless paymentStatus is paid.' });
  server.registerTool('get_wallet_status', { title: 'Get BotWallet status', description: 'Read Bot Limit connection, limit, spend, balance and recent purchases.', inputSchema: {}, annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false } }, async () => {
    const wallet = getWallet(userId); const spent = wallet ? todaySpend(wallet.purchases) : 0; const limit = wallet?.dailyLimitCents ?? 500;
    const data = { walletConnected: Boolean(wallet?.sourceId), spendingLimit: money(limit), totalSpent: money(spent), remainingBudget: money(Math.max(0, limit - spent)), recentPurchases: wallet?.purchases.slice(-5).reverse() ?? [] };
    return toolResult(data, data.walletConnected ? `Bot Limit is connected; ${data.remainingBudget} remains today.` : 'Bot Limit is not connected; purchases are unavailable.');
  });
  server.registerTool('search_research', { title: 'Search research sources', description: 'Find the free and premium research sources available through BotWallet.', inputSchema: { query: z.string().min(2).max(500) }, annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false } }, async ({ query }) => {
    const availableSources = getSources(query); return toolResult({ query, availableSources }, `Found ${availableSources.length} sources, including BotNews premium analysis for $1.00 AUD.`);
  });
  server.registerTool('purchase_premium_content', { title: 'Purchase BotNews premium content', description: 'Unlock a BotNews resource with the existing server-side Pinch payment flow. Use only after the user explicitly asks to use BotWallet.', inputSchema: { resourceId: z.string().min(1).max(120) }, annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true } }, async ({ resourceId }) => {
    try {
      const unlocked = await unlockPremiumReportForUser(userId, resourceId, `${userId}-chatgpt`);
      const data = { paymentStatus: unlocked.alreadyUnlocked ? 'already_unlocked' : 'paid', amount: unlocked.offer ? money(unlocked.offer.priceInCents) : '$0.00 AUD', merchant: unlocked.offer?.merchant ?? 'BotNews', pinchPaymentId: unlocked.purchase?.id ?? null, accessResult: 'premium_content_unlocked', content: unlocked.report };
      return toolResult(data, `BotNews content ${data.paymentStatus === 'paid' ? 'was paid for with Pinch and' : 'was already'} unlocked.`);
    } catch (caught) { return toolError(caught instanceof WalletRuleError ? caught.message : 'BotWallet could not complete the protected payment flow.'); }
  });
  server.registerTool('research_with_wallet', { title: 'Research with BotWallet', description: 'Search free and premium sources and unlock BotNews only when the existing Bot Limit permits the payment.', inputSchema: { query: z.string().min(2).max(500) }, annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true } }, async ({ query }) => {
    const availableSources = getSources(query); const premium = availableSources[2];
    try {
      const unlocked = await unlockPremiumReportForUser(userId, premium.id, `${userId}-chatgpt`);
      const data = { query, availableSources, premiumSource: premium, payment: { status: unlocked.alreadyUnlocked ? 'already_unlocked' : 'paid', amount: unlocked.offer ? money(unlocked.offer.priceInCents) : '$0.00 AUD', merchant: unlocked.offer?.merchant ?? 'BotNews', pinchPaymentId: unlocked.purchase?.id ?? null }, sourceContent: unlocked.report };
      return toolResult(data, 'BotWallet searched free sources and unlocked BotNews premium analysis using the existing Pinch flow.');
    } catch (caught) { return toolError(`Premium source found but not purchased: ${caught instanceof WalletRuleError ? caught.message : 'protected payment failed.'}`); }
  });
  server.registerTool('search_travel_options', { title: 'Search Bot Market travel', description: 'Show the researched Bot Market winter itinerary, price and included bookings.', inputSchema: { query: z.string().min(2).max(500) }, annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false } }, async ({ query }) => {
    const option = marketResult('winter-niseko-bundle'); return toolResult({ query, options: [option], recommendation: 'Lowest-priced morning flight, high-rated accommodation and reviewed ski essentials.' }, `Found Bot Market travel bundle: ${option.title} for ${option.price}.`);
  });
  server.registerTool('purchase_travel_bundle', { title: 'Purchase Bot Market travel bundle', description: 'Book the researched Bot Market winter itinerary with the existing Pinch and Bot Limit payment flow. Use only when the user explicitly requests purchase.', inputSchema: { resourceId: z.literal('winter-niseko-bundle') }, annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true } }, async ({ resourceId }) => {
    try { const purchase = await purchaseBotMarketOrderForUser(userId, botMarketResources[resourceId]); const data = { paymentStatus: 'paid', merchant: 'BotTravel · Bot Market', pinchPaymentId: purchase.id, amount: money(purchase.amountCents), booking: { reference: `BTW-${purchase.id.slice(-6).toUpperCase()}`, flights: 'Melbourne → Sapporo', hotel: 'Niseko Alpine Hotel · 5 nights', equipment: ['Ski jacket', 'Ski goggles', 'Ski equipment hire'] } }; return toolResult(data, `Travel booking confirmed. Pinch payment ${purchase.id} completed for ${data.amount}.`); }
    catch (caught) { return toolError(caught instanceof WalletRuleError ? caught.message : 'Travel checkout failed.'); }
  });
  server.registerTool('search_service_providers', { title: 'Search Bot Market services', description: 'Compare Bot Market verified local service providers, prices, reviews and availability.', inputSchema: { query: z.string().min(2).max(500) }, annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false } }, async ({ query }) => {
    const options = [marketResult('electrician-home-visit'), marketResult('handyman-home-visit')]; return toolResult({ query, options, recommendation: 'Ava Electrical: 4.9 stars, 286 verified jobs, available today.' }, 'Found verified Bot Market service options with reviews, price and availability.');
  });
  server.registerTool('book_service', { title: 'Book Bot Market local service', description: 'Book a selected verified Bot Market provider with the existing Pinch and Bot Limit payment flow. Use only when the user explicitly requests booking.', inputSchema: { resourceId: z.enum(['electrician-home-visit', 'handyman-home-visit']) }, annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true } }, async ({ resourceId }) => {
    try { const purchase = await purchaseBotMarketOrderForUser(userId, botMarketResources[resourceId]); const item = botMarketResources[resourceId]; const data = { paymentStatus: 'paid', merchant: item.merchant, pinchPaymentId: purchase.id, amount: money(purchase.amountCents), booking: { reference: `BMS-${purchase.id.slice(-6).toUpperCase()}`, service: item.title, availability: resourceId === 'electrician-home-visit' ? 'Today' : 'Next available appointment', payment: 'Paid securely with Pinch' } }; return toolResult(data, `Service booking confirmed. Pinch payment ${purchase.id} completed for ${data.amount}.`); }
    catch (caught) { return toolError(caught instanceof WalletRuleError ? caught.message : 'Service checkout failed.'); }
  });
  return server;
}

export async function handleMcpRequest(request: Request, response: Response) {
  const userId = authorizedUser(request);
  if (!userId) return response.status(401).json({ error: 'MCP authentication is required.' });
  try { const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined }); const server = createBotWalletMcpServer(userId); await server.connect(transport); await transport.handleRequest(request, response, request.body); }
  catch (error) { console.error('MCP request failed:', error); if (!response.headersSent) response.status(500).json({ error: 'BotWallet MCP request failed.' }); }
}
