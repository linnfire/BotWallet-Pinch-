type TravelResultsProps = { request: string; mode: 'research' | 'approval' | 'auto' };

const groups = [
  {
    title: 'Flights',
    subtitle: 'Morning departures selected for a relaxed first day',
    cards: [
      { image: '/travel-japan.jpeg', name: 'Jetstar JQ12', meta: 'Melbourne → Tokyo (Narita) · 10h 20m', price: '$689 AUD', score: '4.4/5 traveller rating' },
      { image: '/travel-ski-slopes.jpeg', name: 'Qantas QF79', meta: 'Melbourne → Tokyo (Haneda) · 10h 05m', price: '$748 AUD', score: '4.7/5 traveller rating' },
      { image: '/travel-ski-board.jpeg', name: 'ANA NH889', meta: 'Melbourne → Tokyo (Narita) · 10h 15m', price: '$774 AUD', score: '4.8/5 traveller rating' }
    ]
  },
  {
    title: 'Hotels',
    subtitle: 'Three-night stays near the mountain transfer',
    cards: [
      { image: '/travel-ski-slopes.jpeg', name: 'Niseko Alpine Lodge', meta: '4.8 ★ · 3 nights · breakfast included', price: '$552 AUD', score: '$184/night · 1.2 km to lift' },
      { image: '/travel-japan.jpeg', name: 'Hirafu Base Hotel', meta: '4.6 ★ · 3 nights · central village', price: '$498 AUD', score: '$166/night · 0.6 km to shuttle' },
      { image: '/travel-pink-mittens.jpeg', name: 'Powder House Niseko', meta: '4.9 ★ · 3 nights · ski storage', price: '$621 AUD', score: '$207/night · 0.4 km to lift' }
    ]
  },
  {
    title: 'Ski gear',
    subtitle: 'Reviewed equipment from supported demo merchants',
    cards: [
      { image: '/travel-orange-jacket.jpeg', name: 'Summit Shell Ski Jacket', meta: 'Alpine Kit · waterproof insulated shell', price: '$120 AUD', score: '4.7 ★ from 318 reviews' },
      { image: '/travel-vallon-goggles.png', name: 'Vallon Nordic Goggles', meta: 'Snow Optics · low-light lens', price: '$60 AUD', score: '4.8 ★ from 204 reviews' },
      { image: '/travel-ski-board.jpeg', name: 'Resort ski equipment bundle', meta: 'Niseko Rental Co. · skis, boots, helmet', price: '$250 AUD', score: '4.6 ★ · 3-day rental' }
    ]
  }
];

export function TravelResults({ request, mode }: TravelResultsProps) {
  return <section className="travel-results glass" aria-label="Winter trip research results">
    <header className="travel-results-head">
      <span>✦</span>
      <div><b>Multi-merchant winter trip comparison</b><small>Options selected for: {request}</small></div>
      <em>{mode === 'research' ? 'Research only' : mode === 'approval' ? 'Approval required' : 'Auto shortlist'}</em>
    </header>
    {groups.map((group) => <section className="travel-group" key={group.title}>
      <div><h3>{group.title}</h3><p>{group.subtitle}</p></div>
      <div className="travel-rail">
        {group.cards.map((card, index) => <article className={index === 0 ? 'recommended' : ''} key={card.name}>
          <img src={card.image} alt="Demo visual reference" />
          <div className="travel-card-copy"><b>{card.name}</b><span>{card.meta}</span><small>{card.score}</small><strong>{card.price}</strong>{index === 0 && <i>Recommended</i>}</div>
        </article>)}
      </div>
    </section>)}
    <footer className="trip-summary">
      <div><span>Recommended trip · Melbourne → Niseko</span><b>Estimated total: $1,671 AUD</b></div>
      <ul><li>Jetstar is the lowest-priced morning flight in this comparison.</li><li>Niseko Alpine Lodge has the strongest rating at a mid-range total.</li><li>The jacket and goggles have the highest review scores below $150 and $70.</li></ul>
    </footer>
    <small className="demo-note">Visual references and prices are controlled demo merchant inventory; web-source links, when available, are shown separately.</small>
  </section>;
}
