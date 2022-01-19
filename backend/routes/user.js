const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const axios = require('axios');
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const Redis = require('ioredis');
const phone = require('libphonenumber-js');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const dao = require('../dao/dataUser');
const metrics = require('./metric');

const logger = require('../middleware/logger');
const authorisation = require('../middleware/auth');
const mailgun = require('../helper/email');

require('dotenv').config();

const router = express.Router();
const redis = new Redis({
  port: 6379, // Redis port
  host: '127.0.0.1', // Redis host
  password: process.env.REDIS_PASSWORD,
});

const loginsMetric = new metrics.client.Counter({
  name: 'login_attempts',
  help: 'Total number of login attempts',
  labelNames: ['type', 'success', 'status'],
});

const createAccountMetric = new metrics.client.Counter({
  name: 'create_account_attempts',
  help: 'Total number of account creation attempts',
  labelNames: ['type', 'status'],
});

const twilioSMS = new metrics.client.Counter({
  name: 'twilio_requests',
  help: 'Totla number of twilio request',
  labelNames: ['status'],
});

const postcodeMetric = new metrics.client.Counter({
  name: 'postcode_lookup',
  help: 'Total number of postcode lookups',
  labelNames: ['type'],
});

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
  email, firstName, lastName, stripeID, ip) {
  try {
    const acoountCreation = await dao.CreateAccountWithExternalID(userID,
      externalID,
      externalType,
      email,
      firstName,
      lastName,
      stripeID,
      ip);
    createAccountMetric.inc({ type: externalType, status: 200 });
    mailgun.sendWelcomEmail(email, firstName);
    return acoountCreation;
  } catch (error) {
    createAccountMetric.inc({ type: externalType, status: 500 });
    return error;
  }
}

async function sendSMScode(SMScode, phoneNumber, userID) {
  try {
    const message = await client.messages.create({ body: `Hey 👋 your verification code is ${SMScode}`, messagingServiceSid: 'MGad653ffd0889357ac879d70dafc51478', to: phoneNumber });
    twilioSMS.inc();
    logger.info('SMS code sent', {
      userID,
      twilioRes: message.status,
      twilioSID: message.sid,
      twilioErrorCode: message.errorCode,
    });
  } catch (error) {
    logger.error('Problem sending sms code', userID);
  }
}

