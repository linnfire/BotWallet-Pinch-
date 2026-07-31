const purchases = new Set();
const analytics = require('./analyticsService');

function key(reportId, agentId) { return `${reportId}:${agentId}`; }
// A settlement is a one-time access pass: each later request requires a new 402 payment.
function consumePurchase(reportId, agentId) {
  const purchaseKey = key(reportId, agentId);
  if (!purchases.has(purchaseKey)) return false;
  purchases.delete(purchaseKey);
  return true;
}
function purchase(report, agentId) {
  const purchaseKey = key(report.id, agentId);
  purchases.add(purchaseKey);
  analytics.recordPurchase({ report, agentId });
  return { purchaseId: `pinch_demo_${Date.now()}`, status: 'paid', provider: 'Pinch' };
}
module.exports = { consumePurchase, purchase };
