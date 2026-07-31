export type MerchantPlan = {
  merchant: 'botnews' | 'pinchmerch' | 'bottravel' | 'botservices';
  intent: 'research' | 'purchase';
  summary: string;
  reason: string;
  source: 'gemini' | 'fallback';
  sources?: Array<{ title: string; uri: string }>;
};

const fallbackPlan = (request: string): MerchantPlan => {
  const lower = request.toLowerCase();
  const merchant = /flight|hotel|ski|trip|travel/.test(lower) ? 'bottravel'
    : /electrician|cleaner|plumber|labour|service|repair/.test(lower) ? 'botservices'
    : /shirt|merch|hoodie|physical|plant|cactus|product|buy/.test(lower) ? 'pinchmerch' : 'botnews';
  const category = merchant === 'bottravel' ? 'a travel plan' : merchant === 'pinchmerch' ? 'physical products' : merchant === 'botservices' ? 'a local service' : 'market research';
  return { merchant, intent: /buy|purchase|find|plan|need/.test(lower) ? 'purchase' : 'research', summary: `I interpreted your request as ${category}: “${request}”.`, reason: `BotWallet will compare the available ${category} options against the details in your request.`, source: 'fallback' };
};

export async function createMerchantPlan(request: string): Promise<MerchantPlan> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fallbackPlan(request);
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(process.env.GEMINI_MODEL || 'gemini-2.5-flash')}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ contents: [{ parts: [{ text: `You are the intent router for BotWallet. Choose exactly one merchant: botnews (paid reports), pinchmerch (shirts), bottravel (travel planning), botservices (electricians, cleaners, tradespeople). Never invent a merchant, price, product, availability, or completed payment. Return ONLY JSON with merchant, intent (research or purchase), summary, reason. Make summary and reason specific to the user's request: mention their destination, item type, budget or preference only when they actually supplied it. Never say “controlled local merchant router”, “trust relevance and value checks”, or generic filler. User request: ${request}` }] }], tools: [{ google_search: {} }], generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 180 } })
    });
    if (!response.ok) return fallbackPlan(request);
    const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> }, groundingMetadata?: { groundingChunks?: Array<{ web?: { title?: string; uri?: string } }> } }> };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return fallbackPlan(request);
    const parsed = JSON.parse(text) as Omit<MerchantPlan, 'source'>;
    if (!['botnews', 'pinchmerch', 'bottravel', 'botservices'].includes(parsed.merchant)) return fallbackPlan(request);
    if (!['research', 'purchase'].includes(parsed.intent)) return fallbackPlan(request);
    const sources = data.candidates?.[0]?.groundingMetadata?.groundingChunks?.flatMap((chunk) => chunk.web?.title && chunk.web.uri ? [{ title: chunk.web.title, uri: chunk.web.uri }] : []) || [];
    return { ...parsed, source: 'gemini', sources };
  } catch { return fallbackPlan(request); }
}
