require('dotenv').config();

const mailgun = require('mailgun-js')({ apiKey: process.env.MAILGUN_APIKEY, domain: process.env.MAILGUN_DOMAIN });
const logger = require('../middleware/logger');

async function sendWelcomEmail(email, name) {
  const data = {
    from: 'InverDeliver <welcome@inverdeliver.com>',
    to: email,
    subject: 'Welcome to InverDeliver 👋',
    template: 'welcome',
    'v:name': name,
  };

  const sentEmail = await mailgun.messages().send(data);
  logger.info('welcome email sent', { email, emailID: sentEmail.id });
}

async function sendOrderConformationEmail(email, name, orderID) {
  const data = {
    from: 'InverDeliver <order-updates@inverdeliver.com>',
    to: email,
    subject: 'Order Conformation 📦 ⏩ 🚚',
    template: 'order_conformation',
    'v:name': name,
    'v:order_id': orderID,
    'v:tracking_url': `localhost:8080/frontend/orders/info/?orderID=${orderID}`,
  };

  const sentEmail = await mailgun.messages().send(data);
  logger.info('order conformation sent', { email, orderID, emailID: sentEmail.id });
}

module.exports = {
  sendWelcomEmail,
  sendOrderConformationEmail,
};
