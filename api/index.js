import 'dotenv/config';
import { app } from '../server/dist/app.js';
import { loadWallets } from '../server/dist/store.js';

let initialized = false;

export default async function handler(request, response) {
  if (!initialized) {
    await loadWallets();
    initialized = true;
  }
  return app(request, response);
}
