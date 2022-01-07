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

async function sendOrderConformationEmail(orderInfo, brand, last4) {
  const data = {
    from: 'InverDeliver <order-updates@mail.inverdeliver.com>',
    to: orderInfo.email,
    subject: `Order confirmation 🛒 ⏩ 🏡 Order Number #${orderInfo.order_id}`,
    template: 'order_conformation',
    'v:name': orderInfo.first_name,
    'v:address_first_line': orderInfo.street,
    'v:address_city': orderInfo.city,
    'v:address_post_code': orderInfo.post_code,
    'v:order_delivery_datetime': orderInfo.time,
    'v:order_id': orderInfo.order_id,
    'v:shop_name': orderInfo.store_name,
    'v:order_price': orderInfo.total,
    'v:order_payment_method': `${brand} - ${last4}`,
    'v:tracking_url': `inverdeliver.com/orders/info/?orderID=${orderInfo.order_id}`,
  };

  try {
    const sentEmail = await mailgun.messages().send(data);
    logger.info('order conformation sent', { email: orderInfo.email, orderID: orderInfo.order_id, emailID: sentEmail.id });
  } catch (error) {
    logger.error('Order conformation email failed to send', { email: orderInfo.email, error });
  }
}

module.exports = {
  sendWelcomEmail,
  sendOrderConformationEmail,
};
