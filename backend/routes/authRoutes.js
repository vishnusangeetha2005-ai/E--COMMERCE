const express = require('express');
const router = express.Router();
const { registerOwner, loginOwner, loginClient, registerCustomer, loginCustomer, getProfile, forgotPasswordOwner, resetPasswordOwner, forgotPasswordClient, resetPasswordClient } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerOwnerRules, loginRules, registerCustomerRules, customerLoginRules, forgotPasswordRules, resetPasswordRules } = require('../middleware/validate');

router.post('/owner/register', registerOwnerRules, registerOwner);
router.post('/owner/login', loginRules, loginOwner);
router.post('/owner/forgot-password', forgotPasswordRules, forgotPasswordOwner);
router.post('/owner/reset-password', resetPasswordRules, resetPasswordOwner);
router.post('/client/login', loginRules, loginClient);
router.post('/client/forgot-password', forgotPasswordRules, forgotPasswordClient);
router.post('/client/reset-password', resetPasswordRules, resetPasswordClient);
router.post('/customer/register', registerCustomerRules, registerCustomer);
router.post('/customer/login', customerLoginRules, loginCustomer);
router.get('/profile', protect, getProfile);

module.exports = router;
