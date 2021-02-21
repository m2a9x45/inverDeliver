const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const dao = require('../dao/dataUser.js');

const logger = require('../middleware/logger.js');

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

    // check to see if this person already has an account using the google user_id
    // if they do issue a jwt and log them in
    try {
      const hasLinkedGoogleAcount = await dao.userByGoogleID(googleUserID);
      console.log(hasLinkedGoogleAcount);
      if (hasLinkedGoogleAcount.length !== 0) {
        const data = hasLinkedGoogleAcount[0].user_id;
        jwt.sign({ userID: data }, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, jwtToken) => {
          if (!err) {
            logger.info('User signed in', { userID: data });
            res.json({ token: jwtToken });
          } else {
            next(err);
          }
        });
      } else {
        // if they don't create an account for them
        const userID = uuidv4();
        const acoountCreation = await dao.CreateAccountWithGoogleID(
          userID,
          googleUserID,
          payload.email,
          payload.given_name,
          payload.family_name,
        );

        console.log(acoountCreation);

        jwt.sign({ userID }, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, jwtToken) => {
          if (!err) {
            logger.info('User created', { userID });
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

module.exports = router;