router.post('/googleSignIn', async (req, res, next) => {
  const { credential } = req.body;
  const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const googleUserID = payload.sub;

    logger.info('Google sign in or signup', { googleID: googleUserID, ip: req.ip });

    // check to see if this person already has an account using the google user_id
    // if they do issue a jwt and log them in
    try {
      const hasLinkedGoogleAcount = await dao.userByExternalID(googleUserID, 'GOOGLE');
      logger.info(`User accounts found: ${hasLinkedGoogleAcount.length}`, { googleID: googleUserID, ip: req.ip });
      if (hasLinkedGoogleAcount.length !== 0) {
        // Checking to see if more than 1 user account matches the googleID we've been given
        if (hasLinkedGoogleAcount.length > 1) {
          logger.warn('More than one userID to googleID match', { googleID: googleUserID, matched: hasLinkedGoogleAcount, ip: req.ip });
          loginsMetric.inc({ type: 'google', success: false, status: 500 });
          // return an error
        }

        logger.info('Account found with matching googleID', { googleID: googleUserID, userID: hasLinkedGoogleAcount[0].user_id, ip: req.ip });

        const userID = hasLinkedGoogleAcount[0].user_id;
        jwt.sign({ userID }, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, jwtToken) => {
          if (!err) {
            logger.info('User signed in', { userID, ip: req.ip });
            res.redirect(`${process.env.GOOGLE_REDIRECT_URL}/?token=${jwtToken}`);
            loginsMetric.inc({ type: 'google', success: true, status: 200 });
          } else {
            next(err);
          }
        });
      } else {
        // if they don't create an account for them
        const userID = uuidv4();
        logger.info('Account not found via googleID', { googleID: googleUserID, userID, ip: req.ip });

        // generate a stripe customer ID
        const stripeCustomer = await stripe.customers.create({
          name: `${payload.given_name}`,
          metadata: { userID }, // Look at adding more data to the create customer part of Stripe
        });

        logger.info('Stripe Customer ID creatted', {
          googleID: googleUserID, userID, StripeID: stripeCustomer.id, ip: req.ip,
        });
        // Create User account via sign in with google

        const acoountCreation = await createAccount(userID,
          googleUserID,
          'GOOGLE',
          payload.email,
          payload.given_name,
          payload.family_name,
          stripeCustomer.id,
          req.ip);

        logger.info('Customers Account Created', {
          userID,
          googleID: googleUserID,
          StripeID: stripeCustomer.id,
          dbID: acoountCreation.insertId,
          ip: req.ip,
        });

        jwt.sign({ userID }, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, jwtToken) => {
          if (!err) {
            logger.info('JWT Created & Sent', { userID, ip: req.ip });
            res.redirect(`${process.env.GOOGLE_REDIRECT_URL}/?token=${jwtToken}`);
            // res.json({ token: jwtToken });
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
        logger.warn('More than one userID to fbID match', { fbID: fbUserID, matched: hasLinkedFbAccount, ip: req.ip });
        loginsMetric.inc({ type: 'facebook', success: false, status: 500 });
      }

      logger.info('Account found with matching fbID', { fbID: fbUserID, userID: hasLinkedFbAccount[0].user_id, ip: req.ip });

      const userID = hasLinkedFbAccount[0].user_id;
      jwt.sign({ userID }, process.env.JWT_SECRET, { expiresIn: '7d' }, (error, jwtToken) => {
        if (!error) {
          logger.info('User signed in', { userID, ip: req.ip });
          res.json({ token: jwtToken });
          loginsMetric.inc({ type: 'facebook', success: true, status: 200 });
        } else {
          next(error);
        }
      });
    } else {
      // not found account so create one
      const userID = uuidv4();
      logger.info('Account not found via FBID', { fbID: fbUserID, userID, ip: req.ip });

      // get facebook profile info
      const fbUserInfo = await axios.get(`https://graph.facebook.com/me?access_token=${accessToken}&fields=id,email,first_name,last_name`);
      const payload = fbUserInfo.data;

      // generate a stripe customer ID
      const stripeCustomer = await stripe.customers.create({
        name: `${payload.first_name}`,
        metadata: { userID }, // Look at adding more data to the create customer part of Stripe
      });

      logger.info('Stripe Customer ID creatted', {
        fbID: fbUserID, userID, StripeID: stripeCustomer.id, ip: req.ip,
      });
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
        ip: req.ip,
      });

      jwt.sign({ userID }, process.env.JWT_SECRET, { expiresIn: '7d' }, (error, jwtToken) => {
        if (!error) {
          logger.info('JWT Created & Sent', { userID, ip: req.ip });
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
      logger.info('Found customers account data', { userID: res.locals.user, user, ip: req.ip });
      res.json(user);
    } else {
      logger.error('Athenticated usersID does not match customer info in DB', { userID: res.locals.user, ip: req.ip });
      res.json('User Not Found');
    }
  } catch (error) {
    next(error);
  }
});

router.post('/createAccount',
  body('email').isEmail().normalizeEmail().escape(),
  body('password').isString().escape(),
  body('name').isString().escape(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      createAccountMetric.inc({ type: 'email', status: 400 });
      return res.status(400).json({ errors: errors.array()[0] });
    }

    const { email, name, password } = req.body;

    try {
    // check that this is a new user
      const account = await dao.hasAccountByEmail(email);
      if (account.length !== 0) {
        logger.info('Account linked with that email', { email, userID: account[0].user_id, ip: req.ip });
        return res.json({ emailInUse: true });
      }
      const userID = uuidv4();
      const stripeCustomer = await stripe.customers.create({
        name,
        metadata: { userID },
      });
      logger.info('Stripe Customer ID creatted', { userID, StripeID: stripeCustomer.id, ip: req.ip });

      // hash password and store new user in database
      const hash = await bcrypt.hash(password.trim(), 10);
      const createdAccount = await dao.createAccountWithEmail(userID, email,
        name, hash, stripeCustomer.id, req.ip);

      logger.info('Account created', { userID, DBID: createdAccount.insertId, ip: req.ip });
      mailgun.sendWelcomEmail(email, name);
      // send JWT
      jwt.sign({ userID }, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, jwtToken) => {
        if (!err) {
          logger.info('JWT Created & Sent', { userID, ip: req.ip });
          createAccountMetric.inc({ type: 'email', status: 200 });
          return res.json({ token: jwtToken });
        }
        return next(err);
      });
    } catch (error) {
      createAccountMetric.inc({ type: 'email', status: 500 });
      return next(error);
    }
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
      const hash = await dao.getHash(email);
      if (hash.length !== 1) {
        logger.info('Account not found', { email, ip: req.ip });
        loginsMetric.inc({ type: 'email', success: false, status: 500 });
        return res.json({ accountFound: false });
      }

      if (hash[0].password) {
        const result = await bcrypt.compare(password.trim(), hash[0].password);

        if (result !== true) {
          logger.info('Incorrect password', { email, userID: hash[0].user_id, ip: req.ip });
          loginsMetric.inc({ type: 'email', success: false, status: 500 });
          return res.json({ message: 'Sorry we couldn\'t log you in, it looks like your email address or password wasn\'t right' });
        }

        jwt.sign({ userID: hash[0].user_id }, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, jwtToken) => {
          if (!err) {
            logger.info('JWT Created & Sent', { userID: hash[0].user_id, ip: req.ip });
            res.json({ token: jwtToken });
            loginsMetric.inc({ type: 'email', success: true, status: 200 });
          } else {
            next(err);
          }
        });
      } else {
        logger.info('Account found for social login', { userID: hash[0].user_id, email, ip: req.ip });
        res.json({ isSocial: true });
        loginsMetric.inc({ type: 'email', success: false, status: 500 });
      }
    } catch (error) {
      loginsMetric.inc({ type: 'email', success: false, status: 500 });
      next(error);
    }
  });

