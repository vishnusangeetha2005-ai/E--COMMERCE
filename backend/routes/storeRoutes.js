const express = require('express');
const router = express.Router();
const { getStoreProducts, getProductDetail, getCategories, getStoreInfo } = require('../controllers/customerController');
const { registerCustomerForStore, loginCustomerForStore, forgotPasswordCustomer, resetPasswordCustomer } = require('../controllers/authController');
const { forgotPasswordRules, resetPasswordRules } = require('../middleware/validate');

router.get('/:storeUrl/products', getStoreProducts);
router.get('/:storeUrl/products/:id', getProductDetail);
router.get('/:storeUrl/categories', getCategories);
router.get('/:storeUrl/info', getStoreInfo);
router.post('/:storeUrl/register', registerCustomerForStore);
router.post('/:storeUrl/login', loginCustomerForStore);
router.post('/:storeUrl/forgot-password', forgotPasswordRules, forgotPasswordCustomer);
router.post('/:storeUrl/reset-password', resetPasswordRules, resetPasswordCustomer);

module.exports = router;
