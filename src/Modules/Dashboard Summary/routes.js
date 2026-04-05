const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { auth } = require('../../middlewares/auth');
const { verifyRole } = require('../../middlewares/auth');

router.get(
    '/summary',
    auth,
    verifyRole('viewer', 'analyst', 'admin'),
    controller.getSummary
);

router.get(
    '/category-breakdown',
    auth,
    verifyRole('viewer', 'analyst', 'admin'),
    controller.getCategoryBreakdown
);

router.get(
    '/trends',
    auth,
    verifyRole('viewer', 'analyst', 'admin'),
    controller.getTrends
);

router.get(
    '/recent-activity',
    auth,
    verifyRole('viewer', 'analyst', 'admin'),
    controller.getRecentActivity
);

module.exports = router;