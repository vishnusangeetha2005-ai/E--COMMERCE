const axios = require('axios');
const Message = require('../../models/Message');
const Client = require('../../models/Client');
const Owner = require('../../models/Owner');
const Customer = require('../../models/Customer');
const { generateAutoReply } = require('../botEngine');

// Get WhatsApp credentials — client first, then owner fallback
const getWhatsAppCreds = async (client) => {
  if (client.whatsappPhoneNumberId && client.whatsappToken) {
    return { phoneNumberId: client.whatsappPhoneNumberId, token: client.whatsappToken };
  }
  const owner = await Owner.findById(client.ownerId);
  if (owner?.whatsappPhoneNumberId && owner?.whatsappToken) {
    return { phoneNumberId: owner.whatsappPhoneNumberId, token: owner.whatsappToken };
  }
  return { phoneNumberId: null, token: null };
};

const WHATSAPP_API = 'https://graph.facebook.com/v18.0';

const sendMessage = async (phoneNumberId, to, message, token) => {
  if (!phoneNumberId || !token) return;
  await axios.post(
    `${WHATSAPP_API}/${phoneNumberId}/messages`,
    {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: message },
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
};

const handleIncoming = async (body, io) => {
  const entry = body.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;
  const messages = value?.messages;

  if (!messages || messages.length === 0) return;

  const msg = messages[0];
  const from = msg.from;
  const text = msg.text?.body || '';
  const contactName = value.contacts?.[0]?.profile?.name || '';

  // Find client by WhatsApp number
  const client = await Client.findOne({ whatsappNo: { $regex: from.slice(-10) } });
  if (!client) return;

  const customer = await Customer.findOne({ phone: { $regex: from.slice(-10) }, clientId: client._id });

  const saved = await Message.create({
    clientId: client._id,
    customerId: customer?._id,
    customerPhone: from,
    customerName: contactName,
    platform: 'whatsapp',
    direction: 'incoming',
    content: text,
  });

  if (io) io.emit('newMessage', { message: saved, clientId: client._id });

  // Auto-reply using client's token or owner fallback
  const creds = await getWhatsAppCreds(client);
  const reply = await generateAutoReply(text, client._id, customer?._id, client.ownerId);
  await sendMessage(creds.phoneNumberId, from, reply, creds.token);

  saved.reply = reply;
  saved.isAutoReply = true;
  await saved.save();
};

const sendOrderConfirmation = async (client, customerPhone, orderId, totalAmount) => {
  const creds = await getWhatsAppCreds(client);
  const message = `✅ Order Confirmed!\n\nOrder ID: #${orderId.toString().slice(-8)}\nAmount: ₹${totalAmount}\n\nThank you for your purchase!`;
  await sendMessage(creds.phoneNumberId, customerPhone, message, creds.token);
};

const sendShippingUpdate = async (client, customerPhone, orderId, trackingId) => {
  const creds = await getWhatsAppCreds(client);
  const message = `🚚 Your order has been shipped!\n\nOrder ID: #${orderId.toString().slice(-8)}\nTracking ID: ${trackingId}\n\nYou can track your delivery status anytime.`;
  await sendMessage(creds.phoneNumberId, customerPhone, message, creds.token);
};

const sendDeliveryUpdate = async (client, customerPhone, orderId) => {
  const creds = await getWhatsAppCreds(client);
  const message = `📦 Your order has been delivered!\n\nOrder ID: #${orderId.toString().slice(-8)}\n\nThank you for shopping with us! Please leave a review.`;
  await sendMessage(creds.phoneNumberId, customerPhone, message, creds.token);
};

const sendAbandonedCartReminder = async (client, customerPhone, cartItems) => {
  const creds = await getWhatsAppCreds(client);
  let message = `🛒 You left some items in your cart!\n\n`;
  cartItems.forEach((item, i) => {
    message += `${i + 1}. ${item.name} - ₹${item.price}\n`;
  });
  message += `\nComplete your purchase before they're gone!`;
  await sendMessage(creds.phoneNumberId, customerPhone, message, creds.token);
};

module.exports = { sendMessage, handleIncoming, sendOrderConfirmation, sendShippingUpdate, sendDeliveryUpdate, sendAbandonedCartReminder };
