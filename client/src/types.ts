export interface Purchase { id: string; description: string; amountCents: number; createdAt: string; }
export interface Wallet { walletConnected: boolean; dailyLimitCents: number; autoApproveCents: number; todaySpendCents: number; purchases: Purchase[]; }
export type ActivityStatus = 'pending' | 'active' | 'complete' | 'locked' | 'attention';
export interface ActivityStep { label: string; detail?: string; status: ActivityStatus; }
export interface Activity { title: string; steps: ActivityStep[]; }
export interface MerchItem { sku: string; title: string; image: string; }
export interface Receipt { id: string; description: string; amountCents: number; shippingAddress?: string; }
export interface ChatMessage { id: string; role: 'user' | 'assistant' | 'activity' | 'merch' | 'receipt' | 'preview'; text: string; activity?: Activity; merch?: MerchItem[]; receipt?: Receipt; }
declare global { interface Window { Pinch?: { Capture: (options: { publishableKey: string }) => { createToken: (card: CardDetails) => Promise<{ token: string }> } } } }
export interface CardDetails { sourceType: 'credit-card'; cardNumber: string; expiryMonth: string; expiryYear: string; cvc: string; cardHolderName: string; }
