export interface PinchPayer { id: string; firstName?: string; lastName?: string; emailAddress?: string }
export interface PinchSource { id: string; displayCardNumber?: string; cardScheme?: string; isAuthorised?: boolean }
export interface WalletRecord {
  payerId: string;
  sourceId: string;
  dailyLimitCents: number;
  autoApproveCents: number;
  purchases: Purchase[];
}
export interface Purchase { id: string; description: string; amountCents: number; createdAt: string }
