/* eslint-disable no-case-declarations */
const express = require('express');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_KEY);

const router = express.Router();
const dao = require('../dao/dataOrder.js');
const authorisation = require('../middleware/auth.js');

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

    // update price
    try {
      const addPricetoOrder = await dao.updateOrderPrice(
        total,
        paymentIntent.id,
        fee,
        orderID,
        res.locals.user,
      );
      console.log(addPricetoOrder);
    } catch (error) {
      next(error);
    }

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
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
        // console.log(paymentIntent);
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error) {
        next(error);
      }
    } else {
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
  let event;
  try {
    event = req.body;
  } catch (err) {
    console.log('⚠️  Webhook error while parsing basic request.', err.message);
    return res.send();
  }
  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const intent = event.data.object;
      console.log('Succeeded:', intent.id);
      const response = await handlePaymentIntentSucceeded(intent.id);
      if (response !== true) {
        next(response);
      }

      // send conformation email
        // get email address from order ID

      break;
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}.`);
  }
  // Return a 200 response to acknowledge receipt of the event
  res.send();
});

module.exports = router;
