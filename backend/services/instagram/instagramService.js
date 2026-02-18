const axios = require('axios');
const Message = require('../../models/Message');
const Client = require('../../models/Client');
const Owner = require('../../models/Owner');
const { generateAutoReply } = require('../botEngine');

const INSTAGRAM_API = 'https://graph.facebook.com/v18.0';

const sendMessage = async (recipientId, message, accessToken) => {
  if (!accessToken) return;
  await axios.post(
    `${INSTAGRAM_API}/me/messages`,
    { recipient: { id: recipientId }, message: { text: message } },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
};

const handleIncoming = async (body, io) => {
  const entry = body.entry?.[0];
  const messaging = entry?.messaging?.[0];
  if (!messaging?.message?.text) return;

  const senderId = messaging.sender.id;
  const text = messaging.message.text;

  // Find client by Instagram ID — check client first, then owner
  let client = await Client.findOne({ instagramId: entry.id });
  let token;
  if (client) {
    token = client.instagramToken;
  } else {
    const owner = await Owner.findOne({ instagramId: entry.id });
    if (!owner) return;
    // Owner default — pick first active client under this owner
    client = await Client.findOne({ ownerId: owner._id, isActive: true });
    if (!client) return;
    token = owner.instagramToken;
  }

  // Use client token if set, otherwise owner fallback
  if (!token) {
    const owner = await Owner.findById(client.ownerId);
    token = owner?.instagramToken;
  }

  const saved = await Message.create({
    clientId: client._id,
    customerName: senderId,
    platform: 'instagram',
    direction: 'incoming',
    content: text,
  });

  if (io) io.emit('newMessage', { message: saved, clientId: client._id });

  const reply = await generateAutoReply(text, client._id, null, client.ownerId);
  await sendMessage(senderId, reply, token);

  saved.reply = reply;
  saved.isAutoReply = true;
  await saved.save();
};

module.exports = { sendMessage, handleIncoming };
