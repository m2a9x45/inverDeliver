const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const axios = require('axios');
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const Redis = require('ioredis');
const phone = require('libphonenumber-js');
const bcrypt = require('bcrypt');

const dao = require('../dao/dataUser.js');

const logger = require('../middleware/logger.js');
const authorisation = require('../middleware/auth.js');

require('dotenv').config();

const router = express.Router();
const redis = new Redis();

async function checkUsersFbToken(accessToken, userID) {
  try {
    const fbDataRes = await axios.get(`https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${process.env.FB_APP_ACCESS_TOKEN}`);
    const fbData = fbDataRes.data.data;

    logger.info('Facebook data for verfiying accessToken', { appID: fbData.app_id, userID: fbData.user_id });

    if (fbData.is_valid === true && process.env.FB_APPID === fbData.app_id
       && userID === fbData.user_id) {
      logger.info('Verfided access token matches userID and AppID expected', { appID: process.env.FB_APPID, userID });
      return null;
    }
    logger.warn('Something went wrong vaildating the users fb access token', {
      appID: fbData.app_id,
      userID: fbData.user_id,
      error: fbData.error.message,
      errorCode: fbData.error.code,
    });
    return fbData.error;
  } catch (error) {
    return (error);
  }
}

async function createAccount(userID, externalID, externalType,
  email, firstName, lastName, stripeID) {
  try {
    const acoountCreation = await dao.CreateAccountWithExternalID(userID,
      externalID,
      externalType,
      email,
      firstName,
      lastName,
      stripeID);
    return acoountCreation;
  } catch (error) {
    return error;
  }
}

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
      const hasLinkedGoogleAcount = await dao.userByExternalID(googleUserID, 'GOOGLE');
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

        const acoountCreation = await createAccount(userID,
          googleUserID,
          'GOOGLE',
          payload.email,
          payload.given_name,
          payload.family_name,
          stripeCustomer.id);

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

