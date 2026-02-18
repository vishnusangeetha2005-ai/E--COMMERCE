const nodemailer = require('nodemailer');

const escapeHtml = (str) => {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"${process.env.BRAND_NAME || 'E-Commerce'}" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};

const sendWelcomeEmail = async (email, name, role) => {
  await sendEmail({
    to: email,
    subject: `Welcome to our platform!`,
    html: `<h2>Welcome ${escapeHtml(name)}!</h2><p>Your ${escapeHtml(role)} account has been created successfully.</p>`,
  });
};

const sendOrderReceiptEmail = async (email, order) => {
  const items = order.products.map(p => `<li>${escapeHtml(p.name)} x${p.quantity} - ₹${p.price}</li>`).join('');
  await sendEmail({
    to: email,
    subject: `Order Confirmation #${order._id}`,
    html: `<h2>Order Confirmed!</h2><ul>${items}</ul><p><strong>Total: ₹${order.totalAmount}</strong></p>`,
  });
};

const sendClientCredentials = async (email, name, password) => {
  await sendEmail({
    to: email,
    subject: 'Your Store Account Credentials',
    html: `<h2>Hello ${escapeHtml(name)},</h2><p>Your store admin account has been created.</p><p>Email: ${escapeHtml(email)}</p><p>Temporary Password: ${escapeHtml(password)}</p><p>Please change your password after first login.</p>`,
  });
};

module.exports = { sendEmail, sendWelcomeEmail, sendOrderReceiptEmail, sendClientCredentials };
