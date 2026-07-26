const requestedApiBase = new URLSearchParams(window.location.search).get('api');
const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const defaultApiBase = isLocalHost ? 'http://localhost:8000' : 'https://botwallet-pinch.vercel.app';
const apiBase = requestedApiBase || defaultApiBase;
const status = document.querySelector('.purchase-status');

document.querySelectorAll('[data-sku]').forEach((button) => {
  button.addEventListener('click', async () => {
    const originalLabel = button.textContent;
    button.disabled = true;
    button.textContent = 'BotWallet is approving…';
    status.className = 'purchase-status';
    status.textContent = 'Checking your Bot Limit and securely processing the $11.00 AUD shipping charge…';
    try {
      const response = await fetch(`${apiBase.replace(/\/$/, '')}/api/agent/purchase-premium`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchSku: button.dataset.sku, shippingAddress: 'Managed in the BotWallet physical-order demo' })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'BotWallet could not complete this purchase.');
      status.textContent = `✓ Ordered with BotWallet — shirt $0.00, shipping $11.00 AUD.`;
      button.textContent = 'Purchased ✓';
    } catch (error) {
      status.className = 'purchase-status error';
      status.textContent = error instanceof Error ? error.message : 'BotWallet could not complete this purchase.';
      button.textContent = originalLabel;
      button.disabled = false;
    }
  });
});
