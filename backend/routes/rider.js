const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_KEY);

require('dotenv').config();

const logger = require('../middleware/logger');
const dao = require('../dao/dataRider');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/create',
  body('first_name').isString().escape(),
  body('last_name').isString().escape(),
  body('email').isEmail().normalizeEmail().escape(),
  body('password').isString().isLength({ min: 8 }).escape(),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      first_name: firstName, last_name: lastName, email, password,
    } = req.body;

    const hash = await bcrypt.hash(password.trim(), 10);
    const riderID = `rider_${uuidv4()}`;

    // Create new rider account
    try {
      const rider = await dao.createRiderAccount(riderID, firstName, lastName, email, hash);
      console.log(rider);
    } catch (error) {
      console.log(error);
    }
    // Return an JWT with rider role

    const JWTdata = {
      riderID,
      roles: ['rider'],
    };

    return jwt.sign(JWTdata, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, jwtToken) => {
      if (!err) {
        return res.json({ token: jwtToken });
      }
      return next(err);
    });
  });

router.put('/signup/phone', auth.isAuthorizedRider, body('phone_number').isMobilePhone(['en-GB']), async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { phone_number: phoneNumber } = req.body;
  const { rider } = res.locals;

  try {
    const result = await dao.updatePhoneNumber(rider, phoneNumber);
    if (result.changedRows !== 1) {
      res.status(500).json({ message: 'failed to update phone number', rider });
    }
    return res.status(201).send();
  } catch (error) {
    return next(error);
  }
});

router.post('/signup/stripe', auth.isAuthorizedRider, async (req, res, next) => {
  // check if the rider has a stripe ID in DB
  // if they do, we'll want to check the stripe status
  // and make descions based on that

  try {
    const account = await stripe.accounts.create({
      country: 'GB',
      type: 'express',
      capabilities: { transfers: { requested: true } },
      business_type: 'individual',
      business_profile: { product_description: 'test' },
    });

    const result = await dao.updateStripeAccountID(res.locals.rider, account.id);
    if (result.changedRows !== 1) {
      return res.status(500).json({ message: 'failed to link stripe account to rider' });
    }

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: 'http://localhost:8080/rider-frontend/signup/stripe/reauth/',
      return_url: 'https://localhost:3001/rider/signup/stripe/finished',
      type: 'account_onboarding',
    });

    console.log(accountLink);
    res.json(accountLink);
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});

router.get('/signup/stripe/reauth', auth.isAuthorizedRider, async (req, res, next) => {
  // Get customer stripe connect ID
  // And create new link for the customer to complete stripe onboarding
  try {
    const result = await dao.getStripeID(res.locals.rider);
    console.log(result);

    const accountLink = await stripe.accountLinks.create({
      account: result[0].stripe_id,
      refresh_url: 'http://localhost:8080/rider-frontend/signup/stripe/reauth/',
      return_url: 'https://localhost:3001/rider/signup/stripe/finished',
      type: 'account_onboarding',
    });

    res.json(accountLink);
    // res.redirect(accountLink.url);
  } catch (error) {
    next(error);
  }
});

router.get('/signup/stripe/return', auth.isAuthorizedRider, async (req, res, next) => {
  // https://stripe.com/docs/connect/express-accounts#return_url

  try {
    const result = await dao.getStripeID(res.locals.rider);
    console.log(result);

    const account = await stripe.accounts.retrieve(
      result[0].stripe_id,
    );

    console.log(account);
    // If account.details_submitted is true, then we can contine onboarding the rider
    // TODO: Update signup status
    if (account.details_submitted) {
      // Stripe may still require more information, address or IDV info
      // At this point allowing the rider to cotine with signup makes sense
      // The showing in the app a banner if stripe require more information
      return res.json('Good ✅');
    }

    // Rider hasn't submitted details to stripe, so we'll want to redirect them back to stripe.
    // Pass rider to reauth frontend page

    res.json(account);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
