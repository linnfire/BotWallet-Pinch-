import 'dotenv/config';
import { app } from './app.js';
import { loadWallets } from './store.js';

const port = Number(process.env.PORT || 8000);
loadWallets().then(() => app.listen(port, () => console.log(`BotWallet API listening on http://localhost:${port}`))).catch((error) => { console.error('Failed to load wallet store', error); process.exit(1); });
