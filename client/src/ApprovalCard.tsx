import type { Approval } from './types';

export function ApprovalCard({ approval, onApprove, disabled }: { approval: Approval; onApprove: () => void; disabled: boolean }) {
  return <section className="approval-card glass"><span>◈ Approval Mode</span><h3>Best match: {approval.title}</h3><p>{approval.reason}</p><div><b>{approval.priceLabel}</b><button disabled={disabled} onClick={onApprove}>Approve purchase</button></div></section>;
}