router.get('/hasAccount/:id', async (req, res, next) => {
  const email = req.params.id;

  try {
    const account = await dao.hasAccountByEmail(email);
    // checks if an account with that email has been found and if more than one has been found
    if (account.length === 0) {
      logger.info('No account linked with that email', { email, ip: req.ip });
      res.json({ newAccount: true });
      return;
    }

    if (account.length > 1) {
      logger.error('More than one account found for email address', { email, account, ip: req.ip });
      res.json({ message: 'Someting went wrong' });
      return;
    }

    if (account.length === 1 && account[0].external_id !== null) {
      // account exist with that email and is a social login
      logger.info('Account found with that email, linked to social login', {
        email,
        userID: account[0].user_id,
        loginType: account[0].external_type,
        ip: req.ip,
      });
      res.json({
        newAccount: false,
        isSocial: true,
        socialType: account[0].external_type,
      });
      return;
    }

    if (account.length === 1 && account[0].external_id === null) {
      // account exist with that email and isn't a social login
      logger.info('Account found with that email', { email, ip: req.ip });
      res.json({ newAccount: false, isSocial: false });
    }
    return;
  } catch (error) {
    next(error);
  }
});

router.get('/card', authorisation.isAuthorized, async (req, res, next) => {
  try {
    const { stripe_id: stripeID } = await dao.getStripeID(res.locals.user);

    if (stripeID === undefined || stripeID === '') {
      logger.error('No stripeID found for customer', { userID: res.locals.user, ip: req.ip });
      return res.status(500);
    }

    logger.info('Got StripeID to retrive cards', { userID: res.locals.user, stripeID, ip: req.ip });

    const paymentMethods = await stripe.paymentMethods.list({
      customer: stripeID,
      type: 'card',
    });

    logger.info('Got payment methods for customer from stripe', { userID: res.locals.user, stripeID, ip: req.ip });

    return res.json(paymentMethods);
  } catch (error) {
    return next(error);
  }
});

router.get('/addresses', authorisation.isAuthorized, async (req, res, next) => {
  try {
    const addresses = await dao.getAddresses(res.locals.user);
    if (addresses) {
      logger.info('Found customers addresses', { userID: res.locals.user, ip: req.ip });
      res.json(addresses);
    } else {
      logger.error('No addresses found', { userID: res.locals.user, ip: req.ip });
      res.sendStatus(404);
    }
  } catch (error) {
    next(error);
  }
});

