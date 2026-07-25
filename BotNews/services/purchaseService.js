const purchases = new Set();
const analytics = require('./analyticsService');

function key(reportId, agentId) { return `${reportId}:${agentId}`; }
function hasPurchased(reportId, agentId) { return purchases.has(key(reportId, agentId)); }
function purchase(report, agentId) {
  const purchaseKey = key(report.id, agentId);
  if (!purchases.has(purchaseKey)) {
    purchases.add(purchaseKey);
    analytics.recordPurchase({ report, agentId });
  }
  return { purchaseId: `pinch_demo_${Date.now()}`, status: 'paid', provider: 'Pinch' };
}
module.exports = { hasPurchased, purchase };
