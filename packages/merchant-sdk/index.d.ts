export type PaymentOffer = { merchant: string; resourceId: string; title: string; priceInCents: number; currency?: string; paymentProvider?: string };
export function create402Offer(offer: PaymentOffer): Required<PaymentOffer>;
export function unlockPurchase(input: { resourceId: string; receiptId: string }): { resourceId: string; receiptId: string; status: 'unlocked' };
export function verifyBotWalletReceipt(input: { resourceId: string; receiptId?: string }): boolean;
export function protect(offer: PaymentOffer, content: unknown | ((req: unknown, res: unknown, next: unknown) => unknown)): (req: unknown, res: unknown, next: unknown) => unknown;