router.post('/postcodeLookup', authorisation.isAuthorized, body('postCode').isPostalCode('GB').escape(),
  body('storeID').isString().escape(), async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors });
    }

    const { postCode, storeID } = req.body;
    logger.info('postcode lookup started', { userID: res.locals.user, postCode, ip: req.ip });

    const postCodeParsed = postCode.replace(/\s/g, '');
    const regixPostCode = postCodeParsed.toUpperCase().match(/^[A-Z][A-Z]{0,1}[0-9][A-Z0-9]{0,1}[0-9]/);

    if (regixPostCode === null) {
      logger.warn('regix failed to find postcode', { userID: res.locals.user, postCode: postCodeParsed, ip: req.ip });
      postcodeMetric.inc({ type: 'not_postcode' });
      return res.json({ withInOpArea: false, message: 'Sorry something went wrong, it does not look like you have entered a vaild postcode' });
    }

    // checing to see if the postcode sector the user has entered is one that we operater in
    try {
      const { operates: addressAddable } = await dao.isDeliveryAddressWithinOperatingArea(storeID,
        regixPostCode[0]);

      if (addressAddable === 0) {
        logger.warn('Delivery address outside of operating area', {
          userID: res.locals.user,
          postCode: postCodeParsed,
          postCodeSector: regixPostCode[0],
          storeID,
          ip: req.ip,
        });
        postcodeMetric.inc({ type: 'outside_operating_area' });
        return res.json({ withInOpArea: false, message: 'Sorry something went wrong the selected postcode is not part of this shops operating area' });
      }
    } catch (error) {
      next(error);
    }

    // Perform the same check when we try and create an order

    try {
      const response = await axios.get(`https://ws.postcoder.com/pcw/${process.env.POSTCODER_API_KEY}/address/UK/${postCode}?format=json&lines=2&addtags=latitude,longitude`);
      postcodeMetric.inc({ type: 'postcode_lookup' });

      if (response.status !== 200) {
        logger.error('Postcoder lookup error', { status: response.status, errorMessage: response.statusText, ip: req.ip });
        postcodeMetric.inc({ type: 'postcode_lookup_error' });
        return res.json({
          lookupSuccess: false,
          message: 'Something went wrong whilst looking up your address, please let us know if this continues',
        });
      }

      res.json(response.data);
    } catch (error) {
      next(error);
    }
  });

router.post('/addAddress', authorisation.isAuthorized,
  body('addressline1').isString().escape(),
  body('addressline2').isString().escape(),
  body('county').isString().escape(),
  body('grideasting').isNumeric().escape(),
  body('gridnorthing').isNumeric().escape(),
  body('latitude').isNumeric().escape(),
  body('longitude').isNumeric().escape(),
  body('number').isNumeric().escape(),
  body('postcode').isString().escape(),
  body('posttown').isString().escape(),
  body('premise').isString().escape(),
  body('street').isString().escape(),
  body('subbuildingname').isString().escape(),
  body('summaryline').isString().escape(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors });
    }

    const address = req.body;

    try {
      const addressID = uuidv4();
      const addressDBInsertID = await dao.addAddress(res.locals.user, addressID, `${address.premise} ${address.street}`,
        address.posttown, address.postcode, address.latitude, address.longitude);

      logger.info('Address added', { addressID, dbInsertID: addressDBInsertID.insertId, ip: req.ip });
      return res.sendStatus(201);
    } catch (error) {
      logger.error('Error adding address', error);
      return next(error);
    }
  });

router.delete('/address', authorisation.isAuthorized, async (req, res, next) => {
  const { addressID } = req.query;

  try {
    const deleted = await dao.deleteAddresses(res.locals.user, addressID);
    if (deleted.changedRows !== 1) {
      logger.warn('Deleting address possibly failed or was already deleted', { userID: res.locals.user, addressID, ip: req.ip });
      res.sendStatus(500);
      return;
    }
    logger.info('Address deleted', { userID: res.locals.user, addressID, ip: req.ip });
    res.sendStatus(204);
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

router.patch('/updatePhoneNumber', authorisation.isAuthorized,
  body('SMScode').isNumeric().isLength({ min: 5, max: 5 }),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid SMS code' });
    }

    const { SMScode } = req.body;
    logger.info('Updated phone number request', { userID: res.locals.user, SMScode, ip: req.ip });

    const result = await redis.get(res.locals.user);
    logger.info('redis code for the user', {
      userID: res.locals.user, SMScode, redisCode: result, ip: req.ip,
    });

    if (SMScode === result) {
      logger.info('SMS code matches redis code for user', {
        userID: res.locals.user, SMScode, redisCode: result, ip: req.ip,
      });
      const validateNumber = await dao.validatePhoneNumber(res.locals.user);
      if (validateNumber.affectedRows !== 1) {
        logger.warn('Phone number not updated, either no number was updated or too many were',
          { userID: res.locals.user, ip: req.ip });
        return res.status(500).json({ error: 'Something went wrong when trying to verify your number' });
      }
      res.sendStatus(201);
    } else {
      logger.info('Could not validate phone number', {
        userID: res.locals.user, SMScode, redisCode: result, ip: req.ip,
      });
      res.status(400).json({ error: 'Sadly we can not validate your phone number' });
    }
  });

router.post('/generateSMScode', authorisation.isAuthorized,
  body('phoneNumber').isMobilePhone(['en-GB']),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid Phone Number' });
    }

    const { phoneNumber } = req.body;
    logger.info('asked to generate a new SMS verfication code', { userID: res.locals.user, phoneNumber, ip: req.ip });
    try {
      const phoneNumberParsed = phone.parsePhoneNumber(phoneNumber, 'GB');
      logger.info('Parseed phone number', {
        userID: res.locals.user, phoneNumber, parsedPhoneNumber: phoneNumberParsed.number, ip: req.ip,
      });

      const updated = await dao.updatePhoneNumber(res.locals.user, phoneNumberParsed.number);
      if (updated.changedRows === 1) {
        logger.info('Adding unverfied phone number to database', { userID: res.locals.user, parsedPhoneNumber: phoneNumberParsed.number, ip: req.ip });

        const SMScode = Math.floor(Math.random() * 99999) + 10000;
        // Add error checking for redis set
        // SMS code will expiry in 4 hours
        redis.set(res.locals.user, SMScode, 'ex', 14400);
        logger.info('SMS code generated and added to redis', {
          userID: res.locals.user, SMScode, parsedPhoneNumber: phoneNumberParsed.number, ip: req.ip,
        });
        // Send Verification SMS code.
        await sendSMScode(SMScode, phoneNumberParsed.number, res.locals.user);

        res.sendStatus(204);
      } else {
        logger.error('The number of rows in the DB that were updated was not 1', { userID: res.locals.user, parsedPhoneNumber: phoneNumberParsed.number, ip: req.ip });
        res.sendStatus(404);
      }
    } catch (error) {
      res.status(500);
      next(error);
    }
  });

