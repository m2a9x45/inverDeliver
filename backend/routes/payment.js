/* eslint-disable no-case-declarations */
const express = require('express');
const { body, validationResult } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_KEY);

require('dotenv').config();

const router = express.Router();
const dao = require('../dao/dataOrder.js');
const daoUser = require('../dao/dataUser.js');
const authorisation = require('../middleware/auth.js');
const logger = require('../middleware/logger.js');
const metrics = require('./metric');
const mailgun = require('../helper/email');

const paymentIntetentCreatedMetric = new metrics.client.Counter({
  name: 'payment_intenet_created',
  help: 'Total number of payment intents created',
  labelNames: ['status'],
});

const stripeWebookMetric = new metrics.client.Counter({
  name: 'stripe_webhook_recived',
  help: 'Total number of stripe webhooks recived',
  labelNames: ['type', 'status'],
});

router.post('/create-payment-intent', authorisation.isAuthorized, body('orderID').escape(), async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    paymentIntetentCreatedMetric.inc({ status: 400 });
    return res.status(400).json({ errors: errors.array() });
  }

  const { orderID } = req.body;
  logger.info('Payment Intent creation for order', { ip: req.ip, orderID, userID: res.locals.user });

  try {
    const products = await dao.caculateOrderPrice(orderID);
    if (products.length === 0) {
      logger.warn('No order found for that ID', { ip: req.ip, userID: res.locals.user, orderID });
      paymentIntetentCreatedMetric.inc({ status: 500 });
      return res.status(500).json({ error: 'Mo order found with that ID' });
    }

    logger.debug('The products the order is for', {
      ip: req.ip, orderID, userID: res.locals.user, products,
    });

    // This is the delivery charge we apply to all orders,
    // could improve the logic here in the future.
    let total = 0;
    const fee = 350;

    // Caculating the total price of the order.
    products.forEach((product) => {
      total += product.price * product.quantity;
    });

    const stripeID = await daoUser.getStripeID(res.locals.user);
    logger.info('Got StripeID', {
      ip: req.ip, orderID, userID: res.locals.user, stripeID: stripeID.stripe_id,
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: total + fee,
      customer: stripeID.stripe_id,
      currency: 'gbp',
      metadata: { order_id: orderID },
      setup_future_usage: 'off_session',
    });
    logger.info('Payent intent created', {
      ip: req.ip,
      orderID,
      userID: res.locals.user,
      paymentIntent: paymentIntent.id,
      itemTotal: total,
      orderFee: fee,
      orderTotal: total + fee,
    });
    paymentIntetentCreatedMetric.inc({ status: 200 });

    // updating price for order in DB
    const addPricetoOrder = await dao.updateOrderPrice(
      total,
      paymentIntent.id,
      fee,
      orderID,
      res.locals.user,
    );
    logger.info('Added order price to database', {
      ip: req.ip,
      orderID,
      userID: res.locals.user,
      orderTotal: total,
      orderFee: fee,
      numRowsChanged: addPricetoOrder.affectedRows,
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
    logger.info('Returned client secrt for payment intent', {
      ip: req.ip, orderID, userID: res.locals.user, paymentIntent: paymentIntent.id,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/intent', authorisation.isAuthorized, async (req, res, next) => {
  const { orderID } = req.query;

  try {
    const paymentIntentID = await dao.getPaymentID(orderID, res.locals.user);
    console.log(paymentIntentID);
    // Re-write this check
    if (paymentIntentID === undefined || paymentIntentID.payment_id === null) {
      logger.info('No payment intent found for order', { ip: req.ip, orderID, userID: res.locals.user });
      return res.status(404).send();
    }

    if (paymentIntentID.payment_id) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentID.payment_id);
        logger.info('Got payment intent for order', {
          ip: req.ip, orderID, userID: res.locals.user, paymentIntent: paymentIntent.id,
        });
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error) {
        next(error);
      }
    }
  } catch (error) {
    next(error);
  }
});

