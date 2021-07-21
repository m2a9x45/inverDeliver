const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const logger = require('../middleware/logger');
const dao = require('../dao/dataSeller');

const router = express.Router();

router.post('/create', async (req, res, next) => {
  const {
    firstName, lastName, email, password,
  } = req.body;

  try {
    // check if their's an account tied to that email
    const account = await dao.checkAccountexists(email);
    if (account.length > 0) {
      res.json({ data: 'Account with the email allready exists' });
      return;
    }

    // Create new account
    const stripeAccount = await stripe.accounts.create({
      type: 'express',
    });

    const userID = `seller_${uuidv4()}`;
    const hash = await bcrypt.hash(password.trim(), 10);

    const seller = await dao.createSeller(userID, stripeAccount.id,
      firstName, lastName, email, hash);
    if (!seller.insertId) {
      // something went wrong
    }

    const accountLinks = await stripe.accountLinks.create({
      account: stripeAccount.id,
      refresh_url: 'http://localhost:8080/reauth',
      return_url: 'http://example.com/return',
      type: 'account_onboarding',
    });

    jwt.sign({ userID }, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, jwtToken) => {
      if (!err) {
        logger.info('JWT Created & Sent', { userID, jwt: jwtToken });
        res.json({
          data: {
            token: jwtToken,
            stripeURL: accountLinks.url,
          },
        });
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/resume', async (req, res, next) => {
  // generate a new account link from stripe
  const { account } = req.body;
  // check account ID in DB, this will be a userID in the future
  const accountLinks = await stripe.accountLinks.create({
    account,
    refresh_url: 'http://localhost:8080/reauth',
    return_url: 'http://example.com/return',
    type: 'account_onboarding',
  });

  res.json({ data: accountLinks.url });
});

module.exports = router;