router.post('/fbSignIn', async (req, res, next) => {
  console.log(req.body);
  const { accessToken } = req.body;
  const fbUserID = req.body.userID;

  const err = await checkUsersFbToken(accessToken, fbUserID);
  if (err) {
    return res.status(400).json(err);
  }

  // check to see if user allready has an account
  try {
    const hasLinkedFbAccount = await dao.userByExternalID(fbUserID, 'FB');
    if (hasLinkedFbAccount.length !== 0) {
      if (hasLinkedFbAccount.length > 1) {
        logger.warn('More than one userID to fbID match', { fbID: fbUserID, matched: hasLinkedFbAccount });
      }

      logger.info('Account found with matching fbID', { fbID: fbUserID, userID: hasLinkedFbAccount[0].user_id });

      const userID = hasLinkedFbAccount[0].user_id;
      jwt.sign({ userID }, process.env.JWT_SECRET, { expiresIn: '7d' }, (error, jwtToken) => {
        if (!error) {
          logger.info('User signed in', { userID });
          res.json({ token: jwtToken });
        } else {
          next(error);
        }
      });
    } else {
      // not found account so create one
      const userID = uuidv4();
      logger.info('Account not found via FBID', { fbID: fbUserID, userID });

      // get facebook profile info
      const fbUserInfo = await axios.get(`https://graph.facebook.com/me?access_token=${accessToken}&fields=id,email,first_name,last_name`);
      const payload = fbUserInfo.data;

      // generate a stripe customer ID
      const stripeCustomer = await stripe.customers.create({
        name: `${payload.first_name}`,
        metadata: { userID }, // Look at adding more data to the create customer part of Stripe
      });

      logger.info('Stripe Customer ID creatted', { fbID: fbUserID, userID, StripeID: stripeCustomer.id });
      // Create User account via sign in with google
      const acoountCreation = await createAccount(userID,
        fbUserID,
        'FB',
        payload.email,
        payload.first_name,
        payload.last_name,
        stripeCustomer.id);

      logger.info('Customers Account Created', {
        userID,
        fbID: fbUserID,
        StripeID: stripeCustomer.id,
        dbID: acoountCreation.insertId,
      });

      jwt.sign({ userID }, process.env.JWT_SECRET, { expiresIn: '7d' }, (error, jwtToken) => {
        if (!error) {
          logger.info('JWT Created & Sent', {
            userID,
            fbID: fbUserID,
            email: payload.email,
            firstName: payload.first_name,
            lastName: payload.last_name,
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

router.post('/createAccount', async (req, res, next) => {
  const { email, name, password } = req.body;

  try {
    // check that this is a new user
    const account = await dao.hasAccountByEmail(email);
    if (account.length !== 0) {
      logger.info('Account linked with that email', { email, userID: account[0].user_id });
      res.json({ newAccount: false });
      return;
    }
    const userID = uuidv4();
    const stripeCustomer = await stripe.customers.create({
      name,
      metadata: { userID },
    });
    logger.info('Stripe Customer ID creatted', { userID, StripeID: stripeCustomer.id });

    // hash password and store new user in database
    bcrypt.hash(password.trim(), 10, (err, hash) => {
      console.log(err, hash);
      // if no error store hashed password in DB
      try {
        const addedUser = await dao.
      } catch (error) {
  
      }
  
    });
  } catch (error) {
    next(error);
  }


});

router.get('/hasAccount/:id', async (req, res, next) => {
  const email = req.params.id;

  try {
    const account = await dao.hasAccountByEmail(email);
    // checks if an account with that email has been found and if more than one has been found
    if (account.length === 0) {
      logger.info('No account linked with that email', { email });
      res.json({ newAccount: true });
      return;
    }

    if (account.length > 1) {
      logger.error('More than one account found for email address', { email, account });
      res.json({ message: 'Someting went wrong' });
      return;
    }

    if (account.length === 1 && account[0].externalID !== null) {
      // account exist with that email and is a social login
      logger.info('Account found with that email, linked to social login', {
        email,
        userID: account[0].user_id,
        loginType: account[0].external_type,
      });
      res.json({
        isSocial: true,
        socialType: account[0].external_type,
      });
      return;
    }

    if (account.length === 1 && account[0].externalID === null) {
      // account exist with that email and isn't a social login
      logger.info('Account found with that email', { email });
      res.json({ isSocial: false });
    }
    return;
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

router.get('/phoneNumber', authorisation.isAuthorized, async (req, res, next) => {
  try {
    const phoneNumberInfo = await dao.getPhoneNumber(res.locals.user);
    res.json(phoneNumberInfo);
  } catch (error) {
    next(error);
  }
});

router.patch('/updatePhoneNumber', authorisation.isAuthorized, async (req, res, next) => {
  const { SMScode } = req.body;
  logger.info('Updated phone number request', { userID: res.locals.user, SMScode });

  const result = await redis.get(res.locals.user);
  logger.info('redis code for the user', { userID: res.locals.user, SMScode, redis: result });

  if (SMScode === result) {
    logger.info('SMS code matches redis code for user', { userID: res.locals.user, SMScode, redisCode: result });
    const validateNumber = await dao.validatePhoneNumber(res.locals.user);
    if (validateNumber.affectedRows !== 1) {
      logger.warn('Phone number not updated, either no number was updated or too many werer',
        { userID: res.locals.user });
      next('Something went wrong vaildating oyur phone number');
      return;
    }
    res.sendStatus(201);
  } else {
    logger.info('Could not validate phone number', { userID: res.locals.user, SMScode, redisCode: result });
    res.json({ error: 'Sadly we can not validate your phone number' });
  }
});

router.post('/generateSMScode', authorisation.isAuthorized, async (req, res, next) => {
  const { phoneNumber } = req.body;
  logger.info('asked to generate a new SMS verfication code', { userID: res.locals.user, phoneNumber });
  try {
    const phoneNumberParsed = phone.parsePhoneNumber(phoneNumber, 'GB');
    logger.info('Parseed phone number', { userID: res.locals.user, phoneNumber, parsedPhoneNumber: phoneNumberParsed.number });
    const SMScode = Math.floor(Math.random() * 99999) + 10000;

    // Add error checking for redis set
    redis.set(res.locals.user, SMScode);
    logger.info('SMS code generated and added to redis', { userID: res.locals.user, SMScode, parsedPhoneNumber: phoneNumberParsed.number });

    // Send Verification SMS code.
    // client.messages
    //   .create({
    //     body: `Hey 👋 your verfication code is ${SMScode}`,
    //     from: '+17608535041',
    //     to: '+447561161109',
    //   })
    //   .then((message) => console.log(message));

    const updated = await dao.updatePhoneNumber(res.locals.user, phoneNumberParsed.number);
    if (updated.changedRows === 1) {
      logger.info('Adding unverfied phone number to database', { userID: res.locals.user, parsedPhoneNumber: phoneNumberParsed.number });
      res.sendStatus(204);
    } else {
      logger.error('The number of rows in the DB that were updated was not 1', { userID: res.locals.user, parsedPhoneNumber: phoneNumberParsed.number });
      res.sendStatus(404);
    }
  } catch (error) {
    res.status(500);
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
