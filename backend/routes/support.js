const express = require('express');
const { body, validationResult } = require('express-validator');
const metrics = require('./metric');
const logger = require('../middleware/logger.js');

const slack = require('../helper/slack');

require('dotenv').config();

const router = express.Router();

const callbackMetric = new metrics.client.Counter({
  name: 'callback_requests',
  help: 'Total number of callback requests',
  labelNames: ['status'],
});

router.post('/callback',
  body('email').isEmail().normalizeEmail().escape(),
  body('phoneNumber').optional({ checkFalsy: true }).isMobilePhone(['en-GB']).escape(),
  body('issue').isString().isLength({ max: 1024 }).escape(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error('Bad Request', { ip: req.ip, error: errors.array() });
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, issue, phoneNumber } = req.body;

    logger.info('Callback request made', { ip: req.ip, email, phoneNumber });

    // We should probably try to match the email/phone number to an account

    try {
      const slackMessageSent = await slack.sendCallbackRequestNotification(email,
        phoneNumber, issue);

      if (slackMessageSent.ok === false) {
        callbackMetric.inc({ status: 500 });
        logger.error('Message failed to send to slack', {
          error: slackMessageSent.error, ip: req.ip, email, phoneNumber,
        });
        return res.status(500).send();
      }

      callbackMetric.inc({ status: 204 });
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

module.exports = router;