router.get('/method', authorisation.isAuthorized, async (req, res, next) => {
  const { orderID } = req.query;

  try {
    const paymentIntentID = await dao.getPaymentID(orderID, res.locals.user);

    if (!paymentIntentID) {
      logger.info('No payment intent found for order', { ip: req.ip, orderID, userID: res.locals.user });
      res.status(404).send();
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentID.payment_id);

    if (paymentIntent.charges.data.length < 1) {
      logger.error('No charge data found for that paymentID', {
        ip: req.ip, orderID, userID: res.locals.user, status: paymentIntent.status,
      });
      return res.status(404).send();
    }

    // console.log(paymentIntent.charges.data[0].payment_method_details.card);

    const { brand, wallet } = paymentIntent.charges.data[0].payment_method_details.card;
    let { last4 } = paymentIntent.charges.data[0].payment_method_details.card;

    let paymentType = 'card';

    if (wallet.type === 'google_pay') {
      paymentType = 'google_pay';
      last4 = wallet.dynamic_last4;
    }

    res.json({
      type: paymentType,
      info: {
        brand,
        last4,
      },
    });
  } catch (error) {
    next(error);
  }
});

async function handlePaymentIntentSucceeded(id) {
  try {
    const updated = await dao.updateOrderStatus(id, 'order_received');
    if (updated.changedRows === 1) {
      const orderInfo = await dao.getOrderConfirmEmailInfo(id);
      const cardInfo = await stripe.paymentIntents.retrieve(id);

      const deliveryDate = new Date(orderInfo.time);
      const displaydate = deliveryDate.toLocaleDateString('en-GB', {
        month: 'short',
        day: 'numeric',
        weekday: 'long',
        hour: 'numeric',
        minute: 'numeric',
        hourCycle: 'h12',
      });

      orderInfo.time = displaydate;

      const formatedPrice = new Intl.NumberFormat('en-UK', {
        style: 'currency',
        currency: 'GBP',
      }).format(orderInfo.total / 100);

      orderInfo.total = formatedPrice;

      const { wallet } = cardInfo.charges.data[0].payment_method_details.card;
      let { brand, last4 } = cardInfo.charges.data[0].payment_method_details.card;

      if (wallet.type === 'google_pay') {
        brand = 'Google Pay';
        last4 = wallet.dynamic_last4;
      }

      if (wallet.type === 'apple_pay') {
        brand = 'Apple Pay';
        last4 = wallet.dynamic_last4;
      }

      logger.info('Order conformation email attempted to be sent', { paymentIntent: id });
      mailgun.sendOrderConformationEmail(orderInfo, brand, last4);
      return orderInfo;
    }
    return `Issue with updating order status: ${id}`;
  } catch (error) {
    return error;
  }
}

// router.post('/test-webhook', async (req, res, next) => {
//   const { paymentIntent } = req.body;

//   try {
//     const response = await handlePaymentIntentSucceeded(paymentIntent);
//     res.json(response);
//   } catch (error) {
//     next(error);
//   }
// });

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res, next) => {
  // Remove ::1 localhost as a vaild Ip: https://stripe.com/docs/ips
  const vaildStripeWebhookIps = ['3.18.12.63', '3.130.192.231', '13.235.14.237', '13.235.122.149', '18.211.135.69', '35.154.171.200',
    '52.15.183.38', '54.88.130.119', '54.88.130.237', '54.187.174.169', '54.187.205.235', '54.187.216.72', '::1'];

  // Check that the request has come from Stripes vaild IPs
  const reqIP = req.ip;
  const sig = req.headers['stripe-signature'];

  if (!vaildStripeWebhookIps.includes(reqIP)) {
    stripeWebookMetric.inc({ type: 'invaild_ip', status: 400 });
    logger.warn('Webhook event recived, not from stripe', { sig, ip: req.ip });
    return res.status(400).send('Webhook Error: IP out of range');
  }

  logger.info('Stripe webhook event recived', { ip: req.ip, sig });
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    stripeWebookMetric.inc({ type: 'invaild_body', status: 400 });
    logger.error('Stripe webhook error while parsing request.', { ip: req.ip, error: err.message });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      stripeWebookMetric.inc({ type: 'payment_intent.succeeded', status: 200 });
      const intent = event.data.object;
      logger.info('Stripe webhook event parsed', { ip: req.ip, event: 'payment_intent.succeeded', paymentIntentID: intent.id });
      const response = await handlePaymentIntentSucceeded(intent.id);
      logger.info('Order status updated', { ip: req.ip, event: 'payment_intent.succeeded', paymentIntentID: intent.id });
      if (response !== true) {
        return next(response);
      }
      res.json({ received: true });
      // send conformation email
      // get email address from order ID
      break;
    default:
      // Unexpected event type
      stripeWebookMetric.inc({ type: `${event.type}`, status: 404 });
      logger.info('Non supported stripe webhook event', { ip: req.ip, event: `${event.type}`, eventID: event.id });
      res.json({ received: true });
  }
  return res.send();
});

module.exports = router;
