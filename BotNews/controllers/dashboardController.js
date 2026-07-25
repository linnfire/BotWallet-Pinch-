const analytics = require('../services/analyticsService');
function getMetrics(req, res) { res.json(analytics.summary()); }
module.exports = { getMetrics };
