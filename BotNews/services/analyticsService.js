const events = [];

function recordRequest({ report, agentId, status }) {
  events.unshift({ id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, type: 'request', reportId: report.id, reportTitle: report.title, agentId, status, amount: 0, createdAt: new Date().toISOString() });
}
function recordPurchase({ report, agentId }) {
  events.unshift({ id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, type: 'purchase', reportId: report.id, reportTitle: report.title, agentId, status: 'Paid', amount: report.priceInCents, createdAt: new Date().toISOString() });
}
function summary() {
  const requests = events.filter((event) => event.type === 'request');
  const purchases = events.filter((event) => event.type === 'purchase');
  const today = new Date().toDateString();
  const revenue = purchases.reduce((sum, event) => sum + event.amount, 0);
  const todayRevenue = purchases.filter((event) => new Date(event.createdAt).toDateString() === today).reduce((sum, event) => sum + event.amount, 0);
  return { aiRequests: requests.length, successfulPurchases: purchases.length, revenueEarned: revenue, revenueToday: todayRevenue, recentTransactions: events.slice(0, 12) };
}
module.exports = { recordRequest, recordPurchase, summary };
