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

router.post('/create-payment-intent', authorisation.isAuthorized, body('orderID'), async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { orderID } = req.body;
  logger.info('Payment Intent creation for order', { orderID, userID: res.locals.user });

  try {
    const products = await dao.caculateOrderPrice(orderID);
    if (products.length === 0) {
      logger.warn('No order found for that ID', { userID: res.locals.user, orderID });
      return res.status(500).json({ error: 'Mo order found with that ID' });
    }

    logger.debug('The products the order is for', { orderID, userID: res.locals.user, products });

    // This is the delivery charge we apply to all orders,
    // could improve the logic here in the future.
    let total = 0;
    const fee = 350;

    // Caculating the total price of the order.
    products.forEach((product) => {
      total += product.price * product.quantity;
    });

    const stripeID = await daoUser.getStripeID(res.locals.user);
    logger.info('Got StripeID', { orderID, userID: res.locals.user, stripeID: stripeID.stripe_id });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: total + fee,
      customer: stripeID.stripe_id,
      currency: 'gbp',
      metadata: { order_id: orderID },
      setup_future_usage: 'off_session',
    });
    logger.info('Payent intent created', {
      orderID,
      userID: res.locals.user,
      paymentIntent: paymentIntent.id,
      itemTotal: total,
      orderFee: fee,
      orderTotal: total + fee,
    });

    // updating price for order in DB
    const addPricetoOrder = await dao.updateOrderPrice(
      total,
      paymentIntent.id,
      fee,
      orderID,
      res.locals.user,
    );
    logger.info('Added order price to database', {
      orderID,
      userID: res.locals.user,
      orderTotal: total,
      orderFee: fee,
      numRowsChanged: addPricetoOrder.affectedRows,
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
    logger.info('Returned client secrt for payment intent', { orderID, userID: res.locals.user, paymentIntent: paymentIntent.id });
  } catch (error) {
    next(error);
  }
});

router.get('/intent', authorisation.isAuthorized, async (req, res, next) => {
  const { orderID } = req.query;

  try {
    const paymentIntentID = await dao.getPaymentID(orderID, res.locals.user);
    console.log(paymentIntentID[0].payment_id);
    if (paymentIntentID[0].payment_id) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentID[0].payment_id);
        logger.info('Got payment intent for order', { orderID, userID: res.locals.user, paymentIntent: paymentIntent.id });
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error) {
        next(error);
      }
    } else {
      logger.info('No payment intent found for order', { orderID, userID: res.locals.user });
      res.status(404).send();
    }
  } catch (error) {
    next(error);
  }
});

async function handlePaymentIntentSucceeded(id) {
  try {
    const updated = await dao.updateOrderStatus(id, 1);
    if (updated.changedRows === 1) {
      return true;
    }
    return `Issue with updating order status: ${id}`;
  } catch (error) {
    return error;
  }
}

router.post('/webhook', async (req, res, next) => {
  logger.info('Stripe webhook event recived', { request: req.body });
  let event;
  try {
    event = req.body;
  } catch (err) {
    logger.error('Stripe webhook error while parsing request.', { error: err.message });
    return res.send();
  }
  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const intent = event.data.object;
      logger.info('Stripe webhook event parsed', { event: 'payment_intent.succeeded', paymentIntentID: intent.id });
      const response = await handlePaymentIntentSucceeded(intent.id);
      logger.info('Order status updated', { event: 'payment_intent.succeeded', paymentIntentID: intent.id });
      if (response !== true) {
        next(response);
      }
      // send conformation email
      // get email address from order ID
      break;
    default:
      // Unexpected event type
      logger.info('Stripe webhook warning', { event: `${event.type}`, eventID: event.id });
  }
  return res.send();
});

module.exports = router;
