const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_KEY);

require('dotenv').config();

const logger = require('../../middleware/logger');
const dao = require('../../dao/dataShopperSignup');
const auth = require('../../middleware/auth');

const router = express.Router();

router.post('/create',
  body('first_name').isString().escape(),
  body('last_name').isString().escape(),
  body('email').isEmail().normalizeEmail().escape(),
  body('phone_number').isMobilePhone(['en-GB']).escape(),
  body('password').isString().isLength({ min: 8 }).escape(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      first_name: firstName, last_name: lastName, email, phone_number: phoneNumber, password,
    } = req.body;

    const hash = await bcrypt.hash(password.trim(), 10);
    const riderID = `rider_${uuidv4()}`;

    // Create new rider account
    try {
      const rider = await dao.createRiderAccount(riderID, firstName, lastName,
        email, phoneNumber, hash);
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

router.post('/login',
  body('email').isEmail().normalizeEmail().escape(),
  body('password').isString().escape(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const rider = await dao.getRiderIDAndHash(email);
      if (rider.length !== 1) {
        return res.json({ accountFound: false });
      }

      const result = await bcrypt.compare(password.trim(), rider[0].password);

      if (result !== true) {
        return res.json({ message: 'Sorry we couldn\'t log you in, it looks like your email address or password wasn\'t right' });
      }

      const JWTdata = {
        riderID: rider[0].rider_id,
        roles: ['rider'],
      };

      return jwt.sign(JWTdata, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, jwtToken) => {
        if (!err) {
          res.json({ token: jwtToken });
        } else {
          next(err);
        }
      });
    } catch (error) {
      return next(error);
    }
  });

async function generateStripeAccountLink(stripeID) {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: stripeID,
      refresh_url: 'http://localhost:8080/rider-frontend/signup/stripe/reauth/',
      return_url: 'http://localhost:8080/rider-frontend/signup/stripe/return/',
      type: 'account_onboarding',
    });

    return accountLink;
  } catch (error) {
    return error;
  }
}

router.post('/signup/stripe', auth.isAuthorizedRider, async (req, res, next) => {
  // Check if rider already has a linked stripe account if so, just generate a new account link
  // to complete onboarding via stripe
  try {
    const stripeIDResult = await dao.getStripeID(res.locals.rider);
    console.log(stripeIDResult);
    if (stripeIDResult.length > 0 && stripeIDResult[0].stripe_id !== null) {
      const newAccountLink = await generateStripeAccountLink(stripeIDResult[0].stripe_id);
      return res.json({ url: newAccountLink.url });
    }

    // Create stripe account
    const account = await stripe.accounts.create({
      country: 'GB',
      type: 'express',
      capabilities: { transfers: { requested: true } },
      business_type: 'individual',
      business_profile: { product_description: 'test' },
    });

    console.log(account);

    // Link stripe account to riderID
    const result = await dao.updateStripeAccountID(res.locals.rider, account.id);
    if (result.changedRows !== 1) {
      console.log(res.locals.rider, account.id);
      return res.status(500).json({ message: 'failed to link stripe account to rider' });
    }

    // Create stripe account link to complete onboarding via stripe
    const accountLink = await generateStripeAccountLink(account.id);

    console.log(accountLink);
    return res.json({ url: accountLink.url });
  } catch (error) {
    console.log(error);
    return res.json(error);
  }
});

router.get('/signup/stripe/reauth', auth.isAuthorizedRider, async (req, res, next) => {
  // Get customer stripe connect ID
  // And create new link for the customer to complete stripe onboarding
  try {
    const result = await dao.getStripeID(res.locals.rider);
    if (result.length === 0) {
      return res.json({ error: 'failed to find linked stripe account' });
    }
    console.log(result);

    const accountLink = await generateStripeAccountLink(result[0].stripe_id);

    return res.json({ url: accountLink.url });
  } catch (error) {
    return next(error);
  }
});

router.get('/signup/stripe/return', auth.isAuthorizedRider, async (req, res, next) => {
  // https://stripe.com/docs/connect/express-accounts#return_url

  const { rider } = res.locals;

  try {
    const result = await dao.getStripeID(rider);
    console.log(result);

    const account = await stripe.accounts.retrieve(
      result[0].stripe_id,
    );

    console.log(account);
    // If account.details_submitted is true, then we can contine onboarding the rider
    // TODO: Update signup status
    if (account.details_submitted) {
      const completeStripeSignupResult = await dao.completeStripeSignup(rider);
      if (completeStripeSignupResult.changedRows !== 1) {
        return res.status(500).json({ message: 'failed to update signup status' });
      }
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

router.get('/signup/status', auth.isAuthorizedRider, async (req, res, next) => {
  try {
    const signupStatus = await dao.getSignupStatus(res.locals.rider);
    if (signupStatus.length !== 1) {
      return res.json({ error: 'invaild signup status' });
    }

    res.json(signupStatus[0]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
