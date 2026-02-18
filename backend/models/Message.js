const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerPhone: { type: String, default: '' },
  customerName: { type: String, default: '' },
  platform: { type: String, enum: ['whatsapp', 'instagram', 'facebook'], required: true },
  direction: { type: String, enum: ['incoming', 'outgoing'], required: true },
  content: { type: String, required: true },
  reply: { type: String, default: '' },
  isAutoReply: { type: Boolean, default: false },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

messageSchema.index({ clientId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
