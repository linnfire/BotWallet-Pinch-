import cors from 'cors';
import express from 'express';
import path from 'node:path';
import { connectWallet, disconnectWallet, planRequest, purchasePremiumContent, unlockPremiumReport, updateWalletRules, walletStatus } from './pinch.controller.js';
import { allowedCorsOrigins } from './config.js';
import { handleMcpRequest } from './mcp.js';
import { checkoutBotMarketResource, getBotMarketResource } from './botmarket.controller.js';

export const app = express();

const corsOrigins = allowedCorsOrigins();
app.use(cors(corsOrigins ? { origin: corsOrigins } : undefined));
app.use(express.json({ limit: '16kb' }));

app.get('/api/pinch/wallet', walletStatus);
app.post('/api/pinch/connect-wallet', connectWallet);
app.post('/api/pinch/disconnect', disconnectWallet);
app.patch('/api/pinch/wallet', updateWalletRules);
app.post('/api/agent/plan', planRequest);
app.post('/api/agent/purchase-premium', purchasePremiumContent);
app.post('/api/agent/unlock-premium', unlockPremiumReport);
app.get('/api/botmarket/resources/:id', getBotMarketResource);
app.post('/api/botmarket/checkout', checkoutBotMarketResource);
app.post('/mcp', handleMcpRequest);

const clientBuild = path.resolve(process.cwd(), 'dist');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientBuild));
  app.get('*', (_request, response) => response.sendFile(path.join(clientBuild, 'index.html')));
}

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(error);
  response.status(500).json({ error: 'Unexpected server error.' });
});
