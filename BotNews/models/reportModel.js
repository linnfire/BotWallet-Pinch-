const reports = [
  {
    id: 'market-report-001', category: 'Markets', eyebrow: 'MARKET INTELLIGENCE',
    title: 'The 2026 Autonomous Economy: Where Capital Is Moving Next',
    summary: 'A field guide to the infrastructure, software, and power markets enabling autonomous commerce.',
    readTime: '14 min read', author: 'Mara Chen', published: 'Today', priceInCents: 100,
    accent: 'amber',
    content: `Capital is beginning to reorganise around a simple question: which businesses can transact, optimise and recover without waiting for a person to intervene? The answer is no longer confined to laboratories. Across payment networks, freight yards and enterprise back offices, autonomous systems are becoming a budget line rather than a speculative theme.\n\nOur research desk reviewed public filings, procurement notices and interviews with operators across the Asia-Pacific region. The strongest signal is not the headline spend on models; it is the quiet migration of operational budgets toward identity, observability, settlement and energy resilience. These are the systems that let an agent act safely in a commercial environment.\n\nThe next phase will reward companies that make machine decisions legible. Boards are asking for controls, finance teams are asking for attribution, and customers are asking for a clear route to remediation. That combination is turning governance from a constraint into a product category. In our base case, the winners will be the firms that package trusted action as an operating capability rather than a feature.\n\nFor investors, the practical implication is to look beneath the application layer. Durable value is accumulating in the rails: permissions, payments, data lineage and specialist workflow software. The autonomous economy is still uneven, but the direction of travel is increasingly difficult to ignore.`
  },
  {
    id: 'ai-report-002', category: 'AI', eyebrow: 'ARTIFICIAL INTELLIGENCE',
    title: 'The Agentic Enterprise: 12 Operating Models Winning Adoption',
    summary: 'Inside the organisations moving from AI pilots to paid, reliable agent workflows.',
    readTime: '18 min read', author: 'Julian Park', published: '3 hours ago', priceInCents: 100,
    accent: 'blue',
    content: `The agentic enterprise does not emerge when a company deploys a chatbot. It emerges when a team can delegate a bounded business outcome, inspect the work, and trust the result enough to make it part of a recurring process. That distinction explains why some ambitious AI programmes remain trapped in demonstration mode while others are already reshaping margins.\n\nThe leading operating models share a small set of habits. They begin with a high-frequency workflow, put a human owner at the exception boundary, and measure the economics from the first week. They also treat access to systems as a design problem. An agent that can read every document but cannot complete an approved payment, order or update has little commercial leverage.\n\nIn our interviews, leaders repeatedly described a change in how they fund software. Instead of buying seats, they are buying completed work. That changes the conversation with vendors and creates a new incentive to expose programmable transactions. Payment is becoming part of the agent stack, not merely a finance function at the end of it.\n\nThe most resilient adopters are neither chasing full autonomy nor limiting themselves to assistance. They are designing for supervised momentum: agents move work forward, people handle the decisions with genuine consequence, and both leave an auditable trail.`
  },
  {
    id: 'industry-report-003', category: 'Industry', eyebrow: 'INDUSTRY BRIEFING',
    title: 'Compute, Cooling & Copper: The Physical AI Supply Chain',
    summary: 'A premium map of the bottlenecks that will decide the pace of global AI deployment.',
    readTime: '11 min read', author: 'Elena Hart', published: 'Yesterday', priceInCents: 100,
    accent: 'coral',
    content: `Artificial intelligence is often discussed as a software story, but its limiting factors are intensely physical. Every new inference workload touches a chain of constrained resources: grid connections, transformers, cooling equipment, high-density racks, networking gear and skilled installation labour. The result is a market where progress in one layer can be held back by a delay in another.\n\nOperators are responding by designing capacity more like an industrial system. They are securing power before finalising buildings, standardising equipment footprints and using workload scheduling to shift demand across time and geography. These moves are not glamorous, but they are increasingly decisive in determining who can serve customers at scale.\n\nCopper is a useful example. It is rarely mentioned in product launches, yet the move toward more power-hungry compute and denser interconnects is pulling it into the strategic conversation. Similar pressures are appearing in water management and local permitting. The companies with the clearest sightline across these dependencies will have a material advantage.\n\nOur conclusion is straightforward: AI infrastructure should be analysed as a connected supply chain. Investors who focus only on chips may miss the businesses that make deployment possible, affordable and repeatable.`
  },
  {
    id: 'payments-report-004', category: 'Payments', eyebrow: 'PAYMENTS RESEARCH',
    title: 'Machine Wallets Are Here. What Comes After Checkout?',
    summary: 'Why verifiable micro-payments will become foundational to the internet’s agent economy.',
    readTime: '9 min read', author: 'Noah Ibrahim', published: 'Jul 18', priceInCents: 100,
    accent: 'mint',
    content: `When software can independently evaluate a service, negotiate a price and execute a transaction, checkout stops being a page and becomes a protocol. That shift is quiet but important. It changes the unit of commerce from a customer session to a verified instruction with a budget, an identity and a receipt.\n\nThe early use cases are unglamorous: paid data access, supplier verification, API calls and low-value research. But these transactions have a shared requirement. The buyer needs to prove authority without exposing unnecessary information, while the seller needs a reliable settlement path and a record they can reconcile.\n\nFinancial institutions are beginning to take this seriously because the volume profile is different. Machine commerce is likely to consist of many small, frequent, context-rich payments. Providers that can make those payments safe, inexpensive and programmable will own an important part of the new stack.\n\nPremium information is a natural proving ground. Agents need timely, structured inputs to make decisions, and publishers need a way to be compensated each time their work creates value. The emerging opportunity is not just a new payment button; it is a sustainable market for trustworthy information.`
  }
];

function allReports() { return reports.map(({ content, ...report }) => report); }
function findReport(id) { return reports.find((report) => report.id === id); }

module.exports = { allReports, findReport };
