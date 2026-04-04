const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { auth } = require('../../middlewares/auth');

router.get('/summary', auth, controller.getSummary);
router.get('/category-totals', auth, controller.getCategoryTotals);
router.get('/recent', auth, controller.getRecent);
router.get('/monthly-trend', auth, controller.getMonthlyTrend);

module.exports = router;
