/* eslint-disable no-case-declarations */
const express = require('express');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_KEY);

const router = express.Router();
const dao = require('../dao/dataOrder.js');
const authorisation = require('../middleware/auth.js');
const logger = require('../middleware/logger.js');

router.post('/create-payment-intent', authorisation.isAuthorized, async (req, res, next) => {
  const { orderID } = req.body;

  console.log(orderID);

  try {
    const products = await dao.caculateOrderPrice(orderID);
    console.log(products);

    let total = 0;
    const fee = 350;

    products.forEach((product) => {
      total += product.price * product.quantity;
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: total + fee,
      currency: 'gbp',
      metadata: { order_id: orderID },
    });
    logger.info('Payent intent created', { orderID, userID: res.locals.user, paymentIntent: paymentIntent.id, orderTotal: total, OrderFee: fee });

    // update price
    try {
      const addPricetoOrder = await dao.updateOrderPrice(
        total,
        paymentIntent.id,
        fee,
        orderID,
        res.locals.user,
      );
      logger.info('Added order price to database', { orderID, userID: res.locals.user, orderTotal: total, OrderFee: fee });
      console.log(addPricetoOrder);
    } catch (error) {
      next(error);
    }

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
    logger.info('Returned client secrt for payment intent', { orderID, userID: res.locals.user, paymentIntent: paymentIntent.id });
  } catch (error) {
    next(error);
  }
});

router.get('/intent/:orderID', authorisation.isAuthorized, async (req, res, next) => {
  const { orderID } = req.params;

  try {
    const paymentIntentID = await dao.getPaymentID(orderID, res.locals.user);
    // console.log(paymentIntentID[0].payment_id);
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
    logger.error('Stripe webhook error while parsing request.', { error:  err.message });
    console.log('⚠️  Webhook error while parsing basic request.', err.message);
    return res.send();
  }
  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const intent = event.data.object;
      logger.info('Stripe webhook event parsed', { event: 'payment_intent.succeeded', paymentIntentID: intent.id });
      console.log('Succeeded:', intent.id);
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
      console.log(`Unhandled event type ${event.type}.`);
      logger.info('Stripe webhook warning', { event: `${event.type}`, eventID: event.id });
  }
  res.send();
});

module.exports = router;
