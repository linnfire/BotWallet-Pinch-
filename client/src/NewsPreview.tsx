import type { AgentMode } from './types';

const sources: Array<{ image: string; title: string; detail: string; botnews?: boolean }> = [
  { image: '/news-australian.jpeg', title: 'The Australian business desk', detail: 'Business context · $7/month' },
  { image: '/news-titanic.jpeg', title: 'Boston Daily Globe archive', detail: 'Historical source · $5/month' },
  { image: '/news-independent.jpeg', title: 'The Independent briefing', detail: 'Editorial signal · $5/month' },
  { image: '/source-national.jpeg', title: 'National Geographic data desk', detail: 'Trust 94% · $7/month' },
  { image: '/source-magazine.jpeg', title: 'Object Lessons review', detail: 'Relevance 88% · $5/month' },
  { image: '/source-vogue.jpeg', title: 'Vogue Business signal', detail: 'Editorial trust 89% · $7/month' },
  { image: '/source-capture.jpeg', title: 'Capture industry report', detail: 'Review quality 91% · $5/month' },
  { image: '/source-newsstand.jpeg', title: 'Multi-source newsstand', detail: 'Coverage 86% · $7/month' },
  { image: '/source-time.jpeg', title: 'Time market archive', detail: 'Authority 92% · $7/month' },
  { image: '/news-independent.jpeg', title: 'BotNews premium analysis', detail: 'Premium source · $1.00 unlock', botnews: true }
];

export function NewsPreview({ mode }: { mode: AgentMode }) {
  return <section className="news-preview glass"><div className="news-preview-head"><span>◈</span><div><b>Live source scanning · {mode} mode</b><small>10 sources scanned · scroll to inspect every publication</small></div></div><div className="news-rail">{sources.map((source) => <article className={source.botnews ? 'selected' : ''} key={source.title}><img src={source.image} alt="Source preview" /><b>{source.title}</b><small>{source.detail}</small></article>)}</div><p>Comparing source quality, subscription value and the BotNews pay-per-access offer<span>•••</span></p></section>;
}
