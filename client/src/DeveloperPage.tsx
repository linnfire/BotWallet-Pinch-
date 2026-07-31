const code = `const botwallet = require('@botwallet/merchant');

app.get('/premium-report', botwallet.protect({
  merchant: 'Example News', resourceId: 'report-2026',
  title: 'Premium market report', priceInCents: 100,
  currency: 'AUD', paymentProvider: 'Pinch'
}, { content: 'Unlocked premium report' }));

botwallet.unlockPurchase({
  resourceId: 'report-2026', receiptId: pinchPayment.id
});`;
export function DeveloperPage({ onBack }: { onBack: () => void }) {
  return <section className="developer-page"><button className="developer-back" onClick={onBack}>← Back to BotWallet</button><p className="eyebrow">BOTWALLET MERCHANT SDK</p><h1>Accept autonomous purchases in a few lines.</h1><p className="developer-lead">Return HTTP 402. BotWallet checks the user’s Bot Limit, pays through Pinch, then your merchant verifies the receipt and unlocks the resource.</p><div className="developer-steps"><article><b>1</b><h3>Install locally</h3><code>npm install ../packages/merchant-sdk</code></article><article><b>2</b><h3>Protect an endpoint</h3><span>The SDK returns a machine-readable 402 when no verified receipt is supplied.</span></article><article><b>3</b><h3>Verify & unlock</h3><span>After Pinch confirmation, issue a receipt and deliver the resource.</span></article></div><pre><code>{code}</code></pre><p className="developer-note">Local workspace package for this hackathon. Publish it before using <code>npm install @botwallet/merchant</code> publicly.</p></section>;
}
