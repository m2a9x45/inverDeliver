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

const dao = require('../dao/dataUser');
const metrics = require('./metric');

const logger = require('../middleware/logger');
const authorisation = require('../middleware/auth');

require('dotenv').config();

const router = express.Router();
const redis = new Redis();

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
  email, firstName, lastName, stripeID) {
  try {
    const acoountCreation = await dao.CreateAccountWithExternalID(userID,
      externalID,
      externalType,
      email,
      firstName,
      lastName,
      stripeID);
    createAccountMetric.inc({ type: externalType, status: 200 });
    return acoountCreation;
  } catch (error) {
    createAccountMetric.inc({ type: externalType, status: 500 });
    return error;
  }
}

async function sendSMScode(SMScode, phoneNumber, userID) {
  try {
    const message = await client.messages.create({ body: `Hey 👋 your verfication code is ${SMScode}`, messagingServiceSid: 'MGad653ffd0889357ac879d70dafc51478', to: phoneNumber });
    twilioSMS.inc();
    logger.info('SMS code sent', {
      userID,
      twilioRes: message.status,
      twilioSID: message.sid,
      twllioErrorCode: message.errorCode,
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
          loginsMetric.inc({ type: 'google', success: false, status: 500 });
          // return an error
        }

        logger.info('Account found with matching googleID', { googleID: googleUserID, userID: hasLinkedGoogleAcount[0].user_id });

        const userID = hasLinkedGoogleAcount[0].user_id;
        jwt.sign({ userID }, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, jwtToken) => {
          if (!err) {
            logger.info('User signed in', { userID });
            res.redirect(`${process.env.GOOGLE_REDIRECT_URL}/?token=${jwtToken}`);
            loginsMetric.inc({ type: 'google', success: true, status: 200 });
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
            res.redirect(`http://localhost:8080/frontend/?token=${jwtToken}`);
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
        logger.warn('More than one userID to fbID match', { fbID: fbUserID, matched: hasLinkedFbAccount });
        loginsMetric.inc({ type: 'facebook', success: false, status: 500 });
      }

      logger.info('Account found with matching fbID', { fbID: fbUserID, userID: hasLinkedFbAccount[0].user_id });

      const userID = hasLinkedFbAccount[0].user_id;
      jwt.sign({ userID }, process.env.JWT_SECRET, { expiresIn: '7d' }, (error, jwtToken) => {
        if (!error) {
          logger.info('User signed in', { userID });
          res.json({ token: jwtToken });
          loginsMetric.inc({ type: 'facebook', success: true, status: 200 });
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

router.post('/createAccount',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 7 }),
  body('name').isAlphanumeric(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      createAccountMetric.inc({ type: 'email', status: 400 });
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name, password } = req.body;

    try {
    // check that this is a new user
      const account = await dao.hasAccountByEmail(email);
      if (account.length !== 0) {
        logger.info('Account linked with that email', { email, userID: account[0].user_id });
        return res.json({ emailInUse: true });
      }
      const userID = uuidv4();
      const stripeCustomer = await stripe.customers.create({
        name,
        metadata: { userID },
      });
      logger.info('Stripe Customer ID creatted', { userID, StripeID: stripeCustomer.id });

      // hash password and store new user in database
      const hash = await bcrypt.hash(password.trim(), 10);
      const createdAccount = await dao.createAccountWithEmail(userID, email,
        name, hash, stripeCustomer.id);

      logger.info('Account created', { userID, DBID: createdAccount.insertId });
      // send JWT
      jwt.sign({ userID }, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, jwtToken) => {
        if (!err) {
          logger.info('JWT Created & Sent', { userID, jwt: jwtToken });
          res.json({ token: jwtToken });
          createAccountMetric.inc({ type: 'email', status: 200 });
        }
        next(err);
      });
    } catch (error) {
      createAccountMetric.inc({ type: 'email', status: 500 });
      next(error);
    }
  });

router.post('/login',
  body('email').isEmail(),
  body('password').isLength({ min: 7 }),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      const hash = await dao.getHash(email);
      if (hash.length !== 1) {
        logger.info('Account not found', { email });
        loginsMetric.inc({ type: 'email', success: false, status: 500 });
        return res.json({ accountFound: false });
      }

      if (hash[0].password) {
        const result = await bcrypt.compare(password.trim(), hash[0].password);

        if (result !== true) {
          logger.info('Incorrect password', { email, userID: hash[0].user_id });
          loginsMetric.inc({ type: 'email', success: false, status: 500 });
          return res.json({ message: 'Sorry we couldn\'t log you in, it looks like your email address or password wasn\'t right' });
        }

        jwt.sign({ userID: hash[0].user_id }, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, jwtToken) => {
          if (!err) {
            logger.info('JWT Created & Sent', { userID: hash[0].user_id, jwt: jwtToken });
            res.json({ token: jwtToken });
            loginsMetric.inc({ type: 'email', success: true, status: 200 });
          } else {
            next(err);
          }
        });
      } else {
        logger.info('Account found for social login', { userID: hash[0].user_id, email });
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
      logger.info('No account linked with that email', { email });
      res.json({ newAccount: true });
      return;
    }

    if (account.length > 1) {
      logger.error('More than one account found for email address', { email, account });
      res.json({ message: 'Someting went wrong' });
      return;
    }

    if (account.length === 1 && account[0].external_id !== null) {
      // account exist with that email and is a social login
      logger.info('Account found with that email, linked to social login', {
        email,
        userID: account[0].user_id,
        loginType: account[0].external_type,
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
      logger.info('Account found with that email', { email });
      res.json({ newAccount: false, isSocial: false });
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

router.post('/postcodeLookup', authorisation.isAuthorized, body('postCode').isPostalCode('GB'), async (req, res, next) => {
  const { postCode } = req.body;
  logger.info('postcode lookup started', { userID: res.locals.user, postCode });
  // add new address to DB
  const postCodeParsed = postCode.replace(/\s/g, '');
  const regixPostCode = postCodeParsed.toUpperCase().match(/^[A-Z][A-Z]{0,1}[0-9][A-Z0-9]{0,1}[0-9]/);

  if (regixPostCode === null) {
    logger.warn('regix failed to find postcode', { userID: res.locals.user, postCode: postCodeParsed });
    postcodeMetric.inc({ type: 'not_postcode' });
    return res.json({ withInOpArea: false, message: 'Sorry something went wrong, it does not look like you have entered a vaild postcode' });
  }

  // List of postcode sectors where we operater
  const operatingArea = ['EH11', 'EH12', 'EH13', 'EH21', 'EH22', 'EH23', 'EH24', 'EH35', 'EH36', 'EH37', 'EH38', 'EH39',
    'EH126', 'EH125', 'EH112', 'EH111', 'EH104', 'EH165', 'EH91', 'EH92', 'EH89', 'EH89', 'EH87', 'EH88', 'EH75', 'EH74', 'EH41', 'EH42', 'EH43'];

  // checing to see if the postcode sector the user has entered is one that we operater in
  if (!operatingArea.includes(regixPostCode[0])) {
    logger.warn('Deliver address outside of operating area', { userID: res.locals.user, postCode: postCodeParsed, postCodeSector: regixPostCode[0] });
    postcodeMetric.inc({ type: 'outside_operating_are' });
    return res.json({ withInOpArea: false, message: 'Sorry something went wrong the selected postcode is not part of our operating area' });
  }

  // const addresses = await axios.get(`https://ws.postcoder.com/pcw/${process.env.POSTCODER_API_KEY}/address/UK/${postCode}?format=json&lines=2&addtags=latitude,longitude`);

  postcodeMetric.inc({ type: 'postcode_lookup' });

  const data = [
    {
      addressline1: 'Flat 7',
      addressline2: '64 Duff Street',
      summaryline: 'Flat 7, 64 Duff Street, Edinburgh, City of Edinburgh, EH11 2JD',
      subbuildingname: 'Flat 7',
      number: '64',
      premise: 'Flat 7, 64',
      street: 'Duff Street',
      posttown: 'Edinburgh',
      county: 'City of Edinburgh',
      postcode: 'EH11 2JD',
      latitude: '55.9420018154',
      longitude: '-3.2266079932',
      grideasting: '323483',
      gridnorthing: '672786',
    },
    {
      addressline1: 'Flat 8',
      addressline2: '64 Duff Street',
      summaryline: 'Flat 8, 64 Duff Street, Edinburgh, City of Edinburgh, EH11 2JD',
      subbuildingname: 'Flat 8',
      number: '64',
      premise: 'Flat 8, 64',
      street: 'Duff Street',
      posttown: 'Edinburgh',
      county: 'City of Edinburgh',
      postcode: 'EH11 2JD',
      latitude: '55.9420018154',
      longitude: '-3.2266079932',
      grideasting: '323483',
      gridnorthing: '672786',
    },
  ];

  res.json(data);
});

router.post('/addAddress', authorisation.isAuthorized, async (req, res, next) => {
  const { address } = req.body;

  try {
    const addressDBInsertID = await dao.addAddress(res.locals.user, uuidv4(), `${address.premise} ${address.street}`,
      address.posttown, address.postcode, address.latitude, address.longitude);

    console.log(addressDBInsertID.insertId);

    res.sendStatus(201);
  } catch (error) {
    console.log(error);
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
    logger.info('Updated phone number request', { userID: res.locals.user, SMScode });

    const result = await redis.get(res.locals.user);
    console.log('redis result', result);
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
      // If SMScode has been validated we should remobe the SMS code from redis to stop repeat request
      res.sendStatus(201);
    } else {
      logger.info('Could not validate phone number', { userID: res.locals.user, SMScode, redisCode: result });
      res.json({ error: 'Sadly we can not validate your phone number' });
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
    logger.info('asked to generate a new SMS verfication code', { userID: res.locals.user, phoneNumber });
    try {
      const phoneNumberParsed = phone.parsePhoneNumber(phoneNumber, 'GB');
      logger.info('Parseed phone number', { userID: res.locals.user, phoneNumber, parsedPhoneNumber: phoneNumberParsed.number });

      const updated = await dao.updatePhoneNumber(res.locals.user, phoneNumberParsed.number);
      if (updated.changedRows === 1) {
        logger.info('Adding unverfied phone number to database', { userID: res.locals.user, parsedPhoneNumber: phoneNumberParsed.number });

        const SMScode = Math.floor(Math.random() * 99999) + 10000;
        // Add error checking for redis set
        // SMS code will expiry in 4 hours
        redis.set(res.locals.user, SMScode, 'ex', 14400);
        logger.info('SMS code generated and added to redis', { userID: res.locals.user, SMScode, parsedPhoneNumber: phoneNumberParsed.number });
        // Send Verification SMS code.
        await sendSMScode(SMScode, phoneNumberParsed.number, res.locals.user);

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

router.patch('/resendSMS', authorisation.isAuthorized, async (req, res, next) => {
  const SMScode = await redis.get(res.locals.user);

  try {
    const phoneData = await dao.getPhoneNumber(res.locals.user);

    if (phoneData.phone_number === null) {
      logger.warn('No phone number found, when trying to resend SMS code', { userID: res.locals.user });
      return res.sendStatus(500);
    }

    if (SMScode === null) {
      const newSMScode = Math.floor(Math.random() * 99999) + 10000;
      redis.set(res.locals.user, newSMScode, 'ex', 14400);
      logger.info('New SMS code set', { newSMScode, userID: res.locals.user, phoneNumber: phoneData.phone_number });
      // await sendSMScode(newSMScode, phoneData.phone_number, res.locals.user);
      return res.sendStatus(204);
    }
    logger.info('SMS code resent', { SMScode, userID: res.locals.user, phoneNumber: phoneData.phone_number });
    // await sendSMScode(SMScode, phoneData.phone_number, res.locals.user);
    return res.sendStatus(204);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
