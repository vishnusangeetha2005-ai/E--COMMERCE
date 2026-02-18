const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createOrder, verifyPayment, processRefund, getUpiDetails, confirmUpiPayment } = require('../controllers/paymentController');

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/refund', protect, processRefund);
router.post('/upi-order', protect, getUpiDetails);
router.post('/upi-confirm', protect, confirmUpiPayment);

module.exports = router;
