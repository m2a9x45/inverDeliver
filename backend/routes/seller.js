const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const logger = require('../middleware/logger');
const dao = require('../dao/dataSeller');
const authorisation = require('../middleware/auth');

const router = express.Router();

router.post('/create', async (req, res, next) => {
  const {
    firstName, lastName, email, password,
  } = req.body;

  try {
    // check if their's an account tied to that email
    const account = await dao.checkAccountexists(email);
    if (account.length > 0) {
      res.json({ error: 'Account with the email allready exists' });
      return;
    }

    // Create new account
    const stripeAccount = await stripe.accounts.create({
      type: 'express',
    });

    const sellerID = `seller_${uuidv4()}`;
    const hash = await bcrypt.hash(password.trim(), 10);

    const seller = await dao.createSeller(sellerID, stripeAccount.id,
      firstName, lastName, email, hash);
    if (!seller.insertId) {
      // something went wrong
    }

    const accountLinks = await stripe.accountLinks.create({
      account: stripeAccount.id,
      refresh_url: 'http://localhost:8080/seller/reauth',
      return_url: 'http://localhost:8080/seller/complete',
      type: 'account_onboarding',
    });

    jwt.sign({ sellerID }, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, jwtToken) => {
      if (!err) {
        logger.info('JWT Created & Sent', { sellerID, jwt: jwtToken });
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

router.get('/status', authorisation.isAuthorizedSeller, async (req, res, next) => {
  try {
    const stripeID = await dao.getStripeID(res.locals.seller);
    if (stripeID === undefined) {
      res.status(404).json({ data: null });
      return;
    }
    console.log(stripeID);

    const account = await stripe.accounts.retrieve(stripeID.stripe_id);

    // checking if seller has submitted the required details
    if (account.details_submitted === false) {
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: 'http://localhost:8080/seller/reauth',
        return_url: 'http://localhost:8080/seller/complete',
        type: 'account_onboarding',
      });
      res.json(accountLink);
    }

    if (account.charges_enabled === false) {
      // There's some reason for this
    }

    // update DB to show account onboarding has passed
    const updatedStatus = await dao.updateSignupStatus(res.locals.seller, 'complete');
    res.json(account);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
