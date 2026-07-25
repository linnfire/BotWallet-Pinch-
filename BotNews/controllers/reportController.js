const { allReports, findReport } = require('../models/reportModel');
const purchaseService = require('../services/purchaseService');
const analytics = require('../services/analyticsService');

function agentId(req) { return req.get('x-agent-id') || req.body?.agentId || 'anonymous-agent'; }

function listReports(req, res) { res.json({ publisher: 'bot News', reports: allReports() }); }
function getReport(req, res) {
  const report = findReport(req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  const requester = agentId(req);
  if (!purchaseService.hasPurchased(report.id, requester)) {
    analytics.recordRequest({ report, agentId: requester, status: 'Payment required' });
    return res.status(402).json({ merchant: 'bot News', resourceId: report.id, title: report.title, priceInCents: report.priceInCents, currency: 'AUD', paymentProvider: 'Pinch' });
  }
  analytics.recordRequest({ report, agentId: requester, status: 'Delivered' });
  res.json({ title: report.title, content: report.content });
}
function purchaseReport(req, res) {
  const report = findReport(req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  const requester = agentId(req);
  const payment = purchaseService.purchase(report, requester);
  res.status(201).json({ ...payment, resourceId: report.id, title: report.title, priceInCents: report.priceInCents, message: 'Demo Pinch payment approved. Request the report again with the same x-agent-id.' });
}
module.exports = { listReports, getReport, purchaseReport };
