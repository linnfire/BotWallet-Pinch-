export type BotMarketResource = { id: string; merchant: string; title: string; category: 'travel' | 'services'; priceInCents: number; currency: 'AUD'; details: string };

export const botMarketResources: Record<string, BotMarketResource> = {
  'winter-niseko-bundle': { id: 'winter-niseko-bundle', merchant: 'Bot Market Travel', title: 'Niseko winter essentials bundle', category: 'travel', priceInCents: 167100, currency: 'AUD', details: 'Jetstar flight, three-night Niseko Alpine Lodge stay, ski equipment rental, jacket and goggles.' },
  'electrician-home-visit': { id: 'electrician-home-visit', merchant: 'Bot Market Services', title: 'Licensed electrician home visit', category: 'services', priceInCents: 18500, currency: 'AUD', details: 'Priority two-hour electrical repair visit with a licensed electrician.' },
  'handyman-home-visit': { id: 'handyman-home-visit', merchant: 'Bot Market Services', title: 'Top-rated handyman home visit', category: 'services', priceInCents: 14500, currency: 'AUD', details: 'Two-hour home repair booking with verified project history and tools included.' }
};

const settled = new Set<string>();

export function getBotMarketOffer(id: string) {
  const resource = botMarketResources[id];
  if (!resource) return null;
  return { ...resource, paymentProvider: 'Pinch', status: settled.has(id) ? 'unlocked' : 'payment_required' as const };
}

export function settleBotMarketResource(id: string) { settled.add(id); return getBotMarketOffer(id); }
