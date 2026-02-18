const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { subscriptionCheck } = require('../middleware/subscriptionCheck');
const { upload } = require('../utils/imageUpload');
const {
  getDashboard, getProducts, addProduct, updateProduct, deleteProduct,
  getOrders, updateOrder, getCustomers, getPayments, getMessages, replyToMessage, updateSettings,
} = require('../controllers/clientController');

router.use(protect, roleCheck('client'));

// Settings route — no subscription check (so client can view/update settings)
router.put('/settings', updateSettings);

// All other routes require active subscription
router.use(subscriptionCheck);

router.get('/dashboard', getDashboard);
router.get('/products', getProducts);
router.post('/products', upload.array('images', 5), addProduct);
router.put('/products/:id', upload.array('images', 5), updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/orders', getOrders);
router.put('/orders/:id', updateOrder);
router.get('/customers', getCustomers);
router.get('/payments', getPayments);
router.get('/messages', getMessages);
router.post('/messages/reply', replyToMessage);

module.exports = router;
