const Product = require('../models/Product');
const Order = require('../models/Order');
const Owner = require('../models/Owner');

const intents = {
  greeting: ['hi', 'hello', 'hey', 'good morning', 'good evening'],
  orderTracking: ['track', 'order status', 'where is my order', 'delivery status', 'shipping'],
  productInquiry: ['product', 'price', 'available', 'stock', 'buy'],
  help: ['help', 'support', 'contact', 'issue', 'problem'],
  thanks: ['thank', 'thanks', 'thank you'],
};

const matchIntent = (message) => {
  const lower = message.toLowerCase();
  for (const [intent, keywords] of Object.entries(intents)) {
    if (keywords.some(kw => lower.includes(kw))) return intent;
  }
  return 'unknown';
};

const getWelcomeMessage = async (ownerId) => {
  const owner = await Owner.findById(ownerId);
  return owner?.botTemplates?.welcome || 'Welcome! How can we help you today? You can ask about products, track orders, or get help.';
};

const getProductReply = async (clientId, message) => {
  const searchTerm = message.replace(/product|price|available|stock|buy/gi, '').trim();
  const products = await Product.find({
    clientId,
    status: 'active',
    $text: { $search: searchTerm },
  }).limit(3);

  if (products.length === 0) {
    return "Sorry, I couldn't find any matching products. Could you be more specific?";
  }

  let reply = "Here are some products I found:\n\n";
  products.forEach((p, i) => {
    reply += `${i + 1}. *${p.name}* - ₹${p.price}\n   Stock: ${p.stock > 0 ? 'Available' : 'Out of stock'}\n\n`;
  });
  return reply;
};

const getOrderTrackingReply = async (customerId, message) => {
  const orders = await Order.find({ customerId }).sort({ createdAt: -1 }).limit(1);
  if (orders.length === 0) return "You don't have any orders yet.";

  const order = orders[0];
  const statusEmoji = { pending: '⏳', confirmed: '✅', shipped: '🚚', delivered: '📦', cancelled: '❌' };

  return `Your latest order:\n\n` +
    `Order ID: #${order._id.toString().slice(-8)}\n` +
    `Status: ${statusEmoji[order.orderStatus] || ''} ${order.orderStatus.toUpperCase()}\n` +
    `Amount: ₹${order.totalAmount}\n` +
    (order.trackingId ? `Tracking ID: ${order.trackingId}\n` : '');
};

const getFAQReply = async (ownerId) => {
  const owner = await Owner.findById(ownerId);
  if (owner?.botTemplates?.faq?.length > 0) {
    let reply = "Frequently Asked Questions:\n\n";
    owner.botTemplates.faq.forEach((faq, i) => {
      reply += `${i + 1}. *${faq.question}*\n${faq.answer}\n\n`;
    });
    return reply;
  }
  return "For assistance, please contact our support team. We're happy to help!";
};

const generateAutoReply = async (message, clientId, customerId, ownerId) => {
  const intent = matchIntent(message);

  switch (intent) {
    case 'greeting':
      return await getWelcomeMessage(ownerId);
    case 'orderTracking':
      return await getOrderTrackingReply(customerId, message);
    case 'productInquiry':
      return await getProductReply(clientId, message);
    case 'help':
      return await getFAQReply(ownerId);
    case 'thanks':
      return "You're welcome! Is there anything else I can help you with?";
    default:
      return "Thanks for your message! Our team will get back to you shortly. In the meantime, you can:\n\n1. Ask about *products*\n2. *Track* your order\n3. Get *help*";
  }
};

module.exports = { matchIntent, getWelcomeMessage, getProductReply, getOrderTrackingReply, getFAQReply, generateAutoReply };
