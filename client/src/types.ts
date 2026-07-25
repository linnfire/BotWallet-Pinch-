export interface Purchase { id: string; description: string; amountCents: number; createdAt: string; }
export interface Wallet { walletConnected: boolean; dailyLimitCents: number; autoApproveCents: number; todaySpendCents: number; purchases: Purchase[]; }
export type ActivityStatus = 'pending' | 'active' | 'complete' | 'locked' | 'attention';
export interface ActivityStep { label: string; detail?: string; status: ActivityStatus; }
export interface Activity { title: string; steps: ActivityStep[]; }
export interface ChatMessage { id: string; role: 'user' | 'assistant' | 'activity'; text: string; activity?: Activity; }
declare global { interface Window { Pinch?: { Capture: (options: { publishableKey: string }) => { createToken: (card: CardDetails) => Promise<{ token: string }> } } } }
export interface CardDetails { sourceType: 'credit-card'; cardNumber: string; expiryMonth: string; expiryYear: string; cvc: string; cardHolderName: string; }
