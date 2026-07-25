import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { WalletRecord } from './types.js';

const storePath = path.resolve(process.cwd(), 'server', 'wallets.json');
let wallets: Record<string, WalletRecord> = {};

export async function loadWallets() {
  try { wallets = JSON.parse(await fs.readFile(storePath, 'utf8')) as Record<string, WalletRecord>; }
  catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    wallets = {};
  }
}
export function getWallet(userId: string) { return wallets[userId]; }
export async function saveWallet(userId: string, wallet: WalletRecord) {
  wallets[userId] = wallet;
  await fs.writeFile(storePath, JSON.stringify(wallets, null, 2), 'utf8');
}
