const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { upload } = require('../utils/imageUpload');
const {
  getDashboard, getClients, addClient, updateClient, deleteClient,
  getOrders, getRevenue, getMessages, updateSettings, updateBotTemplates, activateClientSubscription,
} = require('../controllers/ownerController');

router.use(protect, roleCheck('owner'));

router.get('/dashboard', getDashboard);
router.get('/clients', getClients);
router.post('/clients', addClient);
router.put('/clients/:id', updateClient);
router.put('/clients/:id/activate-subscription', activateClientSubscription);
router.delete('/clients/:id', deleteClient);
router.get('/orders', getOrders);
router.get('/revenue', getRevenue);
router.get('/messages', getMessages);
router.put('/settings', upload.single('logo'), updateSettings);
router.put('/bot-templates', updateBotTemplates);

module.exports = router;
