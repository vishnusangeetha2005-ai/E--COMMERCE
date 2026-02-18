const express = require('express');
const router = express.Router();
const { getStoreProducts, getProductDetail, getCategories, getStoreInfo } = require('../controllers/customerController');
const { registerCustomerForStore, loginCustomerForStore } = require('../controllers/authController');

router.get('/:storeUrl/products', getStoreProducts);
router.get('/:storeUrl/products/:id', getProductDetail);
router.get('/:storeUrl/categories', getCategories);
router.get('/:storeUrl/info', getStoreInfo);
router.post('/:storeUrl/register', registerCustomerForStore);
router.post('/:storeUrl/login', loginCustomerForStore);

module.exports = router;
