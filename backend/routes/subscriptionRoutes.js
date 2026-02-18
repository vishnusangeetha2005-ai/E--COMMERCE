const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { getPlans, createSubscription, verifySubscription } = require('../controllers/subscriptionController');

router.get('/plans', getPlans);
router.post('/create', protect, roleCheck('client'), createSubscription);
router.post('/verify', protect, roleCheck('client'), verifySubscription);

module.exports = router;
