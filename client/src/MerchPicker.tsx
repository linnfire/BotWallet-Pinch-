import type { MerchItem } from './types';

interface Props { items: MerchItem[]; onSelect: (item: MerchItem) => void; disabled: boolean; }

export function MerchPicker({ items, onSelect, disabled }: Props) {
  return <section className="merch-picker glass">
    <div className="merch-picker-head"><span>◈</span><div><b>Pinch Merch found a free shirt drop</b><small>Shirt $0.00 AUD · Shipping $11.00 AUD</small></div></div>
    <div className="merch-rail" aria-label="Choose a Pinch Merch shirt">
      {items.map((item) => <article className="merch-option" key={item.sku}><img src={item.image} alt={item.title} /><div><b>{item.title}</b><small>Free shirt · $11 shipping</small><button disabled={disabled} onClick={() => onSelect(item)}>Choose this shirt</button></div></article>)}
    </div>
  </section>;
}