router.patch('/resendSMS', authorisation.isAuthorized, async (req, res, next) => {
  const SMScode = await redis.get(res.locals.user);

  try {
    const phoneData = await dao.getPhoneNumber(res.locals.user);

    if (phoneData.phone_number === null) {
      logger.warn('No phone number found, when trying to resend SMS code', { userID: res.locals.user, ip: req.ip });
      return res.sendStatus(500);
    }

    if (SMScode === null) {
      const newSMScode = Math.floor(Math.random() * 99999) + 10000;
      redis.set(res.locals.user, newSMScode, 'ex', 14400);
      logger.info('New SMS code set', {
        newSMScode, userID: res.locals.user, phoneNumber: phoneData.phone_number, ip: req.ip,
      });
      await sendSMScode(newSMScode, phoneData.phone_number, res.locals.user);
      return res.sendStatus(204);
    }
    logger.info('SMS code resent', {
      SMScode, userID: res.locals.user, phoneNumber: phoneData.phone_number, ip: req.ip,
    });
    await sendSMScode(SMScode, phoneData.phone_number, res.locals.user);
    return res.sendStatus(204);
  } catch (error) {
    return next(error);
  }
});

router.post('/sendPasswordResetLink', body('email').isEmail().normalizeEmail().escape(), async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Invalid Email Address' });
  }

  const { email } = req.body;

  try {
    const user = await dao.getHash(email);

    if (user.length === 0) {
      logger.info('No user found with that email, skipping sending reset email', { email });
      return res.status(200).send();
    }

    // Check if a password reset link already exists
    const existingPasswordResetRequest = await dao.getPasswordResetLink(user[0].user_id);

    if (existingPasswordResetRequest) {
      console.log(`http://localhost:8080/frontend/forgot/verfiy?token=${existingPasswordResetRequest.reset_code}`);
      // mailgun.sendPasswordResetEmail(email, `https://inverdeliver.com/forgot/verfiy?token=${existingPasswordResetRequest.reset_code}`);
      return res.status(200).send();
    }

    const resetTokenBytes = crypto.randomBytes(128);
    const resetToken = resetTokenBytes.toString('hex');

    // Time in seconds, 3600 = 1 Hour, 10800 = 3 hours
    const expiryTimeInSec = Math.floor(new Date() / 1000 + 10800);

    // Save expiry time and reset token with userID in DB
    const addedResetRow = await dao.addPasswordResetLink(user[0].user_id, req.ip,
      resetToken, expiryTimeInSec);

    if (!addedResetRow.insertId) {
      logger.error('Failed to insert reset link into database', {
        userID: user[0].user_id,
        ip: req.ip,
        resetToken,
        expiryTimeInSec,
      });
      res.status(500).json({ error: 'Failed to insert reset link into database' });
    }

    console.log(`http://localhost:8080/frontend/forgot/verfiy?token=${resetToken}`);
    const resetLink = `https://inverdeliver.com/forgot/verfiy?token=${resetToken}`;

    // mailgun.sendPasswordResetEmail(email, resetLink);
    res.status(200).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
