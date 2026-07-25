import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { WalletRecord } from './types.js';

const storePath = path.resolve(process.cwd(), 'server', 'wallets.json');
let wallets: Record<string, WalletRecord> = {};

function isReadonlyFsError(error: unknown): boolean {
  const code = (error as NodeJS.ErrnoException)?.code;
  return code === 'EROFS' || code === 'EPERM' || code === 'EACCES';
}

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
  try {
    await fs.writeFile(storePath, JSON.stringify(wallets, null, 2), 'utf8');
  } catch (error) {
    // Serverless deployments can run on read-only filesystems; keep in-memory state.
    if (isReadonlyFsError(error)) return;
    throw error;
  }
}
