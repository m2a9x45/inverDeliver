const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_KEY);

require('dotenv').config();

const logger = require('../middleware/logger');

const router = express.Router();

router.post('/create', async (req, res, next) => {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
    });

    const accountLinks = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: 'http://localhost:8080/reauth',
      return_url: 'http://example.com/return',
      type: 'account_onboarding',
    });
    res.json(accountLinks);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
