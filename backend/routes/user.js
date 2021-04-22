const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_KEY);

const dao = require('../dao/dataUser.js');

const logger = require('../middleware/logger.js');
const authorisation = require('../middleware/auth.js');

require('dotenv').config();

const router = express.Router();

router.post('/googleSignIn', async (req, res, next) => {
  const { token } = req.body;
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const googleUserID = payload.sub;

    logger.info('Google sign in or signup', { googleID: googleUserID });

    // check to see if this person already has an account using the google user_id
    // if they do issue a jwt and log them in
    try {
      const hasLinkedGoogleAcount = await dao.userByGoogleID(googleUserID);
      logger.info(`User accounts found: ${hasLinkedGoogleAcount.length}`, { googleID: googleUserID });
      if (hasLinkedGoogleAcount.length !== 0) {
        // Checking to see if more than 1 user account matches the googleID we've been given
        if (hasLinkedGoogleAcount.length > 1) {
          logger.warn('More than one userID to googleID match', { googleID: googleUserID, matched: hasLinkedGoogleAcount });
        }

        logger.info('Account found with matching googleID', { googleID: googleUserID, userID: hasLinkedGoogleAcount[0].user_id });

        const userID = hasLinkedGoogleAcount[0].user_id;
        jwt.sign({ userID }, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, jwtToken) => {
          if (!err) {
            logger.info('User signed in', { userID });
            res.json({ token: jwtToken });
          } else {
            next(err);
          }
        });
      } else {
        // if they don't create an account for them
        const userID = uuidv4();
        logger.info('Account not found via googleID', { googleID: googleUserID, userID });

        // generate a stripe customer ID
        const stripeCustomer = await stripe.customers.create({
          name: `${payload.given_name}`,
          metadata: { userID }, // Look at adding more data to the create customer part of Stripe
        });

        logger.info('Stripe Customer ID creatted', { googleID: googleUserID, userID, StripeID: stripeCustomer.id });
        // Create User account via sign in with google
        const acoountCreation = await dao.CreateAccountWithGoogleID(
          userID,
          googleUserID,
          payload.email,
          payload.given_name,
          payload.family_name,
          stripeCustomer.id,
        );

        logger.info('Customers Account Created', {
          userID,
          googleID: googleUserID,
          StripeID: stripeCustomer.id,
          dbID: acoountCreation.insertId,
        });

        jwt.sign({ userID }, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, jwtToken) => {
          if (!err) {
            logger.info('JWT Created & Sent', {
              userID,
              googleID: googleUserID,
              email: payload.email,
              firstName: payload.given_name,
              lastName: payload.family_name,
              jwt: jwtToken,
            });
            res.json({ token: jwtToken });
          } else {
            next(err);
          }
        });
      }
    } catch (error) {
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

router.get('/account', authorisation.isAuthorized, async (req, res, next) => {
  try {
    const user = await dao.getAccountInfo(res.locals.user);
    if (user) {
      logger.info('Found customers account data', { userID: res.locals.user, user });
      res.json(user);
    } else {
      logger.error('Athenticated usersID does not match customer info in DB', { userID: res.locals.user });
      res.json('User Not Found');
    }
  } catch (error) {
    next(error);
  }
});

router.get('/card', authorisation.isAuthorized, async (req, res, next) => {
  try {
    const stripeID = await dao.getStripeID(res.locals.user);

    if (stripeID === undefined) {
      logger.error('No stripeID found for customer', { userID: res.locals.user });
      next('No stripeID found for customer');
      return;
    }

    logger.info('Got StripeID to retrive cards', { userID: res.locals.user, stripeID: stripeID.stripe_id });

    const paymentMethods = await stripe.paymentMethods.list({
      customer: stripeID.stripe_id,
      type: 'card',
    });

    logger.info('Got payment methods for customer from stripe', { userID: res.locals.user, stripeID: stripeID.stripe_id });

    res.json(paymentMethods);
  } catch (error) {
    next(error);
  }
});

router.get('/addresses', authorisation.isAuthorized, async (req, res, next) => {
  try {
    const addresses = await dao.getAddresses(res.locals.user);
    if (addresses) {
      logger.info('Found customers addresses', { userID: res.locals.user });
      res.json(addresses);
    } else {
      logger.error('No addresses found', { userID: res.locals.user });
      res.sendStatus(404);
    }
  } catch (error) {
    next(error);
  }
});

router.patch('/updatePhoneNumber', authorisation.isAuthorized, async (req, res, next) => {
  const { phoneNumber } = req.body;
  logger.info('Updated phone number request', { userID: res.locals.user, phoneNumber });

  try {
    const updated = await dao.updatePhoneNumber(res.locals.user, req.body.phoneNumber);
    if (updated.changedRows === 1) {
      logger.info('Updated users phone number', { userID: res.locals.user, phoneNumber });
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    next(error);
  }
});

router.delete('/address', authorisation.isAuthorized, async (req, res, next) => {
  const { addressID } = req.query;

  try {
    const deleted = await dao.deleteAddresses(res.locals.user, addressID);
    if (deleted.changedRows !== 1) {
      logger.warn('Deleting address possibly failed or was already deleted', { userID: res.locals.user, addressID });
      res.sendStatus(500);
      return;
    }
    logger.info('Address deleted', { userID: res.locals.user, addressID });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
