const issuedReceipts = new Set();

function create402Offer({ merchant, resourceId, title, priceInCents, currency = 'AUD', paymentProvider = 'Pinch' }) {
  if (!merchant || !resourceId || !title || !Number.isSafeInteger(priceInCents) || priceInCents < 0) throw new Error('A complete valid payment offer is required.');
  return { merchant, resourceId, title, priceInCents, currency, paymentProvider };
}

function unlockPurchase({ resourceId, receiptId }) {
  if (!resourceId || !receiptId) throw new Error('resourceId and receiptId are required.');
  const token = `${resourceId}:${receiptId}`;
  issuedReceipts.add(token);
  return { resourceId, receiptId, status: 'unlocked' };
}

function verifyBotWalletReceipt({ resourceId, receiptId }) {
  return Boolean(resourceId && receiptId && issuedReceipts.has(`${resourceId}:${receiptId}`));
}

function protect(offer, content) {
  const paymentOffer = create402Offer(offer);
  return (request, response, next) => {
    const receiptId = request.get('x-botwallet-receipt');
    if (!verifyBotWalletReceipt({ resourceId: paymentOffer.resourceId, receiptId })) return response.status(402).json(paymentOffer);
    if (typeof content === 'function') return content(request, response, next);
    response.json(content);
  };
}

module.exports = { create402Offer, verifyBotWalletReceipt, unlockPurchase, protect };
