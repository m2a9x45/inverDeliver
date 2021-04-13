require('dotenv').config();

const DOMAIN = 'sandbox02c9ee3c070d45fdb86ba7cda48ae01b.mailgun.org';
const mailgun = require('mailgun-js')({ apiKey: process.env.MAILGUN_APIKEY, domain: DOMAIN });

const data = {
  from: 'InverDeliver <me@samples.mailgun.org>',
  to: 'XX@gmail.com',
  subject: 'InverDeliver Order Conformation',
  template: 'order_conformation',
};

function sendOrderConformationEmail() {
  return new Promise(((resolve, reject) => {
    mailgun.messages().send(data, (error, body) => {
      console.log(error, body);
      if (!error) {
        resolve(body);
      } else {
        reject(error);
      }
    });
  }));
}

module.exports = {
  sendOrderConformationEmail,
};
