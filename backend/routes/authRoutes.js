const express = require('express');
const router = express.Router();
const { registerOwner, loginOwner, loginClient, registerCustomer, loginCustomer, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerOwnerRules, loginRules, registerCustomerRules, customerLoginRules } = require('../middleware/validate');

router.post('/owner/register', registerOwnerRules, registerOwner);
router.post('/owner/login', loginRules, loginOwner);
router.post('/client/login', loginRules, loginClient);
router.post('/customer/register', registerCustomerRules, registerCustomer);
router.post('/customer/login', customerLoginRules, loginCustomer);
router.get('/profile', protect, getProfile);

module.exports = router;
