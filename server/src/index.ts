import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import path from 'node:path';
import { connectWallet, purchasePremiumContent, updateWalletRules, walletStatus } from './pinch.controller.js';
import { loadWallets } from './store.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '16kb' }));
app.get('/api/pinch/wallet', walletStatus);
app.post('/api/pinch/connect-wallet', connectWallet);
app.patch('/api/pinch/wallet', updateWalletRules);
app.post('/api/agent/purchase-premium', purchasePremiumContent);
const clientBuild = path.resolve(process.cwd(), 'dist');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientBuild));
  app.get('*', (_request, response) => response.sendFile(path.join(clientBuild, 'index.html')));
}
app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(error);
  response.status(500).json({ error: 'Unexpected server error.' });
});

const port = Number(process.env.PORT || 8000);
loadWallets().then(() => app.listen(port, () => console.log(`BotWallet API listening on http://localhost:${port}`))).catch((error) => { console.error('Failed to load wallet store', error); process.exit(1); });
