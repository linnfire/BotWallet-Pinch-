import type { AgentMode } from './types';

const signals = {
  research: ['Trust screening: editorial correction history reviewed', 'Relevance score: source matches market and autonomous-commerce terms', 'Quality check: primary reporting and dated references prioritised', 'Review scan: source reputation compared across the research set'],
  approval: ['Value screening: subscription alternatives compared against pay-per-access', 'Publisher quality: editorial reputation and source transparency checked', 'Decision ready: BotNews has the strongest relevance-to-price score', 'Guardrail: no purchase can proceed without your explicit approval'],
  auto: ['Bot Limit check: price and remaining daily budget evaluated', 'Source quality: premium report ranks highest for relevance and depth', 'Merchant verification: BotNews 402 offer validated before settlement', 'Auto rule: payment proceeds only when all spending rules pass']
} as const;

export function ResearchIntel({ mode }: { mode: AgentMode }) {
  return <section className="research-intel"><div><span>LIVE RESEARCH INTELLIGENCE</span><b>{mode === 'research' ? 'Screening trust and relevance' : mode === 'approval' ? 'Preparing a defensible recommendation' : 'Verifying autonomous purchase conditions'}</b></div><ul>{signals[mode].map((signal, index) => <li key={signal} style={{ animationDelay: `${index * 180}ms` }}><i>✓</i>{signal}</li>)}</ul><small>Demo screening signals are shown transparently; grounded web sources are used when Gemini search is available.</small></section>;
}
