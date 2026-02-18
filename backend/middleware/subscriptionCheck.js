const subscriptionCheck = (req, res, next) => {
  const client = req.user;

  if (client.subscriptionStatus !== 'active' || !client.subscriptionExpiry || new Date(client.subscriptionExpiry) < new Date()) {
    // Auto-expire if date has passed but status still says active
    if (client.subscriptionStatus === 'active' && client.subscriptionExpiry && new Date(client.subscriptionExpiry) < new Date()) {
      const Client = require('../models/Client');
      Client.findByIdAndUpdate(client._id, { subscriptionStatus: 'expired' }).catch(() => {});
    }

    return res.status(403).json({
      success: false,
      subscriptionRequired: true,
      message: 'Active subscription required. Please subscribe to continue.',
    });
  }

  next();
};

module.exports = { subscriptionCheck };
