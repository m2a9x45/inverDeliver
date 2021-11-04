require('dotenv').config();

const mailgun = require('mailgun-js')({ apiKey: process.env.MAILGUN_APIKEY, domain: process.env.MAILGUN_DOMAIN, host: 'api.eu.mailgun.net' });
const logger = require('../middleware/logger');

async function sendWelcomEmail(email, name) {
  const data = {
    from: 'InverDeliver <welcome@mail.inverdeliver.com>',
    to: email,
    subject: 'Welcome to InverDeliver 👋',
    template: 'welcome',
    'v:name': name,
  };

  try {
    const sentEmail = await mailgun.messages().send(data);
    logger.info('welcome email sent', { email, emailID: sentEmail.id });
  } catch (error) {
    logger.error('Welcome email failed to send', { email, error });
  }
}

async function sendOrderConformationEmail(email, name, orderID) {
  const data = {
    from: 'InverDeliver <order-updates@mail.inverdeliver.com>',
    to: email,
    subject: 'Order Conformation 🛒 ⏩ 🏡',
    template: 'order_conformation',
    'v:name': name,
    'v:order_id': orderID,
    'v:tracking_url': `inverdeliver.com/orders/info/?orderID=${orderID}`,
  };

  try {
    const sentEmail = await mailgun.messages().send(data);
    logger.info('order conformation sent', { email, orderID, emailID: sentEmail.id });
  } catch (error) {
    logger.error('Order conformation email failed to send', { email, error });
  }
}

module.exports = {
  sendWelcomEmail,
  sendOrderConformationEmail,
};
