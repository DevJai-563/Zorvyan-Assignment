const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { auth } = require('../../middlewares/auth');
const { verifyRole } = require('../../middlewares/auth');

router.use(auth);

router.get(
    '/recent-activity',
    verifyRole( 'analyst', 'admin') ,
    controller.getRecentActivity
);

router.use(verifyRole('viewer', 'analyst', 'admin'));

router.get(
    '/summary',
    controller.getSummary
);

router.get(
    '/category-breakdown',
    controller.getCategoryBreakdown
);

router.get(
    '/trends',
    controller.getTrends
);


module.exports = router;