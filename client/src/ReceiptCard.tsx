import type { Receipt } from './types';

export function ReceiptCard({ receipt }: { receipt: Receipt }) {
  const isBooking = receipt.kind === 'travel' || receipt.kind === 'service';
  return <article className={`receipt-card ${isBooking ? 'booking-confirmation' : ''}`}><div className="receipt-logo">◈ {receipt.merchant || 'BOTWALLET'}</div><h3>{isBooking ? '✓ Booking confirmed' : 'Purchase receipt'}</h3><p>{receipt.description}</p>{receipt.items ? receipt.items.map((item) => <div key={item.label}><span>{item.label}</span><b>{item.value || '✓'}</b></div>) : <><div><span>Shirt</span><b>$0.00 AUD</b></div><div><span>Shipping</span><b>$11.00 AUD</b></div></>}{receipt.shippingAddress && <div className="receipt-address"><span>Deliver to</span><b>{receipt.shippingAddress}</b></div>}<div className="receipt-total"><span>Total paid</span><b>${(receipt.amountCents / 100).toFixed(2)} AUD</b></div><small>{isBooking ? 'Booking reference' : 'Receipt'} {receipt.id} · Paid securely with Pinch{receipt.bookedAt ? ` · ${receipt.bookedAt}` : ''}</small></article>;
}
