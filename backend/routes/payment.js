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
    const products = await dao.getOrderPrice(orderID);
    console.log(products);

    let total = 0;

    products.forEach((product) => {
      total += product.price * product.quantity;
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'gbp',
      metadata: { order_id: orderID },
    });

    // update price
    try {
      const addPricetoOrder = await dao.updateOrderPrice(
        total,
        paymentIntent.id,
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
    console.log(paymentIntentID[0].payment_id);
    if (paymentIntentID[0].payment_id) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentID[0].payment_id);
        console.log(paymentIntent);
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

router.post('/webhook', (req, res, next) => {
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
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
      console.log(event);
      console.log(event.data.object.metadata);
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      // handlePaymentMethodAttached(paymentMethod);
      break;
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}.`);
  }
  // Return a 200 response to acknowledge receipt of the event
  res.send();
});

module.exports = router;
