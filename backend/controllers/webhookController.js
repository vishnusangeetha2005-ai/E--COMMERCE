const whatsappService = require('../services/whatsapp/whatsappService');
const instagramService = require('../services/instagram/instagramService');
const facebookService = require('../services/facebook/facebookService');

// POST /api/webhook — Unified webhook for all 3 platforms
const handleWebhook = async (req, res) => {
  try {
    const body = req.body;
    const io = req.app.get('io');

    // WhatsApp webhook
    if (body.object === 'whatsapp_business_account') {
      await whatsappService.handleIncoming(body, io);
      return res.sendStatus(200);
    }

    // Instagram webhook
    if (body.object === 'instagram') {
      await instagramService.handleIncoming(body, io);
      return res.sendStatus(200);
    }

    // Facebook webhook
    if (body.object === 'page') {
      await facebookService.handleIncoming(body, io);
      return res.sendStatus(200);
    }

    res.sendStatus(404);
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.sendStatus(200); // Always return 200 to avoid retries
  }
};

// GET /api/webhook — Webhook verification
const verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
};

module.exports = { handleWebhook, verifyWebhook };
