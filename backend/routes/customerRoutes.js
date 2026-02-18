const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const {
  addToCart, getCart, updateCartItem, removeFromCart,
  checkout, getOrders, getOrderDetail,
  addReview, getWishlist, toggleWishlist,
} = require('../controllers/customerController');

router.use(protect, roleCheck('customer'));

router.post('/cart', addToCart);
router.get('/cart', getCart);
router.put('/cart/:id', updateCartItem);
router.delete('/cart/:id', removeFromCart);
router.post('/checkout', checkout);
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderDetail);
router.post('/reviews', addReview);
router.get('/wishlist', getWishlist);
router.post('/wishlist', toggleWishlist);

module.exports = router;
