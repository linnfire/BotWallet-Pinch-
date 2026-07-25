const router = require('express').Router();
const controller = require('../controllers/reportController');
router.get('/', controller.listReports);
router.get('/:id', controller.getReport);
router.post('/:id/purchase', controller.purchaseReport);
module.exports = router;
