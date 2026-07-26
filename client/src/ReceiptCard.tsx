import type { Receipt } from './types';

export function ReceiptCard({ receipt }: { receipt: Receipt }) {
  return <article className="receipt-card"><div className="receipt-logo">◈ BOTWALLET</div><h3>Purchase receipt</h3><p>{receipt.description}</p><div><span>Shirt</span><b>$0.00 AUD</b></div><div><span>Shipping</span><b>$11.00 AUD</b></div>{receipt.shippingAddress && <div className="receipt-address"><span>Deliver to</span><b>{receipt.shippingAddress}</b></div>}<div className="receipt-total"><span>Total paid</span><b>${(receipt.amountCents / 100).toFixed(2)} AUD</b></div><small>Receipt {receipt.id} · Paid securely with Pinch</small></article>;
}
