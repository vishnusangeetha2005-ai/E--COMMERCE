const axios = require('axios');
const Message = require('../../models/Message');
const Client = require('../../models/Client');
const Owner = require('../../models/Owner');
const { generateAutoReply } = require('../botEngine');

const FACEBOOK_API = 'https://graph.facebook.com/v18.0';

const sendMessage = async (recipientId, message, accessToken) => {
  if (!accessToken) return;
  await axios.post(
    `${FACEBOOK_API}/me/messages`,
    { recipient: { id: recipientId }, message: { text: message } },
    { params: { access_token: accessToken } }
  );
};

const handleIncoming = async (body, io) => {
  const entry = body.entry?.[0];
  const messaging = entry?.messaging?.[0];
  if (!messaging?.message?.text) return;

  const senderId = messaging.sender.id;
  const text = messaging.message.text;

  // Find client by Facebook Page ID — check client first, then owner
  let client = await Client.findOne({ facebookPage: entry.id });
  let token;
  if (client) {
    token = client.facebookToken;
  } else {
    const owner = await Owner.findOne({ facebookPage: entry.id });
    if (!owner) return;
    client = await Client.findOne({ ownerId: owner._id, isActive: true });
    if (!client) return;
    token = owner.facebookToken;
  }

  // Use client token if set, otherwise owner fallback
  if (!token) {
    const owner = await Owner.findById(client.ownerId);
    token = owner?.facebookToken;
  }

  const saved = await Message.create({
    clientId: client._id,
    customerName: senderId,
    platform: 'facebook',
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
