const router = require('express').Router();
const controller = require('../controllers/dashboardController');
router.get('/metrics', controller.getMetrics);
module.exports = router;
