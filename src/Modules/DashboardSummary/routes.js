const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { auth, verifyRole } = require('../../middlewares/auth');

router.use(auth);

// viewer, analyst, admin — basic summary data
router.get('/summary', verifyRole('viewer', 'analyst', 'admin'), controller.getSummary);
router.get('/category-breakdown', verifyRole('viewer', 'analyst', 'admin'), controller.getCategoryBreakdown);
router.get('/trends', verifyRole('viewer', 'analyst', 'admin'), controller.getTrends);

// analyst and admin only — recent activity shows actual records
router.get('/recent-activity', verifyRole('analyst', 'admin'), controller.getRecentActivity);

module.exports = router;
